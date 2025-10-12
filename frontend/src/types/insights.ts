export type DataStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface TrendBadge {
  value: number
  direction: 'up' | 'down' | 'flat'
  label?: string
}

export interface KpiMetric {
  title: string
  value: number
  unit?: string
  decimals?: number
  trend?: TrendBadge
}

export interface AgencyOverview {
  agencyId: string
  name: string
  revenue30d: number
  bookings30d: number
  acceptanceRate: number
  cancellationRate: number
  averageRating: number
  reviewCount: number
  occupancyRate: number
  revenuePerCar: number
  fleetSize: number
  medianResponseDelayH: number
  medianUpdateDelayH: number
  lateUpdateRate: number
  onTimeUpdateRate: number
}

export interface AdminOverview {
  revenue30d: number
  bookings30d: number
  activeAgencies: number
  avgAcceptanceRate: number
  avgCancellationRate: number
  avgRating: number
  avgOccupancyRate: number
  avgRevenuePerCar: number
  medianResponseDelayH: number
  medianUpdateDelayH: number
}

export interface RevenuePoint {
  month: string
  revenue: number
}

export interface StatusHistoryPoint {
  month: string
  accepted: number
  cancelled: number
}

export interface PriceDistributionPoint {
  category: string
  averagePrice: number
}

export interface FunnelStep {
  label: string
  value: number
}

export interface AgencyRanking {
  position: number
  agency: string
  score: number
  bookings: number
  fleetSize: number
  revenue: number
  acceptanceRate: number
  cancellationRate: number
  lateUpdates: number
  lastActivity: string
}

export interface RiskFlag {
  agency: string
  signal: string
  level: 'low' | 'medium' | 'high'
}

export interface PricingIndexRow {
  agency: string
  pricingIndex: number
  dispersion: number
  pricingDaysShare: number
}

export interface PendingUpdate {
  bookingCode: string
  plannedEnd: string
  status: string
  delayDays: number
}

export interface TopModelRow {
  model: string
  bookings: number
}

export interface AgencyInsights {
  overview: AgencyOverview
  revenueTrend: RevenuePoint[]
  statusHistory: StatusHistoryPoint[]
  priceDistribution: PriceDistributionPoint[]
  pendingUpdates: PendingUpdate[]
  topModels: TopModelRow[]
}

export interface AdminInsights {
  overview: AdminOverview
  revenueTrend: RevenuePoint[]
  statusHistory: StatusHistoryPoint[]
  funnel: FunnelStep[]
  ranking: AgencyRanking[]
  riskFlags: RiskFlag[]
  pricingIndex: PricingIndexRow[]
}

export interface AgencyOption {
  id: string
  name: string
}

export interface DateRangeFilter {
  startDate: string
  endDate: string
}

export interface AsyncDataState<T> {
  status: DataStatus
  data: T | null
  error?: string
}
