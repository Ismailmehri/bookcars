import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'
import * as env from '../config/env.config'
import * as helper from './helper'
import * as bookcarsTypes from ':bookcars-types'

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

  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const stream = fs.createWriteStream(file)
    doc.pipe(stream)

    doc.fontSize(20).text('Invoice', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Supplier: ${supplier.fullName}`)
    doc.text(`Email: ${supplier.email}`)
    doc.moveDown()
    doc.text(`Plan: ${subscription.plan}`)
    doc.text(`Period: ${subscription.period}`)
    const price = getPrice(
      subscription.plan as bookcarsTypes.SubscriptionPlan,
      subscription.period as bookcarsTypes.SubscriptionPeriod,
    )
    doc.text(`Price: ${price.toFixed(2)} DT`)
    doc.text(`Start: ${new Date(subscription.startDate).toLocaleDateString()}`)
    doc.text(`End: ${new Date(subscription.endDate).toLocaleDateString()}`)

    doc.end()
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}
