import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const CarStatsSchema = new Schema<env.ICarStats>({
    car: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
      index: true,
    },
    pickupLocation: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    supplier: {
      ref: 'User',
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
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
      index: true,
    },
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    clientId: {
        type: String,
        index: true,
        required: false,
      },
    paidView: {
      type: Boolean,
      default: false,
      index: true,
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

  // Index optimisé pour les requêtes fréquentes
  CarStatsSchema.index({ car: 1, paidView: 1 })

  export const CarStats = model<env.ICarStats>('CarStats', CarStatsSchema)
