import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const CarStatsSchema = new Schema<env.ICarStats>({
  car: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  pickupLocation: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  supplier: {
    ref: 'User',
    type: Schema.Types.ObjectId,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
  days: {
    type: Number,
    required: true,
    min: 1,
  },
  clientId: {
    type: String,
    required: false,
  },
  paidView: {
    type: Boolean,
    default: false,
  },
  conversion: {
    viewedDetails: {
      type: Boolean,
      default: false,
    },
    booked: {
      type: Boolean,
      default: false,
    },
    contacted: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
  collection: 'CarStats',
})

// ✅ Index utiles pour tes requêtes (et uniquement ceux-là) :
CarStatsSchema.index({ car: 1, paidView: 1 }) // utilisé dans stats
CarStatsSchema.index({ supplier: 1, viewedAt: 1, car: 1 }) // utilisé dans getCarStats
CarStatsSchema.index({ supplier: 1 }) // utilisé dans getUniqueSuppliers

export const CarStats = model<env.ICarStats>('CarStats', CarStatsSchema)
