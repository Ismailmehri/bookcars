import { Schema, model, Document, Types } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'

export interface AgencyDocumentVersion extends Document {
  document: Types.ObjectId
  version: number
  originalFilename: string
  contentType: string
  sizeBytes: number
  sha256: string
  absPath: string
  relPath: string
  status: bookcarsTypes.AgencyDocumentStatus
  statusChangedBy?: Types.ObjectId
  statusChangedAt?: Date
  statusComment?: string
  uploadedBy: Types.ObjectId
  uploadedAt: Date
  note?: string
}

const agencyDocumentVersionSchema = new Schema<AgencyDocumentVersion>(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: 'AgencyDocument',
      required: [true, "can't be blank"],
      index: true,
    },
    version: {
      type: Number,
      required: [true, "can't be blank"],
    },
    originalFilename: {
      type: String,
      required: [true, "can't be blank"],
    },
    contentType: {
      type: String,
      required: [true, "can't be blank"],
    },
    sizeBytes: {
      type: Number,
      required: [true, "can't be blank"],
    },
    sha256: {
      type: String,
      required: [true, "can't be blank"],
    },
    absPath: {
      type: String,
      required: [true, "can't be blank"],
    },
    relPath: {
      type: String,
      required: [true, "can't be blank"],
    },
    status: {
      type: String,
      enum: Object.values(bookcarsTypes.AgencyDocumentStatus),
      default: bookcarsTypes.AgencyDocumentStatus.EN_REVUE,
      index: true,
    },
    statusChangedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    statusChangedAt: Date,
    statusComment: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "can't be blank"],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    note: String,
  },
  {
    strict: true,
    collection: 'AgencyDocumentVersion',
  },
)

export default model<AgencyDocumentVersion>('AgencyDocumentVersion', agencyDocumentVersionSchema)
