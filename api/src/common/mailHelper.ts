import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { generateEmailTemplate } from 'src/lang/template/emailTemplate'
import * as env from '../config/env.config'

/**
 * Send an email.
 *
 * @export
 * @param {nodemailer.SendMailOptions} mailOptions
 * @returns {Promise<unknown>}
 */
export const sendMail = (mailOptions: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo> => {
    const transporterOptions: SMTPTransport.Options = {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    }

    const transporter: nodemailer.Transporter = nodemailer.createTransport(transporterOptions)

    return new Promise((resolve, reject) => {
      // Créez une copie sécurisée de mailOptions
      const updatedMailOptions: nodemailer.SendMailOptions = {
        ...mailOptions,
        // Générer le contenu HTML si mailOptions.html est une chaîne
        html: typeof mailOptions.html === 'string' ? generateEmailTemplate(mailOptions.subject || '', mailOptions.html) : mailOptions.html,
      }
      // Envoyer l'email avec la copie mise à jour
      transporter.sendMail(updatedMailOptions, (err: Error | null, info: nodemailer.SentMessageInfo) => {
        if (err) {
          reject(err)
        } else {
          resolve(info)
        }
      })
    })
  }
