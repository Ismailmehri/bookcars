import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const agencyCommissionStateSchema = new Schema<env.AgencyCommissionState>(
  {
    agency: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      unique: true,
      index: true,
    },
    blocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    blockedAt: {
      type: Date,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    disabledCars: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Car',
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
    collection: 'AgencyCommissionState',
  },
)

const AgencyCommissionState = model<env.AgencyCommissionState>('AgencyCommissionState', agencyCommissionStateSchema)

export default AgencyCommissionState
