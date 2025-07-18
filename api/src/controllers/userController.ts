import path from 'node:path'
import fs from 'node:fs/promises'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import { CookieOptions, Request, Response } from 'express'
import nodemailer from 'nodemailer'
import axios from 'axios'
import validator from 'validator'

import { templateAfterValidation } from '../lang/template/emailTemplateAfterValidation'
import * as bookcarsTypes from ':bookcars-types'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import User from '../models/User'
import Booking from '../models/Booking'
import Token from '../models/Token'
import PushToken from '../models/PushToken'
import * as helper from '../common/helper'
import * as authHelper from '../common/authHelper'
import * as mailHelper from '../common/mailHelper'
import Notification from '../models/Notification'
import NotificationCounter from '../models/NotificationCounter'
import Car from '../models/Car'
import AdditionalDriver from '../models/AdditionalDriver'
import * as logger from '../common/logger'

/**
 * Get status message as HTML.
 *
 * @param {string} lang
 * @param {string} msg
 * @returns {string}
 */
const getStatusMessage = (lang: string, msg: string) => (
  `<!DOCTYPE html><html lang="'${lang}'"><head></head><body><p>${msg}</p></body></html>`
)

function generateUniqueSlug(value: string, existingSlugs?: Set<string> | undefined): string {
  let slug = value
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalisation Unicode pour décomposer les accents
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]+/gi, '') // Supprimer tout sauf lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Remplacer plusieurs tirets consécutifs par un seul tiret

  const originalSlug = slug

  if (existingSlugs === undefined || existingSlugs.has(slug)) {
    const randomNumber = Math.floor(Math.random() * 10000) // Génère un nombre aléatoire entre 0 et 9999
    const paddedNumber = String(randomNumber).padStart(4, '0') // Formate le nombre pour qu'il ait toujours 4 chiffres
    slug = `${originalSlug}-${paddedNumber}`
  }

  if (existingSlugs) {
    existingSlugs.add(slug)
  }
  return slug
}

/**
 * Sign Up.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @param {bookcarsTypes.UserType} userType
 * @returns {unknown}
 */
const _signup = async (req: Request, res: Response, userType: bookcarsTypes.UserType) => {
  const { body }: { body: bookcarsTypes.SignUpPayload } = req

  //
  // Create user
  //
  let user: env.User
  try {
    body.email = helper.trim(body.email, ' ')
    body.active = userType !== bookcarsTypes.UserType.Supplier.toString()
    body.verified = false
    body.blacklisted = false
    body.type = userType

    const salt = await bcrypt.genSalt(10)
    const { password } = body
    const passwordHash = await bcrypt.hash(password, salt)
    body.password = passwordHash

    user = new User(body)
    user.slug = generateUniqueSlug(user.fullName)
    await user.save()

    if (body.avatar) {
      const avatar = path.join(env.CDN_TEMP_USERS, body.avatar)
      if (await helper.exists(avatar)) {
        const filename = `${user._id}_${Date.now()}${path.extname(body.avatar)}`
        const newPath = path.join(env.CDN_USERS, filename)

        await fs.rename(avatar, newPath)
        user.avatar = filename
        await user.save()
      }
    }
  } catch (err) {
    logger.error(`[user.signup] ${i18n.t('DB_ERROR')} ${JSON.stringify(body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }

  //
  // Send confirmation email
  //
  try {
    // Generate token and save
    const token = new Token({ user: user._id, token: helper.generateToken() })
    await token.save()

    // Send email
    i18n.locale = user.language

    const mailOptions: nodemailer.SendMailOptions = {
      from: env.SMTP_FROM,
      to: user.email,
      subject: i18n.t('ACCOUNT_ACTIVATION_SUBJECT'),
      html: `
        <p>
          ${i18n.t('HELLO')} ${user.fullName},<br><br>
          ${i18n.t('ACCOUNT_ACTIVATION_LINK')}<br><br>
          <a href="http${env.HTTPS ? 's' : ''}://${req.headers.host}/api/confirm-email/${user.email}/${token.token}" 
             style="display: inline-block; padding: 5px 25px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
            ${i18n.t('CLICK_HERE')}
          </a><br><br>
          ${i18n.t('REGARDS')}<br>
        </p>
      `,
    }

    await mailHelper.sendMail(mailOptions)
    return res.sendStatus(200)
  } catch (err) {
    try {
      // Delete user in case of SMTP failure
      await user.deleteOne()
    } catch (deleteErr) {
      logger.error(`[user.signup] ${i18n.t('DB_ERROR')} ${JSON.stringify(body)}`, deleteErr)
    }
    logger.error(`[user.signup] ${i18n.t('SMTP_ERROR')}`, err)
    return res.status(400).send(i18n.t('SMTP_ERROR') + err)
  }
}

/**
 * Frontend Sign Up.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 */
export const signup = async (req: Request, res: Response) => {
  await _signup(req, res, bookcarsTypes.UserType.User)
}

/**
 * Backend Sign Up.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 */
export const adminSignup = async (req: Request, res: Response) => {
  const adminExists = await User.findOne({ type: bookcarsTypes.UserType.Admin })
  await _signup(req, res, adminExists ? bookcarsTypes.UserType.Supplier : bookcarsTypes.UserType.Admin)
}

/**
 * Create a User.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const create = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.CreateUserPayload } = req

  try {
    body.verified = false
    body.blacklisted = false

    if (body.password) {
      const salt = await bcrypt.genSalt(10)
      const { password } = body
      const passwordHash = await bcrypt.hash(password, salt)
      body.password = passwordHash
    }

    const { contracts } = body
    body.contracts = undefined

    const user = new User(body)
    await user.save()

    const finalContracts: bookcarsTypes.Contract[] = []
    if (contracts) {
      for (const contract of contracts) {
        if (contract.language && contract.file) {
          const tempFile = path.join(env.CDN_TEMP_CONTRACTS, contract.file)

          if (await helper.exists(tempFile)) {
            const filename = `${user.id}_${contract.language}${path.extname(tempFile)}`
            const newPath = path.join(env.CDN_CONTRACTS, filename)

            await fs.rename(tempFile, newPath)
            finalContracts.push({ language: contract.language, file: filename })
          }
        }
      }
      user.contracts = finalContracts
      await user.save()
    }

    // avatar
    if (body.avatar) {
      const avatar = path.join(env.CDN_TEMP_USERS, body.avatar)
      if (await helper.exists(avatar)) {
        const filename = `${user._id}_${Date.now()}${path.extname(body.avatar)}`
        const newPath = path.join(env.CDN_USERS, filename)

        await fs.rename(avatar, newPath)
        user.avatar = filename
        await user.save()
      }
    }

    if (body.password) {
      return res.sendStatus(200)
    }

    // generate token and save
    const token = new Token({ user: user._id, token: helper.generateToken() })
    await token.save()

    // Send email
    i18n.locale = user.language

    const mailOptions: nodemailer.SendMailOptions = {
      from: env.SMTP_FROM,
      to: user.email,
      subject: i18n.t('ACCOUNT_ACTIVATION_SUBJECT'),
      html:
        `<p>
        ${i18n.t('HELLO')}${user.fullName},<br><br>
        ${i18n.t('ACCOUNT_ACTIVATION_LINK')}<br><br>
        <a class="button" href="${helper.joinURL(
          user.type === bookcarsTypes.UserType.User ? env.FRONTEND_HOST : env.BACKEND_HOST,
          'activate',
        )}/?u=${encodeURIComponent(user.id)}&e=${encodeURIComponent(user.email)}&t=${encodeURIComponent(token.token)}">${i18n.t('CLICK_HERE')}</a><br>
        ${i18n.t('REGARDS')}<br>
        </p>`,
    }

    await mailHelper.sendMail(mailOptions)
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.create] ${i18n.t('DB_ERROR')} ${JSON.stringify(body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Check a Validation Token.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkToken = async (req: Request, res: Response) => {
  const { userId, email } = req.params

  try {
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      email,
    })

    if (user) {
      const type = req.params.type.toLowerCase() as bookcarsTypes.AppType

      if (
        ![bookcarsTypes.AppType.Frontend, bookcarsTypes.AppType.Backend].includes(type)
        || (type === bookcarsTypes.AppType.Backend && user.type === bookcarsTypes.UserType.User)
        || (type === bookcarsTypes.AppType.Frontend && user.type !== bookcarsTypes.UserType.User)
        // || user.active
      ) {
        return res.sendStatus(204)
      }

      const token = await Token.findOne({
        user: new mongoose.Types.ObjectId(userId),
        token: req.params.token,
      })

      if (token) {
        return res.sendStatus(200)
      }

      return res.sendStatus(204)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.checkToken] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.params)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete Validation Tokens.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteTokens = async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    const result = await Token.deleteMany({
      user: new mongoose.Types.ObjectId(userId),
    })

    if (result.deletedCount > 0) {
      return res.sendStatus(200)
    }

    return res.sendStatus(400)
  } catch (err) {
    logger.error(`[user.deleteTokens] ${i18n.t('DB_ERROR')} ${userId}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Resend Validation email.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const resend = async (req: Request, res: Response) => {
  const { email } = req.params

  try {
    if (!helper.isValidEmail(email)) {
      throw new Error('email is not valid')
    }
    const user = await User.findOne({ email })

    if (user) {
      const type = req.params.type.toLowerCase() as bookcarsTypes.AppType

      if (
        ![bookcarsTypes.AppType.Frontend, bookcarsTypes.AppType.Backend].includes(type)
        || (type === bookcarsTypes.AppType.Backend && user.type === bookcarsTypes.UserType.User)
        || (type === bookcarsTypes.AppType.Frontend && user.type !== bookcarsTypes.UserType.User)
      ) {
        return res.sendStatus(403)
      }

      // generate token and save
      const token = new Token({ user: user._id, token: helper.generateToken() })
      await token.save()

      // Send email
      i18n.locale = user.language

      const reset = req.params.reset === 'true'

      const mailOptions: nodemailer.SendMailOptions = {
        from: env.SMTP_FROM,
        to: user.email,
        subject: reset ? i18n.t('PASSWORD_RESET_SUBJECT') : i18n.t('ACCOUNT_ACTIVATION_SUBJECT'),
        html:
          `<p>
          ${i18n.t('HELLO')}${user.fullName},<br>
          ${reset ? i18n.t('PASSWORD_RESET_LINK') : i18n.t('ACCOUNT_ACTIVATION_LINK')}<br> 
          <a class="button" href="${helper.joinURL(
            user.type === bookcarsTypes.UserType.User ? env.FRONTEND_HOST : env.BACKEND_HOST,
            reset ? 'reset-password' : 'activate',
          )}/?u=${encodeURIComponent(user.id)}&e=${encodeURIComponent(user.email)}&t=${encodeURIComponent(token.token)}">${i18n.t('CLICK_HERE')}</a>
          <br>
          ${i18n.t('REGARDS')}<br>
          </p>`,
      }

      await mailHelper.sendMail(mailOptions)
      return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.resend] ${i18n.t('DB_ERROR')} ${email}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Activate a User and set his Password.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const activateSupplier = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.ActivatePayload } = req
  const { userId } = body
  const sessionData = await authHelper.getSessionData(req)
  let connectedUser: bookcarsTypes.User | null

  try {
    if (!helper.isValidObjectId(userId)) {
      throw new Error('body.userId is not valid')
    }

    const user = await User.findById(userId)

  if (sessionData.id === userId && user) {
    connectedUser = user as bookcarsTypes.User
  } else {
    connectedUser = await User.findById(sessionData.id)
  }

  const isAdmin = connectedUser ? helper.admin(connectedUser) : false

    if (user && isAdmin) {
        user.active = true
        await user.save()
        if (user.type === bookcarsTypes.UserType.Supplier) {
          const mailOptions: nodemailer.SendMailOptions = {
            html: templateAfterValidation('Félicitations ! Votre compte Plany est prêt à l’emploi', user.fullName),
            to: user.email,
            subject: 'Félicitations ! Votre compte Plany est prêt à l’emploi',
          }
          mailHelper.sendMailHTML(mailOptions)
        }
        return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.activate] ${i18n.t('DB_ERROR')} ${userId}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Activate a User and set his Password.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const activate = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.ActivatePayload } = req
  const { userId } = body

  try {
    if (!helper.isValidObjectId(userId)) {
      throw new Error('body.userId is not valid')
    }

    const user = await User.findById(userId)

    if (user) {
      const token = await Token.findOne({ user: userId, token: body.token })

      if (token) {
        const salt = await bcrypt.genSalt(10)
        const { password } = body
        const passwordHash = await bcrypt.hash(password, salt)
        user.password = passwordHash

        user.active = true
        user.verified = true
        user.expireAt = undefined
        await user.save()

        return res.sendStatus(200)
      }
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.activate] ${i18n.t('DB_ERROR')} ${userId}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Sign In.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const signin = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.SignInPayload } = req
  const { email: emailFromBody, password, stayConnected, mobile } = body

  try {
    if (!emailFromBody) {
      throw new Error('body.email not found')
    }

    const email = helper.trim(emailFromBody, ' ')

    if (!helper.isValidEmail(email)) {
      throw new Error('body.email is not valid')
    }

    const user = await User.findOne({ email })
    const type = req.params.type.toLowerCase() as bookcarsTypes.AppType

    if (
      !password
      || !user
      || !user.password
      || ![bookcarsTypes.AppType.Frontend, bookcarsTypes.AppType.Backend].includes(type)
      || (type === bookcarsTypes.AppType.Backend && user.type === bookcarsTypes.UserType.User)
      || (type === bookcarsTypes.AppType.Frontend && user.type !== bookcarsTypes.UserType.User)
    ) {
      return res.sendStatus(204)
    }
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (passwordMatch) {
      //
      // On production, authentication cookies are httpOnly, signed, secure and strict sameSite.
      // These options prevent XSS, CSRF and MITM attacks.
      // Authentication cookies are protected against XST attacks as well via allowedMethods middleware.
      //
      const cookieOptions: CookieOptions = helper.clone(env.COOKIE_OPTIONS)

      if (stayConnected) {
        //
        // Cookies can no longer set an expiration date more than 400 days in the future.
        // The limit MUST NOT be greater than 400 days in duration.
        // The RECOMMENDED limit is 400 days in duration, but the user agent MAY adjust the
        // limit to be less.
        //
        cookieOptions.maxAge = 400 * 24 * 60 * 60 * 1000
      } else {
        //
        // Cookie maxAge option is set in milliseconds.
        //
        cookieOptions.maxAge = env.JWT_EXPIRE_AT * 1000
      }

      const payload: authHelper.SessionData = { id: user.id }
      const token = await authHelper.encryptJWT(payload, stayConnected)

      const loggedUser: bookcarsTypes.User = {
        _id: user.id,
        email: user.email,
        fullName: user.fullName,
        language: user.language,
        enableEmailNotifications: user.enableEmailNotifications,
        blacklisted: user.blacklisted,
        avatar: user.avatar,
        active: user.active,
      }

      //
      // On mobile, we return the token in the response body.
      //
      if (mobile) {
        loggedUser.accessToken = token

        return res
          .status(200)
          .send(loggedUser)
      }

      //
      // On web, we return the token in a httpOnly, signed, secure and strict sameSite cookie.
      //
      const cookieName = authHelper.getAuthCookieName(req)

      return res
        .clearCookie(cookieName)
        .cookie(cookieName, token, cookieOptions)
        .status(200)
        .send(loggedUser)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.signin] ${i18n.t('DB_ERROR')} ${emailFromBody}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Sign In.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const socialSignin = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.SignInPayload } = req
  const { socialSignInType, accessToken, email: emailFromBody, fullName, avatar, stayConnected, mobile } = body

  try {
    if (!socialSignInType) {
      throw new Error('body.socialSignInType not found')
    }

    if (!emailFromBody) {
      throw new Error('body.email not found')
    }

    const email = helper.trim(emailFromBody, ' ')

    if (!helper.isValidEmail(email)) {
      throw new Error('body.email is not valid')
    }

    if (!mobile) {
      if (!accessToken) {
        throw new Error('body.accessToken not found')
      }

      if (!await helper.validateAccessToken(socialSignInType, accessToken, email)) {
        throw new Error('body.accessToken is not valid')
      }
    }

    let user = await User.findOne({ email })

    if (!user) {
      user = new User({
        email,
        fullName,
        active: true,
        verified: true,
        language: 'fr',
        enableEmailNotifications: true,
        type: bookcarsTypes.UserType.User,
        blacklisted: false,
        avatar,
      })
      await user.save()
    }

    //
    // On production, authentication cookies are httpOnly, signed, secure and strict sameSite.
    // These options prevent XSS, CSRF and MITM attacks.
    // Authentication cookies are protected against XST attacks as well via allowedMethods middleware.
    //
    const cookieOptions: CookieOptions = helper.clone(env.COOKIE_OPTIONS)

    if (stayConnected) {
      //
      // Cookies can no longer set an expiration date more than 400 days in the future.
      // The limit MUST NOT be greater than 400 days in duration.
      // The RECOMMENDED limit is 400 days in duration, but the user agent MAY adjust the
      // limit to be less.
      //
      cookieOptions.maxAge = 400 * 24 * 60 * 60 * 1000
    } else {
      //
      // Cookie maxAge option is set in milliseconds.
      //
      cookieOptions.maxAge = env.JWT_EXPIRE_AT * 1000
    }

    const payload: authHelper.SessionData = { id: user.id }
    const token = await authHelper.encryptJWT(payload, stayConnected)

    const loggedUser: bookcarsTypes.User = {
      _id: user.id,
      email: user.email,
      fullName: user.fullName,
      language: user.language,
      enableEmailNotifications: user.enableEmailNotifications,
      blacklisted: user.blacklisted,
      avatar: user.avatar,
      active: user.active,
    }

    //
    // On mobile, we return the token in the response body.
    //
    if (mobile) {
      loggedUser.accessToken = token

      return res
        .status(200)
        .send(loggedUser)
    }

    //
    // On web, we return the token in a httpOnly, signed, secure and strict sameSite cookie.
    //
    const cookieName = authHelper.getAuthCookieName(req)

    return res
      .clearCookie(cookieName)
      .cookie(cookieName, token, cookieOptions)
      .status(200)
      .send(loggedUser)
  } catch (err) {
    logger.error(`[user.socialSignin] ${i18n.t('DB_ERROR')} ${emailFromBody}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Sign out.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const signout = async (req: Request, res: Response) => {
  const cookieName = authHelper.getAuthCookieName(req)

  return res
    .clearCookie(cookieName)
    .sendStatus(200)
}

/**
 * Get Push Notification Token.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getPushToken = async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    if (!helper.isValidObjectId(userId)) {
      throw new Error('userId is not valid')
    }

    const pushToken = await PushToken.findOne({ user: userId })
    if (pushToken) {
      return res.json(pushToken.token)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.pushToken] ${i18n.t('DB_ERROR')} ${userId}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Create Push Notification Token.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createPushToken = async (req: Request, res: Response) => {
  const { userId, token } = req.params

  try {
    if (!helper.isValidObjectId(userId)) {
      throw new Error('userId is not valid')
    }

    const exist = await PushToken.exists({ user: userId })

    if (!exist) {
      const pushToken = new PushToken({
        user: userId,
        token,
      })
      await pushToken.save()
      return res.sendStatus(200)
    }

    return res.status(400).send('Push Token already exists.')
  } catch (err) {
    logger.error(`[user.createPushToken] ${i18n.t('DB_ERROR')} ${userId}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Delete Push Notification Token.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deletePushToken = async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    if (!helper.isValidObjectId(userId)) {
      throw new Error('userId is not valid')
    }

    await PushToken.deleteMany({ user: userId })
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.deletePushToken] ${i18n.t('DB_ERROR')} ${userId}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Validate email.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const validateEmail = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.ValidateEmailPayload } = req
  const { email } = body

  try {
    if (!helper.isValidEmail(email)) {
      throw new Error('body.email is not valid')
    }

    const exists = await User.exists({ email })

    if (exists) {
      return res.sendStatus(204)
    }

    // email does not exist in db (can be added)
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.validateEmail] ${i18n.t('DB_ERROR')} ${email}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Validate JWT token.
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {*}
 */
export const validateAccessToken = async (req: Request, res: Response) => res.sendStatus(200)

/**
 * Get Validation result as HTML.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const { token: _token, email: _email } = req.params

    if (!helper.isValidEmail(_email)) {
      throw new Error('email is not valid')
    }

    const user = await User.findOne({ email: _email })

    if (!user) {
      logger.error('[user.confirmEmail] User not found', req.params)
      return res.status(204).send(i18n.t('ACCOUNT_ACTIVATION_LINK_ERROR'))
    }

    i18n.locale = user.language
    const token = await Token.findOne({ user: user._id, token: _token })

    // token is not found into database i.e. token may have expired
    if (!token) {
      logger.error(i18n.t('ACCOUNT_ACTIVATION_LINK_EXPIRED'), req.params)
      return res.status(400).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_LINK_EXPIRED')))
    }

    // if token is found then check valid user
    // not valid user
    if (user.verified) {
      // user is already verified
      return res.status(200).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_ACCOUNT_VERIFIED')))
    }

    // verify user
    // change verified to true
    user.verified = true
    user.verifiedAt = new Date()
    await user.save()
    return res.status(200).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_SUCCESS')))
  } catch (err) {
    logger.error(`[user.confirmEmail] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.params)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Resend Validation email.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const resendLink = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.ResendLinkPayload } = req
  const { email } = body

  try {
    if (!email || !helper.isValidEmail(email)) {
      throw new Error('email is not valid')
    }

    const user = await User.findOne({ email })

    // user is not found into database
    if (!user) {
      logger.error('[user.resendLink] User not found:', email)
      return res.status(400).send(getStatusMessage(env.DEFAULT_LANGUAGE, i18n.t('ACCOUNT_ACTIVATION_RESEND_ERROR')))
    }

    if (user.verified) {
      // user has been already verified
      return res.status(200).send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_ACCOUNT_VERIFIED')))
    }

    // send verification link
    // generate token and save
    const token = new Token({ user: user._id, token: helper.generateToken() })
    await token.save()

    // Send email
    i18n.locale = user.language
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.SMTP_FROM,
      to: user.email,
      subject: i18n.t('ACCOUNT_ACTIVATION_SUBJECT'),
      html:
        `<p>
        ${i18n.t('HELLO')}${user.fullName},<br><br>
        ${i18n.t('ACCOUNT_ACTIVATION_LINK')}<br><br>
        <a class="button" href="http${env.HTTPS ? 's' : ''}://${req.headers.host}/api/confirm-email/${user.email}/${token.token}">${i18n.t('CLICK_HERE')}</a><br>
        ${i18n.t('REGARDS')}<br>
        </p>`,
    }

    await mailHelper.sendMail(mailOptions)
    return res
      .status(200)
      .send(getStatusMessage(user.language, i18n.t('ACCOUNT_ACTIVATION_EMAIL_SENT_PART_1') + user.email + i18n.t('ACCOUNT_ACTIVATION_EMAIL_SENT_PART_2')))
  } catch (err) {
    logger.error(`[user.resendLink] ${i18n.t('DB_ERROR')} ${email}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update User.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.UpdateUserPayload } = req
    const { _id } = body
    const sessionData = await authHelper.getSessionData(req)
    let connectedUser: bookcarsTypes.User | null

    if (!helper.isValidObjectId(_id)) {
      throw new Error('User id is not valid')
    }

    const user = await User.findById(_id)

    if (sessionData.id === _id && user) {
      connectedUser = user as bookcarsTypes.User
    } else {
      connectedUser = await User.findById(sessionData.id)
    }

    const isAdmin = connectedUser ? helper.admin(connectedUser) : false
    if (!user || (!isAdmin && (user._id !== connectedUser?._id))) {
      logger.error('[user.update] User not found:', body.email)
      return res.sendStatus(204)
    }

    const {
      fullName,
      phone,
      bio,
      location,
      type,
      birthDate,
      enableEmailNotifications,
      payLater,
      active,
    } = body

    if (fullName) {
      user.fullName = fullName
      user.slug = generateUniqueSlug(fullName)
    }
    user.phone = phone
    user.location = location
    user.bio = bio
    user.birthDate = birthDate ? new Date(birthDate) : undefined
    if (type) {
      user.type = type as bookcarsTypes.UserType
    }
    if (typeof enableEmailNotifications !== 'undefined') {
      user.enableEmailNotifications = enableEmailNotifications
    }
    if (typeof payLater !== 'undefined') {
      user.payLater = payLater
    }

    if (isAdmin) {
      user.active = active
    }

    await user.save()
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.update] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const addReview = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.AddReviewPayload } = req
    const { _id, review } = body

    // Vérifier si l'ID de l'utilisateur est valide
    if (!helper.isValidObjectId(_id)) {
      throw new Error('User ID is not valid')
    }

    // Récupérer l'utilisateur connecté
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser = await User.findById(sessionData.id) as bookcarsTypes.User

    // Vérifier si l'utilisateur connecté existe
    if (!connectedUser) {
      throw new Error('Connected user not found')
    }

    // Récupérer l'utilisateur à qui l'avis est destiné
    const user = await User.findById(_id)
    if (!user) {
      throw new Error('User not found')
    }

    // Vérifier si l'utilisateur connecté est autorisé à ajouter un avis
    const isAdmin = helper.admin(connectedUser) // Vérifie si l'utilisateur est un admin
    const isAuthorized = isAdmin || (review && connectedUser._id && review.user === connectedUser._id.toString()) // Autorisation si admin ou supplier correspondant

    if (!isAuthorized) {
      throw new Error('You are not authorized to add a review for this user')
    }

    // Ajouter l'avis à l'utilisateur
    if (!user.reviews) {
      user.reviews = []
    }
    if (review) {
      const hasAlreadyReviewed = user.reviews.some((existingReview) => (
          existingReview.booking.toString() === review.booking
          && existingReview.user.toString() === review.user
        ))

      if (hasAlreadyReviewed && !isAdmin) {
        throw new Error('Vous avez déjà soumis votre avis pour cette réservation.')
      }
      review.type = connectedUser.type ? connectedUser.type : 'plany'
      user.reviews.push(review)
    // Sauvegarder l'utilisateur mis à jour
      await user.save()
    }

    // Sauvegarder l'utilisateur mis à jour
    await user.save()

    // Répondre avec un statut 200 (succès)
    return res.sendStatus(200)
  } catch (err) {
    // Journaliser l'erreur et renvoyer une réponse d'erreur
    logger.error(`[user.addReview] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update email notifications setting.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateEmailNotifications = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.UpdateEmailNotificationsPayload } = req

  try {
    const { _id } = body

    if (!helper.isValidObjectId(_id)) {
      throw new Error('User id is not valid')
    }

    const user = await User.findById(_id)

    if (!user) {
      logger.error('[user.updateEmailNotifications] User not found:', body)
      return res.sendStatus(204)
    }

    const { enableEmailNotifications } = body
    user.enableEmailNotifications = enableEmailNotifications
    await user.save()

    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.updateEmailNotifications] ${i18n.t('DB_ERROR')} ${JSON.stringify(body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update language.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateLanguage = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.UpdateLanguagePayload } = req
    const { id, language } = body

    if (!helper.isValidObjectId(id)) {
      throw new Error('User id is not valid')
    }

    const user = await User.findById(id)
    if (!user) {
      logger.error('[user.updateLanguage] User not found:', id)
      return res.sendStatus(204)
    }

    user.language = language
    await user.save()
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.updateLanguage] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get User by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    if (!helper.isValidObjectId(id)) {
      throw new Error('User id is not valid')
    }

    const user = await User.findById(id, {
      supplier: 1,
      email: 1,
      phone: 1,
      fullName: 1,
      verified: 1,
      language: 1,
      enableEmailNotifications: 1,
      avatar: 1,
      bio: 1,
      location: 1,
      type: 1,
      blacklisted: 1,
      birthDate: 1,
      payLater: 1,
      customerId: 1,
      active: 1,
      reviews: 1,
      slug: 1,
    }).lean()

    if (!user) {
      logger.error('[user.getUser] User not found:', req.params)
      return res.sendStatus(204)
    }

    return res.json(user)
  } catch (err) {
    logger.error(`[user.getUser] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Upload avatar to temp folder.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('[user.createAvatar] req.file not found')
    }

    const filename = `${helper.getFilenameWithoutExtension(req.file.originalname)}_${nanoid()}_${Date.now()}${path.extname(req.file.originalname)}`
    const filepath = path.join(env.CDN_TEMP_USERS, filename)

    await fs.writeFile(filepath, req.file.buffer)
    return res.json(filename)
  } catch (err) {
    logger.error(`[user.createAvatar] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Update avatar.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateAvatar = async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    if (!req.file) {
      const msg = 'req.file not found'
      logger.error(`[user.createAvatar] ${msg}`)
      return res.status(400).send(msg)
    }

    const user = await User.findById(userId)

    if (user) {
      if (user.avatar && !user.avatar.startsWith('http')) {
        const avatar = path.join(env.CDN_USERS, user.avatar)

        if (await helper.exists(avatar)) {
          await fs.unlink(avatar)
        }
      }

      const filename = `${user._id}_${Date.now()}${path.extname(req.file.originalname)}`
      const filepath = path.join(env.CDN_USERS, filename)

      await fs.writeFile(filepath, req.file.buffer)
      user.avatar = filename
      await user.save()
      return res.json(filename)
    }

    logger.error('[user.updateAvatar] User not found:', userId)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.updateAvatar] ${i18n.t('DB_ERROR')} ${userId}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Delete avatar.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteAvatar = async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    const user = await User.findById(userId)

    if (user) {
      if (user.avatar && !user.avatar.startsWith('http')) {
        const avatar = path.join(env.CDN_USERS, user.avatar)
        if (await helper.exists(avatar)) {
          await fs.unlink(avatar)
        }
      }
      user.avatar = undefined

      await user.save()
      return res.sendStatus(200)
    }

    logger.error('[user.deleteAvatar] User not found:', userId)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.deleteAvatar] ${i18n.t('DB_ERROR')} ${userId}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Delete temp avatar.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteTempAvatar = async (req: Request, res: Response) => {
  const { avatar } = req.params

  try {
    const avatarFile = path.join(env.CDN_TEMP_USERS, avatar)
    if (!await helper.exists(avatarFile)) {
      throw new Error(`[user.deleteTempAvatar] temp avatar ${avatarFile} not found`)
    }

    await fs.unlink(avatarFile)

    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.deleteTempAvatar] ${i18n.t('DB_ERROR')} ${avatar}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Change password.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const changePassword = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.ChangePasswordPayload } = req
  const {
    _id,
    password: currentPassword,
    newPassword,
    strict,
  } = body

  try {
    if (!helper.isValidObjectId(_id)) {
      throw new Error('User id is not valid')
    }

    const user = await User.findOne({ _id })
    if (!user) {
      logger.error('[user.changePassword] User not found:', _id)
      return res.sendStatus(204)
    }

    if (strict && !user.password) {
      logger.error('[user.changePassword] User.password not found:', _id)
      return res.sendStatus(204)
    }

    const _changePassword = async () => {
      const salt = await bcrypt.genSalt(10)
      const password = newPassword
      const passwordHash = await bcrypt.hash(password, salt)
      user.password = passwordHash
      await user.save()
      return res.sendStatus(200)
    }

    if (strict) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password!)
      if (passwordMatch) {
        return _changePassword()
      }

      return res.sendStatus(204)
    }

    return _changePassword()
  } catch (err) {
    logger.error(`[user.changePassword] ${i18n.t('DB_ERROR')} ${_id}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Check password.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkPassword = async (req: Request, res: Response) => {
  const { id, password } = req.params

  try {
    if (!helper.isValidObjectId(id)) {
      throw new Error('User id is not valid')
    }

    const user = await User.findById(id)
    if (user) {
      if (!user.password) {
        logger.error('[user.changePassword] User.password not found')
        return res.sendStatus(204)
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if (passwordMatch) {
        return res.sendStatus(200)
      }

      return res.sendStatus(204)
    }

    logger.error('[user.checkPassword] User not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.checkPassword] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Get Users.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getUsers2 = async (req: Request, res: Response) => {
  try {
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const { body }: { body: bookcarsTypes.GetUsersBody } = req
    const { user: userId } = body

    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)

    const isAdmin = connectedUser ? helper.admin(connectedUser) : false
    const isSupplier = connectedUser ? helper.supplier(connectedUser) : false

    if (!isAdmin && !isSupplier) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const selectedTypes = isAdmin ? [bookcarsTypes.UserType.Admin, bookcarsTypes.UserType.Supplier, bookcarsTypes.UserType.User] : [bookcarsTypes.UserType.User]

    const $match: mongoose.FilterQuery<env.User> = {
      $and: [
        {
          type: { $in: selectedTypes },
        },
        {
          $or: [
            { fullName: { $regex: keyword, $options: options } },
            { email: { $regex: keyword, $options: options } },
          ],
        },
        {
          expireAt: null,
        },
      ],
    }

    if (userId) {
      $match.$and!.push({ _id: { $ne: new mongoose.Types.ObjectId(userId) } })
    }

    const users = await User.aggregate(
      [
        {
          $match,
        },
        {
          $project: {
            supplier: 1,
            email: 1,
            phone: 1,
            fullName: 1,
            verified: 1,
            language: 1,
            enableEmailNotifications: 1,
            avatar: 1,
            bio: 1,
            location: 1,
            type: 1,
            blacklisted: 1,
            birthDate: 1,
            customerId: 1,
            active: 1,
          },
        },
        {
          $facet: {
            resultData: [{ $sort: { fullName: 1, _id: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
            pageInfo: [
              {
                $count: 'totalRecords',
              },
            ],
          },
        },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    return res.json(users)
  } catch (err) {
    logger.error(`[user.getUsers] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const { body }: { body: bookcarsTypes.GetUsersBody } = req
    const { user: userId } = body

    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)

    const isAdmin = connectedUser ? helper.admin(connectedUser) : false
    const isSupplier = connectedUser ? helper.supplier(connectedUser) : false

    if (!isAdmin && !isSupplier) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    // Filtre pour les types d'utilisateur
    let selectedTypes: bookcarsTypes.UserType[]

    if (isAdmin) {
      if (body.types && body.types.length > 0) {
        selectedTypes = body.types
      } else {
        selectedTypes = [bookcarsTypes.UserType.Admin, bookcarsTypes.UserType.Supplier, bookcarsTypes.UserType.User]
      }
    } else {
      selectedTypes = [bookcarsTypes.UserType.User]
    }
    // Préparation du $match pour filtrer les utilisateurs
    const $match: mongoose.FilterQuery<env.User> = {
      $and: [
        {
          type: { $in: selectedTypes },
        },
        {
          $or: [
            { fullName: { $regex: keyword, $options: options } },
            { email: { $regex: keyword, $options: options } },
          ],
        },
        {
          expireAt: null,
        },
      ],
    }

    if (userId) {
      $match.$and!.push({ _id: { $ne: new mongoose.Types.ObjectId(userId) } })
    }

    // Ajout de la condition spécifique pour les fournisseurs (pas admin)
    if (!isAdmin && isSupplier) {
      const supplierId = connectedUser?._id

      // Recherche des utilisateurs ayant réservé au moins une fois avec le fournisseur
      const bookedDriverIds = await Booking.distinct('driver', { supplier: supplierId })
      const userCreatedBySupplier = await User.distinct('_id', { supplier: supplierId })

      $match.$and!.push({
        $or: [
          { _id: { $in: bookedDriverIds } }, // Utilisateurs ayant réservé au moins une fois
          { _id: { $in: userCreatedBySupplier } }, // Utilisateurs créés par le fournisseur
        ],
      })
    }

    const users = await User.aggregate(
      [
        {
          $match,
        },
        {
          $project: {
            supplier: 1,
            email: 1,
            phone: 1,
            fullName: 1,
            verified: 1,
            language: 1,
            enableEmailNotifications: 1,
            avatar: 1,
            bio: 1,
            location: 1,
            type: 1,
            blacklisted: 1,
            birthDate: 1,
            customerId: 1,
            active: 1,
          },
        },
        {
          $facet: {
            resultData: [{ $sort: { fullName: 1, _id: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
            pageInfo: [
              {
                $count: 'totalRecords',
              },
            ],
          },
        },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    return res.json(users)
  } catch (err) {
    logger.error(`[user.getUsers] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete Users.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteUsers = async (req: Request, res: Response) => {
  try {
    const { body }: { body: string[] } = req
    const ids: mongoose.Types.ObjectId[] = body.map((id: string) => new mongoose.Types.ObjectId(id))

    for (const id of ids) {
      const user = await User.findById(id)

      if (user) {
        await User.deleteOne({ _id: id })

        if (user.avatar) {
          const avatar = path.join(env.CDN_USERS, user.avatar)
          if (await helper.exists(avatar)) {
            await fs.unlink(avatar)
          }
        }

        if (user.contracts && user.contracts.length > 0) {
          for (const contract of user.contracts) {
            if (contract.file) {
              const file = path.join(env.CDN_CONTRACTS, contract.file)
              if (await helper.exists(file)) {
                await fs.unlink(file)
              }
            }
          }
        }

        if (user.type === bookcarsTypes.UserType.Supplier) {
          const additionalDrivers = (await Booking.find({ supplier: id, _additionalDriver: { $ne: null } }, { _id: 0, _additionalDriver: 1 })).map((b) => b._additionalDriver)
          await AdditionalDriver.deleteMany({ _id: { $in: additionalDrivers } })
          await Booking.deleteMany({ supplier: id })
          const cars = await Car.find({ supplier: id })
          await Car.deleteMany({ supplier: id })
          for (const car of cars) {
            if (car.image) {
              const image = path.join(env.CDN_CARS, car.image)
              if (await helper.exists(image)) {
                await fs.unlink(image)
              }
            }
          }
        } else if (user.type === bookcarsTypes.UserType.User) {
          await Booking.deleteMany({ driver: id })
        }
        await NotificationCounter.deleteMany({ user: id })
        await Notification.deleteMany({ user: id })
      } else {
        logger.error('User not found:', id)
      }
    }

    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.delete] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Validate Google reCAPTCHA v3 token.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const verifyRecaptcha = async (req: Request, res: Response) => {
  try {
    const { token, ip } = req.params
    const result = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}&remoteip=${ip}`)
    const { success } = result.data

    if (success) {
      return res.sendStatus(200)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.delete] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

const escapeHTML = (str: string): string => str.replace(/[&<>"']/g, (char) => {
  const escapeChars: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return escapeChars[char] || char
})
/**
 * Send an email. reCAPTCHA is mandatory.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.SendEmailPayload } = req
    const { from, to, subject, message, recaptchaToken: token, ip } = body

    if (!validator.isEmail(from)) {
      return res.status(400).send('Invalid email address')
    }
    if (!validator.isLength(subject, { min: 1, max: 255 })) {
      return res.status(400).send('Invalid subject length')
    }
    if (!validator.isLength(message, { min: 1, max: 5000 })) {
      return res.status(400).send('Invalid message length')
    }

    const result = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}&remoteip=${ip}`)
    const { success } = result.data

    if (!success) {
      return res.sendStatus(400)
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: env.SMTP_FROM,
      to,
      subject: escapeHTML(subject),
      html: `
        <p>
          ${i18n.t('FROM')}: ${escapeHTML(from)}<br>
          ${i18n.t('SUBJECT')}: ${escapeHTML(subject)}<br>
          ${i18n.t('MESSAGE')}:<br>${escapeHTML(message).replace(/(?:\r\n|\r|\n)/g, '<br>')}<br>
        </p>
      `,
    }
    await mailHelper.sendMail(mailOptions)

    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[user.delete] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Check if password exists.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const hasPassword = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    if (!helper.isValidObjectId(id)) {
      throw new Error('User id not valid')
    }
    const passwordExists = await User.exists({ _id: id, password: { $ne: null } })

    if (passwordExists) {
      return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[user.hasPassword] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
} // Modèle MongoDB

export const getUsersReviews = async (req: Request, res: Response) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query

    // Récupérer les données de session et l'utilisateur connecté
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)

    const isAdmin = connectedUser ? helper.admin(connectedUser) : false

    // Construire les filtres dynamiques
    const filters: Record<string, any> = {}

    // Filtrer par type (user ou supplier)
    if (type && typeof type === 'string') {
      filters.type = type
    } else {
      filters.type = { $in: ['user', 'supplier'] }
    }

    // Recherche partielle par nom ou email
    if (search && typeof search === 'string') {
      const regex = new RegExp(search, 'i')
      filters.$or = [
        { fullName: regex },
        { email: regex },
      ]
    }

    // Pagination
    const pageNumber = parseInt(page as string, 10)
    const pageSize = parseInt(limit as string, 10)
    const offset = (pageNumber - 1) * pageSize

    // Pipeline d'agrégation de base
    const basePipeline: mongoose.PipelineStage[] = [
      { $match: filters },
      { $unwind: '$reviews' },
      {
        $lookup: {
          from: 'User', // Nom de la collection
          localField: 'reviews.user',
          foreignField: '_id',
          as: 'reviewerInfo',
        },
      },
      { $unwind: '$reviewerInfo' },
    ]

    // Si l'utilisateur n'est pas admin, filtrer les avis
    if (!isAdmin) {
      const userId = new mongoose.Types.ObjectId(sessionData.id)

      basePipeline.push({
        $match: {
          $or: [
            { _id: userId }, // L'utilisateur est le destinataire de l'avis
            { 'reviews.user': userId }, // L'utilisateur est l'auteur de l'avis
          ],
        },
      })
    }

    // Pipeline pour obtenir les avis paginés
    const reviewPipeline: mongoose.PipelineStage[] = [
      ...basePipeline,
      {
        $project: {
          receiverFullName: '$fullName',
          receiverEmail: '$email',
          reviewerFullName: '$reviewerInfo.fullName',
          reviewerEmail: '$reviewerInfo.email',
          reviewerAvatar: '$reviewerInfo.avatar',
          reviewerType: '$reviewerInfo.type',
          rating: '$reviews.rating',
          comments: '$reviews.comments',
          createdAt: '$reviews.createdAt',
          booking: '$reviews.booking',
          rentedCar: '$reviews.rentedCar',
          answeredCall: '$reviews.answeredCall',
          canceledLastMinute: '$reviews.canceledLastMinute',
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: offset },
      { $limit: pageSize },
    ]

    const reviewsData = await User.aggregate(reviewPipeline)

    // Pipeline pour compter le nombre total d'avis
    const countPipeline: mongoose.PipelineStage[] = [
      ...basePipeline,
      { $count: 'total' },
    ]
    const totalResults = await User.aggregate(countPipeline)
    const totalReviews = totalResults.length > 0 ? totalResults[0].total : 0

    return res.json({
      currentPage: pageNumber,
      totalReviews,
      reviews: reviewsData,
    })
  } catch (err) {
    console.error('[getUsersReviews] Error:', err)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}

export const getVerifiedUsers = async (req: Request, res: Response) => {
  try {
    const { type } = req.query

    let selectedTypes: bookcarsTypes.UserType[] = [
      bookcarsTypes.UserType.User,
      bookcarsTypes.UserType.Supplier,
    ]

    if (type === bookcarsTypes.UserType.User) {
      selectedTypes = [bookcarsTypes.UserType.User]
    } else if (type === bookcarsTypes.UserType.Supplier) {
      selectedTypes = [bookcarsTypes.UserType.Supplier]
    }

    const users = await User.find(
      {
        verified: true,
        expireAt: null,
        type: { $in: selectedTypes },
      },
      {
        fullName: 1,
        phone: 1,
        email: 1,
        avatar: 1,
        type: 1,
        slug: 1,
      },
    ).sort({ fullName: 1 })

    return res.json(users)
  } catch (err) {
    logger.error(`[user.getVerifiedUsers] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
