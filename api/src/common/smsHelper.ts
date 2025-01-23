// services/smsService.ts

import axios from 'axios'

import * as env from '../config/env.config'
import { sendMail } from './mailHelper'
import { PhoneNumberResult } from '../config/env.config'

function generateRandomMsgId(): string {
    const min = 100000 // Le plus petit nombre à 6 chiffres (100000)
    const max = 999999 // Le plus grand nombre à 6 chiffres (999999)
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
    return randomNumber.toString()
  }

/**
 * Send an SMS. If SMS is disabled or fails, send an email to info@plany.tn.
 *
 * @export
 * @param {SmsOptions} smsOptions
 * @returns {Promise<unknown>}
 */
export const sendSms = async (mobile: string, message: string): Promise<unknown> => {
  // Vérifiez si le service SMS est activé
  if (!env.SMS_ACTIVE) {
    console.log("Service SMS désactivé. Envoi d'un e-mail à info@plany.tn.")

    // Envoyer un e-mail avec les détails du SMS
    const emailSubject = `SMS désactivé - Message non envoyé à ${mobile}`
    const emailContent = `
      <p>Le service SMS est désactivé. Voici les détails du message non envoyé :</p>
      <ul>
        <li><strong>Numéro de téléphone :</strong> ${mobile}</li>
        <li><strong>Message :</strong> ${message}</li>
      </ul>
    `

    await sendMail({
      to: env.INFO_EMAIL,
      subject: emailSubject,
      html: emailContent,
    })

    return { status: 'inactive', message: 'Service SMS désactivé. Un e-mail a été envoyé à info@plany.tn.' }
  }

  // Construire l'URL de l'API SMS
  const params = new URLSearchParams()
  params.append('fct', 'sms')
  params.append('key', env.SMS_API_KEY)
  params.append('mobile', mobile)
  params.append('sms', message)
  params.append('sender', env.SMS_SENDER)
  params.append('msg_id', generateRandomMsgId())

  const url = `${env.SMS_API_URL}?${params.toString()}`

  try {
    const response = await axios.get(url)
    console.log('SMS envoyé avec succès:', response.data)
    return response.data
  } catch (error) {
    console.error("Erreur lors de l'envoi du SMS:", error)

    // Envoyer un e-mail en cas d'erreur
    const emailSubject = `Erreur d'envoi de SMS à ${mobile}`
    const emailContent = `
      <p>Une erreur s'est produite lors de l'envoi du SMS. Voici les détails :</p>
      <ul>
        <li><strong>Numéro de téléphone :</strong> ${mobile}</li>
        <li><strong>Message :</strong> ${message}</li>
        <li><strong>Erreur :</strong> ${error instanceof Error ? error.message : 'Erreur inconnue'}</li>
      </ul>
    `

    await sendMail({
      to: env.INFO_EMAIL,
      subject: emailSubject,
      html: emailContent,
    })

    throw error
  }
}

  /**
 * Formate et valide les numéros de téléphone tunisiens (mobiles uniquement).
 * @param phoneNumber - Le numéro de téléphone à vérifier.
 * @returns Un objet contenant le numéro formaté et sa validité.
 */
  export const validateAndFormatPhoneNumber = (phoneNumber: string | undefined): PhoneNumberResult => {
    if (!phoneNumber) {
        return { phone: '', isValide: false }
    }
    // Nettoyer le numéro : retirer les espaces, "+" et "00" au début
    let cleanedNumber = phoneNumber.trim().replace(/\s+/g, '').replace(/^(\+|00)/, '')

    // Vérifier si le numéro commence par "216"
    if (!cleanedNumber.startsWith('216')) {
      cleanedNumber = `216${cleanedNumber}`
    }

    // Extraire les 8 derniers chiffres après "216"
    const localNumber = cleanedNumber.slice(3)

    // Liste des préfixes valides pour les numéros mobiles tunisiens
    const validPrefixes = [
      /^2\d{7}$/, // Ooredoo
      /^5\d{7}$/, // Orange Tunisie
      /^9\d{7}$/, // Tunisie Telecom
      /^4\d{7}$/, // Elissa et Nessma Mobile
    ]

    // Vérifier si le numéro est valide selon les préfixes
    const isValide = validPrefixes.some((regex) => regex.test(localNumber))

    return {
      phone: isValide ? `216${localNumber}` : phoneNumber,
      isValide,
    }
  }
