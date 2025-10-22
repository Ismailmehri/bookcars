import { Schema, model } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'

const agencyNoteSchema = new Schema<env.AgencyNote>(
  {
    agency: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(bookcarsTypes.AgencyNoteType),
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    collection: 'AgencyNotes',
    timestamps: true,
  },
)

const AgencyNote = model<env.AgencyNote>('AgencyNote', agencyNoteSchema)

export default AgencyNote
