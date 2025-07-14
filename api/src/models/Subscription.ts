import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'
import * as bookcarsTypes from ':bookcars-types'

const subscriptionSchema = new Schema<bookcarsTypes.Subscription>(
  {
    supplier: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: Object.values(bookcarsTypes.SubscriptionPlan), required: true },
    period: { type: String, enum: Object.values(bookcarsTypes.SubscriptionPeriod), required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    resultsCars: { type: Number, required: true },
    sponsoredCars: { type: Number, required: true },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Subscription',
  },
)

const Subscription = model<bookcarsTypes.Subscription>('Subscription', subscriptionSchema)
export default Subscription
