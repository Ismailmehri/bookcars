import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const reviewEmailCounterSchema = new Schema<env.ReviewEmailCounter>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Booking',
      index: true,
    },
    count: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'ReviewEmailCounter',
  },
)

reviewEmailCounterSchema.index({ user: 1, booking: 1 }, { unique: true })

const ReviewEmailCounter = model<env.ReviewEmailCounter>('ReviewEmailCounter', reviewEmailCounterSchema)

export default ReviewEmailCounter
