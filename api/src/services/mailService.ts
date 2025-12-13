import fs from 'node:fs/promises'
import path from 'node:path'
import validator from 'validator'
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'
import * as logger from '../common/logger'
import MarketingEmailStat from '../models/MarketingEmailStat'
import User from '../models/User'

type StringMap = Record<string, string | number>

interface MailjetModule {
  apiConnect: (publicKey: string, privateKey: string) => {
    post: (resource: string, options?: Record<string, unknown>) => {
      request: (payload: unknown) => Promise<unknown>
    }
  }
}

let cachedTemplate: string | null = null
let cachedMailjet: ReturnType<MailjetModule['apiConnect']> | null = null
let testMailjetClient: ReturnType<MailjetModule['apiConnect']> | null | undefined
let testTransportFactory: (() => { sendMail: (options: nodemailer.SendMailOptions) => Promise<unknown> }) | null | undefined

const isMailjetProvider = () => env.EMAIL_PROVIDER?.toLowerCase() === 'mailjet'

const getTemplate = async (): Promise<string> => {
  if (cachedTemplate) {
    return cachedTemplate
  }

  try {
    const templatePath = path.resolve(process.cwd(), 'templates/emails/marketing-default.html')
    cachedTemplate = await fs.readFile(templatePath, { encoding: 'utf8' })
  } catch (err) {
    logger.error('Unable to load marketing template', err)
    cachedTemplate = '<p>Bonjour {{var:prenom}}, profitez de nos offres sur {{var:voiture}} dès {{var:prix}} TND/jour.</p>'
  }

  return cachedTemplate
}

export const __setTestMailjetClient = (client: ReturnType<MailjetModule['apiConnect']> | null | undefined) => {
  testMailjetClient = client
}

export const __setTestTransportFactory = (factory: (() => { sendMail: (options: nodemailer.SendMailOptions) => Promise<unknown> }) | null | undefined) => {
  testTransportFactory = factory
}

const renderTemplate = async (variables: StringMap): Promise<string> => {
  const template = await getTemplate()

  return Object.entries(variables).reduce((acc, [key, value]) => {
    const token = new RegExp(`{{var:${key}}}`, 'g')
    return acc.replace(token, String(value))
  }, template)
}

const dayStart = (value: Date) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))

const getDailyStat = async (date = new Date()) => {
  const start = dayStart(date)

  return MarketingEmailStat.findOneAndUpdate(
    { date: start },
    { $setOnInsert: { sentCount: 0, openCount: 0, clickCount: 0 } },
    { new: true, upsert: true },
  ).lean()
}

const incrementDailySend = async () => {
  const start = dayStart(new Date())
  await MarketingEmailStat.updateOne({ date: start }, { $inc: { sentCount: 1 } }, { upsert: true })
}

const canSendMoreToday = async () => {
  if (!env.EMAIL_DAILY_LIMIT) {
    return true
  }

  const stats = await getDailyStat()
  return (stats?.sentCount || 0) < env.EMAIL_DAILY_LIMIT
}

const buildMailjetClient = async () => {
  if (!isMailjetProvider()) {
    return null
  }

  if (typeof testMailjetClient !== 'undefined') {
    return testMailjetClient
  }

  if (!env.MJ_APIKEY_PUBLIC || !env.MJ_APIKEY_PRIVATE) {
    return null
  }

  if (cachedMailjet) {
    return cachedMailjet
  }

  const mailjetModule = await import('node-mailjet')
    .then((module) => module as unknown as MailjetModule)
    .catch((err) => {
      logger.error('Mailjet SDK unavailable', err)
      return null as unknown as MailjetModule
    })
  if (!mailjetModule) {
    return null
  }
  cachedMailjet = mailjetModule.apiConnect(env.MJ_APIKEY_PUBLIC, env.MJ_APIKEY_PRIVATE)

  return cachedMailjet
}

const sendThroughMailjet = async (to: string, variables: StringMap, subject: string) => {
  const mailjet = await buildMailjetClient()
  if (!mailjet) {
    return null
  }

  const html = await renderTemplate(variables)
  const payload = {
    Messages: [
      {
        From: {
          Email: env.MJ_SENDER_EMAIL || env.SMTP_FROM,
          Name: env.MJ_SENDER_NAME || 'Plany',
        },
        To: [
          {
            Email: to,
          },
        ],
        Subject: subject,
        HTMLPart: html,
        Variables: variables,
      },
    ],
  }

  const response = await mailjet.post('send', { version: 'v3.1' }).request(payload)
  await incrementDailySend()
  return response
}

const sendThroughSmtp = async (to: string, variables: StringMap, subject: string) => {
  const transporterOptions: SMTPTransport.Options = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  }

  const transporter = testTransportFactory ? testTransportFactory() : nodemailer.createTransport(transporterOptions)
  const html = await renderTemplate(variables)

  await transporter.sendMail({
    from: `${env.MJ_SENDER_NAME || 'Plany'} <${env.MJ_SENDER_EMAIL || env.SMTP_FROM}>`,
    to,
    subject,
    html,
  })

  await incrementDailySend()
}

export const sendMarketingEmail = async (to: string, variables: StringMap): Promise<void> => {
  if (!validator.isEmail(to)) {
    throw new Error('INVALID_EMAIL')
  }

  const canSend = await canSendMoreToday()
  if (!canSend) {
    throw new Error('EMAIL_DAILY_LIMIT_REACHED')
  }

  const enrichedVariables: StringMap = {
    lien: variables.lien || '#',
    ...variables,
  }

  const subject = `Plany - Nouvelle offre sur ${variables.voiture || 'votre prochaine location'}`

  if (isMailjetProvider()) {
    const response = await sendThroughMailjet(to, enrichedVariables, subject)
    if (response) {
      return
    }
  }

  await sendThroughSmtp(to, enrichedVariables, subject)
}

type QualifiedRecipient = Pick<bookcarsTypes.User, '_id' | 'email' | 'fullName'>

const getQualifiedRecipient = async () => User.findOneAndUpdate(
  {
    verified: true,
    enableEmailNotifications: true,
    blacklisted: false,
    type: bookcarsTypes.UserType.User,
    lastMarketingEmailDate: { $exists: false },
  },
  { $set: { lastMarketingEmailDate: new Date() } },
  { new: true },
).lean() as Promise<QualifiedRecipient | null>

const buildMarketingVariables = (user: Pick<bookcarsTypes.User, 'fullName'>): StringMap => ({
  prenom: user.fullName?.split(' ')[0] || 'client',
  voiture: 'Citroën C3 ou similaire',
  prix: 120,
  lien: `${env.FRONTEND_HOST}cars`,
})

export const dispatchCampaign = async () => {
  let sent = 0

  while (await canSendMoreToday()) {
    const recipient = await getQualifiedRecipient()
    if (!recipient) {
      break
    }

    if (!recipient.email) {
      await User.updateOne({ _id: recipient._id }, { $unset: { lastMarketingEmailDate: '' } })
      // eslint-disable-next-line no-continue
      continue
    }

    try {
      await sendMarketingEmail(recipient.email, buildMarketingVariables(recipient))
      sent += 1
    } catch (err) {
      logger.error('Failed to send marketing email', err)
      await User.updateOne({ _id: recipient._id }, { $unset: { lastMarketingEmailDate: '' } })
    }
  }

  return { sent }
}

export const getEmailStats = async (): Promise<bookcarsTypes.EmailStatsResponse> => {
  const history = await MarketingEmailStat.find().sort({ date: -1 }).limit(30).lean()
  const totals = history.reduce((acc, stat) => ({
    sent: acc.sent + (stat.sentCount || 0),
    opens: acc.opens + (stat.openCount || 0),
    clicks: acc.clicks + (stat.clickCount || 0),
  }), { sent: 0, opens: 0, clicks: 0 })

  const last24h = history.filter((stat) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    return stat.date.getTime() >= cutoff
  }).reduce((acc, stat) => acc + (stat.sentCount || 0), 0)

  return {
    stats: {
      totalSent: totals.sent,
      totalOpens: totals.opens,
      totalClicks: totals.clicks,
      last24hSent: last24h,
      dailyLimit: env.EMAIL_DAILY_LIMIT,
    },
    history: history.map((stat) => ({
      date: stat.date.toISOString(),
      sent: stat.sentCount,
      opens: stat.openCount,
      clicks: stat.clickCount,
    })),
  }
}
