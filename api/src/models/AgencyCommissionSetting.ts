import { Schema, model } from 'mongoose'

export interface AgencyCommissionSettingDocument {
  email_subject: string
  email_body: string
  sms_body: string
  from_email: string
  from_name: string
  from_sms_sender: string
  default_channel: 'email' | 'sms' | 'both'
  updated_by?: Schema.Types.ObjectId
  updated_by_name?: string
  updated_at?: Date
}

const agencyCommissionSettingSchema = new Schema<AgencyCommissionSettingDocument>({
  email_subject: { type: String, default: '' },
  email_body: { type: String, default: '' },
  sms_body: { type: String, default: '' },
  from_email: { type: String, default: '' },
  from_name: { type: String, default: '' },
  from_sms_sender: { type: String, default: '' },
  default_channel: { type: String, enum: ['email', 'sms', 'both'], default: 'email' },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  updated_by_name: { type: String },
  updated_at: { type: Date, default: Date.now },
}, {
  collection: 'AgencyCommissionSettings',
  timestamps: false,
})

const AgencyCommissionSetting = model<AgencyCommissionSettingDocument>('AgencyCommissionSetting', agencyCommissionSettingSchema)

export default AgencyCommissionSetting
