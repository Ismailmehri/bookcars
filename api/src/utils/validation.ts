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
})

const customDataSchema = z.object({
  value: z.number().positive().optional(),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/).optional(),
  dataProcessingOptions: z.array(z.string().trim().min(1)).min(1).optional(),
  orderId: z.string().trim().optional(),
})

const contentSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).optional(),
  type: z.string().trim().min(1).optional(),
})

export const metaEventSchema = z.object({
  eventName: z.string().trim().min(1),
  eventTime: z.number().int().min(0).optional(),
  eventSourceUrl: z.string().trim().min(1).optional(),
  actionSource: z.string().trim().min(1).optional(),
  userData: userDataSchema.optional(),
  customData: customDataSchema.optional(),
  content: contentSchema.optional(),
  testEventCode: z.string().trim().min(1).optional(),
})

export type MetaEventPayload = Infer<typeof metaEventSchema>

export { ZodError }

export const validateMetaEventPayload = (input: unknown): MetaEventPayload => metaEventSchema.parse(input)
