import validator from 'validator'
import { Schema, model } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'

export const USER_EXPIRE_AT_INDEX_NAME = 'expireAt'

const userSchema = new Schema<env.User>(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      validate: [validator.isEmail, 'is not valid'],
      index: true,
      trim: true,
    },
    phone: {
      type: String,
      validate: {
        validator: (value: string) => {
          // Check if value is empty then return true.
          if (!value) {
            return true
          }

          // If value is empty will not validate for mobile phone.
          return validator.isMobilePhone(value)
        },
        message: '{VALUE} is not valid',
      },
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "can't be blank"],
      index: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    birthDate: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    agencyVerified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    language: {
      // ISO 639-1 (alpha-2 code)
      type: String,
      default: env.DEFAULT_LANGUAGE,
      lowercase: true,
      minlength: 2,
      maxlength: 2,
    },
    lastLoginAt: {
      type: Date,
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        bookcarsTypes.UserType.Admin,
        bookcarsTypes.UserType.Supplier,
        bookcarsTypes.UserType.User,
      ],
      default: bookcarsTypes.UserType.User,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    payLater: {
      type: Boolean,
      default: true,
    },
    customerId: {
      type: String,
    },
    emailLogs: [{
      type: {
        type: String,
        enum: Object.values(bookcarsTypes.EmailType),
        required: true,
      },
      name: {
        type: String,
        enum: Object.values(bookcarsTypes.EmailName),
        required: true,
      },
      sentAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
    }],
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    contracts: [{
      language: {
        type: String,
        required: [true, "can't be blank"],
        trim: true,
        lowercase: true,
        minLength: 2,
        maxLength: 2,
      },
      file: String,
    }],
    expireAt: {
      type: Date,
      index: { name: USER_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.USER_EXPIRE_AT, background: true },
    },
    reviews: [{
      booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comments: {
        type: String,
        required: false,
      },
      rentedCar: {
        type: Boolean,
        required: true,
      },
      answeredCall: {
        type: Boolean,
        required: true,
      },
      canceledLastMinute: {
        type: Boolean,
        required: true,
      },
      carEta: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    score: {
      type: Number,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'User',
  },
)

const User = model<env.User>('User', userSchema)

export default User

export interface Review {
  _id?: string;
  booking: string; // ID de la réservation associée
  user: string; // ID de l'agence qui a soumis l'avis
  type: string // profile
  rating: number; // Note de 1 à 5
  comments?: string; // Commentaires de l'agence
  rentedCar: boolean; // La voiture a-t-elle été louée ?
  answeredCall: boolean; // Le conducteur a-t-il répondu au téléphone ?
  canceledLastMinute: boolean; // Annulation de dernière minute ?
  carEta?: string; // Temps d'arrivée estimé de la voiture
  createdAt: Date; // Date de création de l'avis
}
