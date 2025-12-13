import { Schema, model } from 'mongoose'

export interface MarketingEmailStatDocument {
  date: Date
  sentCount: number
  openCount: number
  clickCount: number
}

const marketingEmailStatSchema = new Schema<MarketingEmailStatDocument>({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  sentCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  openCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  clickCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
})

marketingEmailStatSchema.index({ date: 1 }, { unique: true })

export default model<MarketingEmailStatDocument>('MarketingEmailStat', marketingEmailStatSchema)
