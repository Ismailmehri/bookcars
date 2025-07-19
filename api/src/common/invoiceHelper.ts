import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import * as env from '../config/env.config'
import * as helper from './helper'
import * as bookcarsTypes from ':bookcars-types'

const LOGO_URL = 'https://plany.tn/logo.png'

const basePrices: Record<bookcarsTypes.SubscriptionPlan, number> = {
  [bookcarsTypes.SubscriptionPlan.Free]: 0,
  [bookcarsTypes.SubscriptionPlan.Basic]: 10,
  [bookcarsTypes.SubscriptionPlan.Premium]: 30,
}

const getPrice = (
  plan: bookcarsTypes.SubscriptionPlan,
  period: bookcarsTypes.SubscriptionPeriod,
) => {
  const monthly = basePrices[plan]
  const total =
    period === bookcarsTypes.SubscriptionPeriod.Monthly
      ? monthly
      : monthly * 12 * 0.8
  return Math.round(total)
}

export const generateInvoice = async (
  subscription: bookcarsTypes.Subscription,
  supplier: bookcarsTypes.User,
) => {
  if (!subscription.invoice) {
    throw new Error('invoice filename missing')
  }
  await helper.mkdir(env.CDN_INVOICES)
  const file = path.join(env.CDN_INVOICES, subscription.invoice)

  return new Promise<void>(async (resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const stream = fs.createWriteStream(file)
    doc.pipe(stream)

    let logo: Buffer | null = null
    try {
      const res = await axios.get(LOGO_URL, { responseType: 'arraybuffer' })
      logo = Buffer.from(res.data)
    } catch {
      logo = null
    }

    if (logo) {
      doc.image(logo, 50, 40, { width: 110 })
    }

    doc.fontSize(20).text('FACTURE', { align: 'center' })
    doc.moveDown()

    const invoiceNumber = subscription.invoice.replace('.pdf', '')
    doc.fontSize(12).text(`Numéro de facture : ${invoiceNumber}`)
    doc.text(`Date d'émission : ${new Date().toLocaleDateString()}`)
    doc.moveDown()

    doc.font('Helvetica-Bold').text('Plany')
    doc.font('Helvetica').text('Tunis, Tunisie')
    doc.text('contact@plany.tn')
    doc.moveDown()

    doc.font('Helvetica-Bold').text('Client :')
    doc.font('Helvetica').text(supplier.fullName)
    if (supplier.email) {
      doc.text(supplier.email)
    }
    doc.moveDown()

    const price = getPrice(
      subscription.plan as bookcarsTypes.SubscriptionPlan,
      subscription.period as bookcarsTypes.SubscriptionPeriod,
    )

    const tableTop = doc.y
    const startX = 50
    const colWidths = [80, 80, 120, 120, 80]
    const rowHeight = 20
    const tableWidth = colWidths.reduce((a, b) => a + b, 0)

    const drawRow = (
      y: number,
      values: string[],
      header = false,
    ) => {
      let x = startX
      if (header) {
        doc.font('Helvetica-Bold')
      } else {
        doc.font('Helvetica')
      }
      values.forEach((v, i) => {
        doc.text(v, x + 5, y + 6, { width: colWidths[i] - 10, align: 'center' })
        x += colWidths[i]
      })
      doc.rect(startX, y, tableWidth, rowHeight).stroke()
    }

    drawRow(tableTop, ['Plan', 'Période', 'Début', 'Fin', 'Montant'], true)
    drawRow(
      tableTop + rowHeight,
      [
        subscription.plan,
        subscription.period,
        new Date(subscription.startDate).toLocaleDateString(),
        new Date(subscription.endDate).toLocaleDateString(),
        `${price.toFixed(2)} DT`,
      ],
    )

    const summaryY = tableTop + rowHeight * 2 + 20
    doc.font('Helvetica-Bold').text(`Total TTC : ${price.toFixed(2)} DT`, startX, summaryY, {
      align: 'right',
      width: tableWidth,
    })
    doc.font('Helvetica').text('Statut : Payé', startX, summaryY + 15, {
      align: 'right',
      width: tableWidth,
    })

    doc.moveDown(4)
    doc.fontSize(10).text(
      'Document généré automatiquement – Merci d\'avoir choisi Plany',
      { align: 'center' },
    )
    doc.text('https://plany.tn', { align: 'center' })

    doc.end()
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}
