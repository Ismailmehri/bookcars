export enum UserType {
  Admin = 'admin',
  Supplier = 'supplier',
  User = 'user',
}

export enum AppType {
  Backend = 'backend',
  Frontend = 'frontend',
}

export enum CarType {
  Diesel = 'diesel',
  Gasoline = 'gasoline',
  Electric = 'electric',
  Hybrid = 'hybrid',
  PlugInHybrid = 'plugInHybrid',
  Unknown = 'unknown'
}

export enum CarRange {
  Mini = 'mini',
  Midi = 'midi',
  Maxi = 'maxi',
  Scooter = 'scooter',
}

export enum CarMultimedia {
  Touchscreen = 'touchscreen',
  Bluetooth = 'bluetooth',
  AndroidAuto = 'androidAuto',
  AppleCarPlay = 'appleCarPlay',
}

export enum GearboxType {
  Manual = 'manual',
  Automatic = 'automatic'
}

export enum FuelPolicy {
  LikeForLike = 'likeForlike',
  FreeTank = 'freeTank'
}

export enum BookingStatus {
  Void = 'void',
  Pending = 'pending',
  Deposit = 'deposit',
  Paid = 'paid',
  Reserved = 'reserved',
  Cancelled = 'cancelled'
}

export enum Mileage {
  Limited = 'limited',
  Unlimited = 'unlimited'
}

export enum Availablity {
  Available = 'available',
  Unavailable = 'unavailable'
}

export enum RecordType {
  Admin = 'admin',
  Supplier = 'supplier',
  User = 'user',
  Car = 'car',
  Location = 'location',
  Country = 'country',
}

export interface Booking {
  _id?: string
  supplier: string | User
  car: string | Car
  driver?: string | User
  pickupLocation: string | Location
  dropOffLocation: string | Location
  from: Date
  to: Date
  status: BookingStatus
  cancellation?: boolean
  amendments?: boolean
  theftProtection?: boolean
  collisionDamageWaiver?: boolean
  fullInsurance?: boolean
  additionalDriver?: boolean
  _additionalDriver?: string | AdditionalDriver
  cancelRequest?: boolean
  price?: number
  sessionId?: string
  paymentIntentId?: string
  customerId?: string
  expireAt?: Date
}

export interface CheckoutPayload {
  driver?: User
  booking?: Booking
  additionalDriver?: AdditionalDriver
  payLater: boolean
  sessionId?: string
  paymentIntentId?: string
  customerId?: string
}

export interface Filter {
  from?: Date
  to?: Date
  keyword?: string
  pickupLocation?: string
  dropOffLocation?: string
}

export interface GetBookingsPayload {
  suppliers: string[] | undefined
  statuses: string[] | undefined
  user?: string
  car?: string
  filter?: Filter
}

export interface AdditionalDriver {
  fullName: string
  email: string
  phone: string
  birthDate: Date
}

export interface UpsertBookingPayload {
  booking: Booking
  additionalDriver?: AdditionalDriver
}

export interface LocationName {
  language: string
  name: string
}

export interface CountryName {
  language: string
  name: string
}

export interface UpsertLocationPayload {
  country: string
  longitude?: number
  latitude?: number
  names: LocationName[]
  image?: string | null
  parkingSpots?: ParkingSpot[]
}

export interface UpdateSupplierPayload {
  _id: string
  fullName: string
  phone: string
  location: string
  bio: string
  payLater: boolean
}

export interface Discount {
  threshold: number;
  percentage: number;
}

export interface CreateCarPayload {
  name: string
  supplier: string
  minimumAge: number
  locations: string[]

  dailyPrice: number
  discountedDailyPrice: number | null
  biWeeklyPrice: number | null
  discountedBiWeeklyPrice: number | null
  weeklyPrice: number | null
  discountedWeeklyPrice: number | null
  monthlyPrice: number | null
  discountedMonthlyPrice: number | null
  periodicPrices: PricePeriod[];
  unavailablePeriods: UnavailablePeriod[];

  deposit: number
  available: boolean
  type: string
  gearbox: string
  aircon: boolean
  image?: string
  seats: number
  doors: number
  fuelPolicy: string
  mileage: number
  cancellation: number
  amendments: number
  theftProtection: number
  collisionDamageWaiver: number
  fullInsurance: number
  additionalDriver: number
  range: string
  multimedia: string[]
  rating?: number
  co2?: number
  minimumDrivingLicenseYears?: number
  minimumRentalDays?: number
  discounts?: Discount
}

export interface UpdateCarPayload extends CreateCarPayload {
  _id: string
}

export interface CarSpecs {
  aircon?: boolean,
  moreThanFourDoors?: boolean,
  moreThanFiveSeats?: boolean,
}

export interface GetCarsPayload {
  maxPrice?: number
  minPrice?: number
  suppliers?: string[];
  carSpecs?: CarSpecs;
  carType?: string[];
  gearbox?: string[];
  mileage?: string[];
  fuelPolicy?: string[];
  deposit?: number;
  availability?: string[];
  pickupLocation?: string;
  ranges?: string[];
  multimedia?: string[];
  rating?: number;
  seats?: number;
  startDate?: Date; 
  endDate?: Date;
}

export interface SignUpPayload {
  email: string
  password: string
  fullName: string
  phone?: string
  language: string
  active?: boolean
  verified?: boolean
  blacklisted?: boolean
  type?: string
  avatar?: string
  birthDate?: number | Date
}

export type Contract = { language: string, file: string | null }

export interface CreateUserPayload {
  email?: string
  phone: string
  location: string
  bio: string
  fullName: string
  type?: string
  avatar?: string
  birthDate?: number | Date
  language?: string
  password?: string
  verified?: boolean
  blacklisted?: boolean
  payLater?: boolean
  supplier?: string
  contracts?: Contract[]
  active?: boolean
}

export interface UpdateUserPayload extends CreateUserPayload {
  _id: string
  enableEmailNotifications?: boolean
  payLater?: boolean
  active?: boolean
  reviews?: Review[];
}

export interface AddReviewPayload {
  _id: string
  review?: Review;
}

export interface ChangePasswordPayload {
  _id: string
  password: string
  newPassword: string
  strict: boolean
}

export interface ActivatePayload {
  userId: string
  token: string
  password: string
}

export interface ValidateEmailPayload {
  email: string
}

export enum SocialSignInType {
  Facebook = 'facebook',
  Apple = 'apple',
  Google = 'google'
}

export enum EmailType {
  Promotional = 'promotional',
  Transactional = 'transactional',
  Notification = 'notification',
}

export enum EmailName {
  SupplierReminderNoCars = 'SUPPLIER_REMINDER_NO_CARS', // Rappel aux fournisseurs sans voitures
  SupplierReminderNoPhone = 'SUPPLIER_REMINDER_NO_PHONE', // Rappel aux fournisseurs sans numéro de téléphone
  ClientReminderNoPhone = 'CLIENT_REMINDER_NO_PHONE', // Rappel aux clients sans numéro de téléphone
  SupplierPendingBookingReminder = 'SUPPLIER_PENDING_BOOKING_REMINDER', // Rappel aux fournisseurs avec des réservations en attente
}

export interface SignInPayload {
  email?: string
  password?: string
  stayConnected?: boolean
  mobile?: boolean
  fullName?: string
  avatar?: string
  accessToken?: string
  socialSignInType?: SocialSignInType
}

export interface ResendLinkPayload {
  email?: string
}

export interface UpdateEmailNotificationsPayload {
  _id: string
  enableEmailNotifications: boolean
}

export interface UpdateLanguagePayload {
  id: string
  language: string
}

export interface ValidateSupplierPayload {
  fullName: string
}

export interface ValidateLocationPayload {
  language: string
  name: string
}

export interface ValidateCountryPayload {
  language: string
  name: string
}

export interface UpdateStatusPayload {
  ids: string[]
  status: string
}

export interface EmailLog {
  type: EmailType
  name: EmailName
  sentAt: Date
}

export interface Review {
  _id?: string;
  booking: string; // ID de la réservation associée
  user: string; // ID de l'agence qui a soumis l'avis
  type: string // profile
  rating: number; // Note de 1 à 5
  comments: string; // Commentaires de l'agence
  rentedCar: boolean; // La voiture a-t-elle été louée ?
  answeredCall: boolean; // Le conducteur a-t-il répondu au téléphone ?
  canceledLastMinute: boolean; // Annulation de dernière minute ?
  carEta?: string; // Temps d'arrivée estimé de la voiture
  createdAt: Date; // Date de création de l'avis
}

export interface User {
  _id?: string
  supplier?: User | string
  fullName: string
  email?: string
  phone?: string
  password?: string
  birthDate?: Date
  verified?: boolean
  verifiedAt?: Date
  active?: boolean
  language?: string
  enableEmailNotifications?: boolean
  avatar?: string
  bio?: string
  location?: string
  type?: string
  blacklisted?: boolean
  payLater?: boolean
  accessToken?: string
  checked?: boolean
  customerId?: string
  carCount?: number
  contracts?: Contract[]
  emailLogs?: EmailLog[]
  reviews?: Review[]
  score?: number
  slug?: string
}

export interface Option {
  _id: string
  name?: string
  image?: string
  phone?: string
}

export interface LocationValue {
  _id?: string
  language: string
  value?: string
}

export interface ParkingSpot {
  _id?: string
  longitude: number | string
  latitude: number | string
  name?: string
  values?: LocationValue[]
}

export interface Location {
  _id: string
  country?: Country
  longitude?: number
  latitude?: number
  name?: string
  values?: LocationValue[]
  image?: string
  slug?: string
  parkingSpots?: ParkingSpot[]
}

export interface Country {
  _id: string
  name?: string
  values?: LocationValue[]
}

export interface CountryInfo extends Country {
  locations?: Location[]
}

interface PricePeriod {
  startDate: Date | null;
  endDate: Date | null;
  dailyPrice: number | null;
}

interface UnavailablePeriod {
  startDate: Date | null;
  endDate: Date | null;
}

export interface Discount {
  threshold: number; 
  percentage: number;
}

export interface CarBoost {
  active: boolean;
  paused: boolean;
  purchasedViews: number;
  consumedViews: number;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  lastViewAt?: Date;
}
export interface Car {
  _id: string
  name: string
  supplier: User
  minimumAge: number
  locations: Location[]

  dailyPrice: number
  discountedDailyPrice: number | null
  biWeeklyPrice: number | null
  discountedBiWeeklyPrice: number | null
  weeklyPrice: number | null
  discountedWeeklyPrice: number | null
  monthlyPrice: number | null
  discountedMonthlyPrice: number | null

  periodicPrices: PricePeriod[];
  unavailablePeriods: UnavailablePeriod[];
  deposit: number
  available: boolean
  type: CarType
  gearbox: GearboxType
  aircon: boolean
  image?: string
  seats: number
  doors: number
  fuelPolicy: FuelPolicy
  mileage: number
  cancellation: number
  amendments: number
  theftProtection: number
  collisionDamageWaiver: number
  fullInsurance: number
  additionalDriver: number
  range: string
  multimedia: CarMultimedia[] | undefined
  rating?: number
  trips: number
  co2?: number
  minimumDrivingLicenseYears?: number
  minimumRentalDays: number;
  discounts: Discount;
  boost?: CarBoost;
  boostHistory?: CarBoost[];
  [propKey: string]: any
}

export interface Data<T> {
  rows: T[]
  rowCount: number
}

export interface GetBookingCarsPayload {
  supplier: string
  pickupLocation: string
}

export interface Notification {
  _id: string
  user: string
  message: string
  booking?: string
  isRead?: boolean
  checked?: boolean
  createdAt?: Date
}

export interface NotificationCounter {
  _id: string
  user: string
  count: number
}

export interface ResultData<T> {
  pageInfo: { totalRecords: number }
  resultData: T[]
}

export type Result<T> = [ResultData<T>] | [] | undefined | null

export interface GetUsersBody {
  user: string
  types: UserType[]
}

export interface CreatePaymentPayload {
  amount: number
  /**
   * Three-letter ISO currency code, in lowercase.
   * Must be a supported currency: https://docs.stripe.com/currencies
   *
   * @type {string}
   */
  currency: string
  /**
   * The IETF language tag of the locale Checkout is displayed in. If blank or auto, the browser's locale is used.
   *
   * @type {string}
   */
  locale: string
  receiptEmail: string
  customerName: string
  name: string
  description?: string
}

export interface PaymentResult {
  sessionId?: string
  paymentIntentId?: string
  customerId: string
  clientSecret: string | null
}

export interface SendEmailPayload {
  from: string
  to: string
  subject: string
  message: string
  recaptchaToken: string
  ip: string
}

export interface Response<T> {
  status: number
  data: T
}

// 
// React types
//
export type DataEvent<T> = (data?: Data<T>) => void

export interface StatusFilterItem {
  label: string
  value: BookingStatus
  checked?: boolean
}

export interface CarFilter {
  pickupLocation: Location
  dropOffLocation: Location
  from: Date
  to: Date
}

export type CarFilterSubmitEvent = (filter: CarFilter) => void

export interface CarOptions {
  cancellation?: boolean
  amendments?: boolean
  theftProtection?: boolean
  collisionDamageWaiver?: boolean
  fullInsurance?: boolean
  additionalDriver?: boolean
}

export interface ScoreBreakdown {
  score: number;
  details: {
    phone: { score: number; max: number };
    carConfiguration: {
      periodicPrices: { score: number; max: number; configuredCars: number };
      unavailablePeriods: { score: number; max: number; configuredCars: number };
    };
    postRentalManagement: {
      expiredPending: { score: number; max: number };
      expiredReservedDeposit: { score: number; max: number };
      cancelledVoidRatio: { score: number; max: number };
    };
    carQuantity: { score: number; max: number };
    bookingStatusHealth: { score: number; max: number; ratio: number };
  };
  recommendations: string[];
}

// types/bookcars.ts
export interface CarStats {
  _id: string
  car: Car
  date: string
  views: number
  pickupLocation: string
  startDate: Date
  endDate: Date
  days: number
  clientId?: string
  paidView: boolean
  organiqueViews: number; // Added organiqueViews
  payedViews: number; // Added payedViews
  viewedAt: Date
}


// Type pour les paramètres de la requête
export interface GetCarStatsParams {
  supplierId: string
  carId?: string
  startDate?: Date
  endDate?: Date
  groupBy?: 'day' | 'week' | 'month'
}

// Type pour le schéma MongoDB
export interface ICarStats {
  car: string
  pickupLocation: string
  startDate: Date
  endDate: Date
  viewedAt: Date
  days: number
  paidView: boolean
  clientId?: string
}

// types/CarStats.ts
export interface CarStat {
  _id: {
    date: string;
    car: string;
  };
  views: number;
  payedViews: number; // Added payedViews
  organiqueViews: number; // Added organiqueViews
  date: string;
  carName: string;
  carId: string;
  supplierId: string;
  supplierName: string;
}

export interface BookingStat {
  status: BookingStatus
  count: number
  totalPrice: number
}


export interface ICar {
  id: string;
  name: string;
}

export interface SummedStat {
  date: string;
  views: number;
  payedViews: number;
  organiqueViews: number;
}

export interface SuppliersStat {
  supplierId: string;
  supplierName: string;
}

