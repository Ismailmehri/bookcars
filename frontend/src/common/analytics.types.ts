export interface AnalyticsContent {
  id: string
  name: string
  quantity: number
  price: number
  category?: string
}

export interface CommerceEventInput {
  value: number
  currency: string
  items: AnalyticsContent[]
  coupon?: string
  contentType?: string
}

export interface PurchaseEventInput extends CommerceEventInput {
  transactionId: string
}

export interface ViewContentEventInput {
  id: string
  name: string
  price: number
  currency: string
  category?: string
}

export interface PageViewEventInput {
  pageUrl: string
  pageTitle: string
}

export interface SearchEventInput {
  searchTerm: string
  pickupLocationId?: string
  dropOffLocationId?: string
  startDate?: Date
  endDate?: Date
  sameLocation?: boolean
  filters?: Record<string, unknown>
}

export interface LeadEventInput {
  source?: string
  hasEmail?: boolean
  subject?: string
  messageLength?: number
  isAuthenticated?: boolean
  value?: number
  currency?: string
}

export interface AnalyticsItem {
  id: string
  quantity: number
  item_price: number
  title?: string
  category?: string
}

export interface AnalyticsCommercePayload extends Record<string, unknown> {
  value: number
  currency: string
  contents: AnalyticsItem[]
  content_ids: string[]
  num_items: number
  content_type: string
  coupon?: string
  transaction_id?: string
}

export interface PageViewAnalyticsPayload extends Record<string, unknown> {
  page_location?: string
  page_title?: string
  referrer?: string
}

export interface SearchAnalyticsPayload extends Record<string, unknown> {
  search_string: string
  search_term?: string
  pickup_location_id?: string
  dropoff_location_id?: string
  start_date?: string
  end_date?: string
  same_location?: boolean
  filters?: Record<string, unknown>
}

export interface LeadAnalyticsPayload extends Record<string, unknown> {
  lead_source?: string
  has_email?: boolean
  subject?: string
  message_length?: number
  is_authenticated?: boolean
  value: number
  currency: string
}
