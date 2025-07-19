import { Request, Response } from 'express'
import nodemailer from 'nodemailer'
import path from 'node:path'
import Subscription from '../models/Subscription'
import User from '../models/User'
import * as bookcarsTypes from ':bookcars-types'
import * as logger from '../common/logger'
import * as authHelper from '../common/authHelper'
import * as helper from '../common/helper'
import * as mailHelper from '../common/mailHelper'
import * as invoiceHelper from '../common/invoiceHelper'
import * as env from '../config/env.config'

export const create = async (req: Request, res: Response) => {
  try {
    const data: bookcarsTypes.CreateSubscriptionPayload = req.body
    const now = new Date()
    let subscription = await Subscription.findOne({
      supplier: data.supplier,
      endDate: { $gt: now },
    }).sort({ endDate: -1 })

    if (subscription) {
      subscription.plan = data.plan
      subscription.period = data.period
      subscription.endDate = data.endDate
      subscription.resultsCars = data.resultsCars
      subscription.sponsoredCars = data.sponsoredCars
    } else {
      subscription = new Subscription(data)
    }

    subscription.invoice = `invoice_${subscription._id}.pdf`
    await subscription.save()

    const supplier = await User.findById(subscription.supplier)
    if (supplier) {
      await invoiceHelper.generateInvoice(
        subscription.toObject() as bookcarsTypes.Subscription,
        supplier.toObject() as bookcarsTypes.User,
      )

      const file = path.join(env.CDN_INVOICES, subscription.invoice)
      const mailOptions: nodemailer.SendMailOptions = {
        from: env.SMTP_FROM,
        to: supplier.email,
        subject: 'Subscription confirmed',
        html: `<p>Hello ${supplier.fullName},<br>Your subscription is confirmed.<br>Regards</p>`,
      }

      if (await helper.exists(file)) {
        mailOptions.attachments = [{ path: file }]
      }

      await mailHelper.sendMail(mailOptions)
    }

    return res.sendStatus(200)
  } catch (err) {
    logger.error('[subscription.create]', err)
    return res.status(400).send('Error')
  }
}

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User|null = await User.findById(sessionData.id)
    const isAdmin = connectedUser ? helper.admin(connectedUser) : false
    if (!isAdmin) {
      return res.sendStatus(403)
    }
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const subscriptions = await Subscription.find()
      .sort({ startDate: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .populate('supplier', '-password')
      .lean()
    const total = await Subscription.countDocuments()
    return res.json({ resultData: subscriptions, pageInfo: [{ totalRecords: total }] })
  } catch (err) {
    logger.error('[subscription.getSubscriptions]', err)
    return res.status(400).send('Error')
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const { body } = req
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User|null = await User.findById(sessionData.id)
    const isAdmin = connectedUser ? helper.admin(connectedUser) : false
    if (!isAdmin) {
      return res.sendStatus(403)
    }
    const subscription = await Subscription.findById(body._id)
    if (!subscription) {
      return res.sendStatus(404)
    }
    subscription.plan = body.plan
    subscription.period = body.period
    subscription.startDate = new Date(body.startDate)
    subscription.endDate = new Date(body.endDate)
    subscription.resultsCars = body.resultsCars
    subscription.sponsoredCars = body.sponsoredCars
    await subscription.save()
    return res.sendStatus(200)
  } catch (err) {
    logger.error('[subscription.update]', err)
    return res.status(400).send('Error')
  }
}

export const getCurrent = async (req: Request, res: Response) => {
  try {
    const session = await authHelper.getSessionData(req)
    const subscription = await Subscription.findOne({ supplier: session.id })
      .sort({ endDate: -1 })
      .lean()

    if (!subscription) {
      return res.sendStatus(204)
    }

    return res.json(subscription)
  } catch (err) {
    logger.error('[subscription.getCurrent]', err)
    return res.status(400).send('Error')
  }
}

export const getCurrentById = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User|null = await User.findById(sessionData.id)
    const isAdmin = connectedUser ? helper.admin(connectedUser) : false
    if (!isAdmin) {
      return res.sendStatus(403)
    }
    const { id } = req.params
    const subscription = await Subscription.findById(id).populate('supplier', '-password').lean()
    if (!subscription) {
      return res.sendStatus(404)
    }
    return res.json(subscription)
  } catch (err) {
    logger.error('[subscription.getCurrentById]', err)
    return res.status(400).send('Error')
  }
}
