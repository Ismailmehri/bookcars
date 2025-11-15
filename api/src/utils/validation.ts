import { z, ZodError, type Infer } from 'zod'

const userDataSchema = z.object({
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(4).optional(),
  zip: z.string().trim().min(2).optional(),
  city: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  country: z.string().trim().regex(/^[A-Za-z]{2}$/i).optional(),
  gender: z.enum(['m', 'f', 'n']).optional(),
  dob: z.string().trim().regex(/^(\d{4})(?:-|\/)?(\d{2})(?:-|\/)?(\d{2})$/).optional(),
  ip: z.string().trim().optional(),
  userAgent: z.string().trim().optional(),
  fbp: z.string().trim().optional(),
  fbc: z.string().trim().optional(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  externalId: z.string().trim().min(1).optional(),
})

const contentItemSchema = z.object({
  id: z.string().trim().min(1),
  quantity: z.number().int().min(1).optional(),
  itemPrice: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  title: z.string().trim().optional(),
  category: z.string().trim().optional(),
})

const filtersSchema = z.record(z.string(), z.unknown())

const customDataSchema = z.object({
  value: z.number().positive().optional(),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/).optional(),
  dataProcessingOptions: z.array(z.string().trim().min(1)).min(1).optional(),
  orderId: z.string().trim().optional(),
  transactionId: z.string().trim().optional(),
  contents: z.array(contentItemSchema).min(1).optional(),
  contentIds: z.array(z.string().trim().min(1)).min(1).optional(),
  contentType: z.string().trim().min(1).optional(),
  numItems: z.number().int().min(1).optional(),
  coupon: z.string().trim().optional(),
  pageLocation: z.string().trim().optional(),
  pageTitle: z.string().trim().optional(),
  searchString: z.string().trim().optional(),
  searchTerm: z.string().trim().optional(),
  pickupLocationId: z.string().trim().optional(),
  dropOffLocationId: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  sameLocation: z.boolean().optional(),
  filters: filtersSchema.optional(),
  leadSource: z.string().trim().optional(),
  hasEmail: z.boolean().optional(),
  subject: z.string().trim().optional(),
  messageLength: z.number().int().min(0).optional(),
  isAuthenticated: z.boolean().optional(),
})

const contentSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).optional(),
  type: z.string().trim().min(1).optional(),
})

const attributionDataSchema = z
  .object({
    attributionShare: z.union([z.string().trim(), z.number()]).optional(),
    adId: z.string().trim().optional(),
    campaignId: z.string().trim().optional(),
    clickId: z.string().trim().optional(),
    engagementTime: z.union([z.string().trim(), z.number()]).optional(),
  })
  .optional()

const originalEventDataSchema = z
  .object({
    eventName: z.string().trim().min(1).optional(),
    eventTime: z.number().int().min(0).optional(),
  })
  .optional()

export const metaEventSchema = z.object({
  eventName: z.string().trim().min(1),
  eventTime: z.number().int().min(0).optional(),
  eventSourceUrl: z.string().trim().min(1).optional(),
  actionSource: z.string().trim().min(1).optional(),
  eventId: z.string().trim().min(1).optional(),
  userData: userDataSchema.optional(),
  customData: customDataSchema.optional(),
  content: contentSchema.optional(),
  testEventCode: z.string().trim().min(1).optional(),
  attributionData: attributionDataSchema,
  originalEventData: originalEventDataSchema,
})

export type MetaEventPayload = Infer<typeof metaEventSchema>

export { ZodError }

export const validateMetaEventPayload = (input: unknown): MetaEventPayload => metaEventSchema.parse(input)
