import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const payedReviewClientCountSchema = new Schema<env.PayedReviewClientCount>(
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
    collection: 'PayedReviewClientCount',
  },
)

payedReviewClientCountSchema.index({ user: 1, booking: 1 }, { unique: true })

const PayedReviewClientCount = model<env.PayedReviewClientCount>('PayedReviewClientCount', payedReviewClientCountSchema)

export default PayedReviewClientCount
