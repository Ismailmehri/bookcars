import { Schema, model } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'

const agencyCommissionSettingsSchema = new Schema<env.AgencyCommissionSettings>(
  {
    reminderChannel: {
      type: String,
      enum: Object.values(bookcarsTypes.CommissionReminderChannel),
      default: bookcarsTypes.CommissionReminderChannel.Email,
    },
    emailTemplate: {
      type: String,
      default:
        'Bonjour {{agencyName}},\n\nNous vous rappelons que la commission de {{amount}} TND pour {{month}} {{year}} reste due.\nMerci de procéder au règlement.\n\nCordialement,\nL\'équipe Plany',
    },
    smsTemplate: {
      type: String,
      default: 'Plany: Commission de {{amount}} TND pour {{month}}/{{year}} toujours en attente. Merci de régulariser.',
    },
    bankTransferEnabled: {
      type: Boolean,
      default: true,
    },
    cardPaymentEnabled: {
      type: Boolean,
      default: false,
    },
    d17PaymentEnabled: {
      type: Boolean,
      default: false,
    },
    bankTransferRibInformation: {
      type: String,
      default: '',
    },
    bankTransferRibDetails: {
      type: {
        accountHolder: { type: String, trim: true },
        bankName: { type: String, trim: true },
        bankAddress: { type: String, trim: true },
        iban: { type: String, trim: true },
        bic: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
      },
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'AgencyCommissionSettings',
  },
)

const AgencyCommissionSettings = model<env.AgencyCommissionSettings>('AgencyCommissionSettings', agencyCommissionSettingsSchema)

export default AgencyCommissionSettings
