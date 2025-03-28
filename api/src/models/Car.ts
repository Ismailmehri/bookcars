import { Schema, model } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'

const discountSchema = new Schema({
  threshold: {
    type: Number,
    required: [true, "Threshold can't be blank"],
  },
  percentage: {
    type: Number,
    required: [true, "Percentage can't be blank"],
    min: 0,
    max: 100,
  },
})

const boostSchema = new Schema({
  active: {
    type: Boolean,
    default: false,
    index: true,
  },
  paused: {
    type: Boolean,
    default: false,
  },
  purchasedViews: {
    type: Number,
    default: 0,
    min: -1,
  },
  consumedViews: {
    type: Number,
    default: 0,
    min: 0,
  },
  startDate: Date,
  endDate: Date,
  lastViewAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false })

const carSchema = new Schema<env.Car>(
  {
    name: {
      type: String,
      required: [true, "can't be blank"],
      index: true,
      trim: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      index: true,
    },
    minimumAge: {
      type: Number,
      required: [true, "can't be blank"],
      min: env.MINIMUM_AGE,
      max: 99,
    },
    locations: {
      type: [Schema.Types.ObjectId],
      ref: 'Location',
      index: true,
      validate: (value: any): boolean => Array.isArray(value) && value.length > 0,
    },

    // --------- price fields ---------
    dailyPrice: {
      type: Number,
      required: [true, "can't be blank"],
      index: true,
    },
    discountedDailyPrice: {
      type: Number,
    },
    biWeeklyPrice: {
      type: Number,
    },
    discountedBiWeeklyPrice: {
      type: Number,
    },
    weeklyPrice: {
      type: Number,
    },
    discountedWeeklyPrice: {
      type: Number,
    },
    monthlyPrice: {
      type: Number,
    },
    discountedMonthlyPrice: {
      type: Number,
    },
    periodicPrices: [
      {
        startDate: {
          type: Date,
          required: [true, "Start date can't be blank"],
        },
        endDate: {
          type: Date,
          required: [true, "End date can't be blank"],
        },
        dailyPrice: {
          type: Number,
          required: [true, "Daily price can't be blank"],
        },
      },
    ],
    // --------- end of price fields ---------
    unavailablePeriods: [
      {
        startDate: {
          type: Date,
          required: [true, "Start date can't be blank"],
        },
        endDate: {
          type: Date,
          required: [true, "End date can't be blank"],
        },
      },
    ],
    deposit: {
      type: Number,
      required: [true, "can't be blank"],
    },
    available: {
      type: Boolean,
      required: [true, "can't be blank"],
      index: true,
    },
    type: {
      type: String,
      enum: [
        bookcarsTypes.CarType.Diesel,
        bookcarsTypes.CarType.Gasoline,
        bookcarsTypes.CarType.Electric,
        bookcarsTypes.CarType.Hybrid,
        bookcarsTypes.CarType.PlugInHybrid,
        bookcarsTypes.CarType.Unknown,
      ],
      required: [true, "can't be blank"],
    },
    gearbox: {
      type: String,
      enum: [bookcarsTypes.GearboxType.Manual, bookcarsTypes.GearboxType.Automatic],
      required: [true, "can't be blank"],
    },
    aircon: {
      type: Boolean,
      required: [true, "can't be blank"],
    },
    image: {
      type: String,
    },
    seats: {
      type: Number,
      required: [true, "can't be blank"],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer',
      },
    },
    doors: {
      type: Number,
      required: [true, "can't be blank"],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer',
      },
    },
    fuelPolicy: {
      type: String,
      enum: [bookcarsTypes.FuelPolicy.LikeForLike, bookcarsTypes.FuelPolicy.FreeTank],
      required: [true, "can't be blank"],
    },
    mileage: {
      type: Number,
      required: [true, "can't be blank"],
    },
    cancellation: {
      type: Number,
      required: [true, "can't be blank"],
    },
    amendments: {
      type: Number,
      required: [true, "can't be blank"],
    },
    theftProtection: {
      type: Number,
      required: [true, "can't be blank"],
    },
    collisionDamageWaiver: {
      type: Number,
      required: [true, "can't be blank"],
    },
    fullInsurance: {
      type: Number,
      required: [true, "can't be blank"],
    },
    additionalDriver: {
      type: Number,
      required: [true, "can't be blank"],
    },
    range: {
      type: String,
      enum: [
        bookcarsTypes.CarRange.Mini,
        bookcarsTypes.CarRange.Midi,
        bookcarsTypes.CarRange.Maxi,
        bookcarsTypes.CarRange.Scooter,
      ],
      required: [true, "can't be blank"],
    },
    multimedia: [{
      type: String,
      enum: [
        bookcarsTypes.CarMultimedia.AndroidAuto,
        bookcarsTypes.CarMultimedia.AppleCarPlay,
        bookcarsTypes.CarMultimedia.Bluetooth,
        bookcarsTypes.CarMultimedia.Touchscreen,
      ],
    }],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    trips: {
      type: Number,
      default: 0,
    },
    co2: {
      type: Number,
    },
    minimumDrivingLicenseYears: {
      type: Number,
    },

    // Nouveaux champs
    minimumRentalDays: {
      type: Number,
      // required: [true, "Minimum rental days can't be blank"],
      min: 0, // Au moins 1 jour
    },
    discounts: discountSchema, // Liste des remises
    boost: boostSchema,
    boostHistory: [boostSchema],
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Car',
  },
)

const Car = model<env.Car>('Car', carSchema)

export default Car
