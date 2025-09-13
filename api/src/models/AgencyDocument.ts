import { Schema, model, Document, Types } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'

export interface AgencyDocument extends Document {
  agency: Types.ObjectId
  docType: bookcarsTypes.AgencyDocumentType
  createdAt: Date
}

const agencyDocumentSchema = new Schema<AgencyDocument>(
  {
    agency: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "can't be blank"],
      index: true,
    },
    docType: {
      type: String,
      enum: Object.values(bookcarsTypes.AgencyDocumentType),
      required: [true, "can't be blank"],
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    strict: true,
    collection: 'AgencyDocument',
  },
)

export default model<AgencyDocument>('AgencyDocument', agencyDocumentSchema)
