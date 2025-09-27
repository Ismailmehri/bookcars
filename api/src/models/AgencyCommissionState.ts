import { Schema, model, Types } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'

interface ReminderStats {
  emailCount: number
  smsCount: number
  lastEmailAt?: Date
  lastSmsAt?: Date
}

interface CreatedByInfo {
  _id?: Types.ObjectId
  fullName?: string
}

interface NoteEntry {
  message: string
  createdAt: Date
  createdBy?: CreatedByInfo
}

interface LogEntry {
  type: bookcarsTypes.AgencyCommissionLogType
  message: string
  createdAt: Date
  createdBy?: CreatedByInfo
}

export interface AgencyCommissionStateDocument {
  supplier: Types.ObjectId
  month: number
  year: number
  paymentStatus: bookcarsTypes.AgencyCommissionPaymentStatus
  commissionPaid: number
  blocked: boolean
  reminders: ReminderStats
  notes: NoteEntry[]
  logs: LogEntry[]
  createdAt: Date
  updatedAt: Date
}

const reminderSchema = new Schema<ReminderStats>({
  emailCount: { type: Number, default: 0 },
  smsCount: { type: Number, default: 0 },
  lastEmailAt: { type: Date },
  lastSmsAt: { type: Date },
}, { _id: false })

const createdBySchema = new Schema<CreatedByInfo>({
  _id: { type: Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String },
}, { _id: false })

const noteSchema = new Schema<NoteEntry>({
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: createdBySchema },
}, { _id: true })

const logSchema = new Schema<LogEntry>({
  type: {
    type: String,
    enum: [
      'status',
      'reminder_email',
      'reminder_sms',
      'note',
      'block',
      'unblock',
      'invoice',
    ],
    required: true,
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: createdBySchema },
}, { _id: true })

const agencyCommissionStateSchema = new Schema<AgencyCommissionStateDocument>({
  supplier: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: [
      bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid,
      bookcarsTypes.AgencyCommissionPaymentStatus.FollowUp,
      bookcarsTypes.AgencyCommissionPaymentStatus.Partial,
      bookcarsTypes.AgencyCommissionPaymentStatus.Paid,
    ],
    default: bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid,
  },
  commissionPaid: { type: Number, default: 0 },
  blocked: { type: Boolean, default: false },
  reminders: { type: reminderSchema, default: () => ({ emailCount: 0, smsCount: 0 }) },
  notes: { type: [noteSchema], default: () => [] },
  logs: { type: [logSchema], default: () => [] },
}, {
  timestamps: true,
  collection: 'AgencyCommissionStates',
})

agencyCommissionStateSchema.index({ supplier: 1, month: 1, year: 1 }, { unique: true })

const AgencyCommissionState = model<AgencyCommissionStateDocument>('AgencyCommissionState', agencyCommissionStateSchema)

export default AgencyCommissionState
