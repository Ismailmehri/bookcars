import { Schema, model } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'

const agencyCommissionEventSchema = new Schema<env.AgencyCommissionEvent>(
  {
    agency: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      index: true,
    },
    month: {
      type: Number,
      required: [true, "can't be blank"],
      min: 1,
      max: 12,
      index: true,
    },
    year: {
      type: Number,
      required: [true, "can't be blank"],
      min: 1970,
      index: true,
    },
    type: {
      type: String,
      required: [true, "can't be blank"],
      enum: Object.values(bookcarsTypes.AgencyCommissionEventType),
    },
    admin: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      index: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentDate: {
      type: Date,
    },
    reference: {
      type: String,
      trim: true,
    },
    channel: {
      type: String,
      enum: Object.values(bookcarsTypes.CommissionReminderChannel),
    },
    success: {
      type: Boolean,
    },
    message: {
      type: String,
    },
    note: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'AgencyCommissionEvent',
  },
)

agencyCommissionEventSchema.index({ agency: 1, month: 1, year: 1, type: 1 })

const AgencyCommissionEvent = model<env.AgencyCommissionEvent>('AgencyCommissionEvent', agencyCommissionEventSchema)

export default AgencyCommissionEvent
