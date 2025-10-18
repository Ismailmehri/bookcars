import * as bookcarsTypes from ':bookcars-types'

export interface AgencyMetricsViewModel {
  summary: bookcarsTypes.AgencyStatsSummary
  rating?: { average: number; reviews: number }
  pendingUpdates: number
  pendingUpdatesRows: bookcarsTypes.AgencyBookingUpdate[]
  topModels: bookcarsTypes.TopModelStat[]
  monthlyRevenue: bookcarsTypes.RevenueTimePoint[]
  weeklyTrend: bookcarsTypes.WeeklyTrendPoint[]
  viewsOverTime: bookcarsTypes.ViewsTimePoint[]
  statusBreakdown: bookcarsTypes.BookingStat[]
  revenueByModel: bookcarsTypes.AgencyModelRevenueStat[]
  occupancyByModel: bookcarsTypes.AgencyModelOccupancyStat[]
  lastBookingAt?: string
  lastConnectionAt?: string
}

export interface AdminMetricsViewModel {
  summary: bookcarsTypes.AdminStatsSummary
  averageRating?: number
  ranking: bookcarsTypes.AgencyRankingItem[]
  monthlyRevenue: bookcarsTypes.RevenueTimePoint[]
  weeklyTrend: bookcarsTypes.WeeklyTrendPoint[]
  viewsOverTime: bookcarsTypes.ViewsTimePoint[]
  statusBreakdown: bookcarsTypes.BookingStat[]
  revenueByModel: bookcarsTypes.AgencyModelRevenueStat[]
  occupancyByModel: bookcarsTypes.AgencyModelOccupancyStat[]
  averageDurationByAgency: bookcarsTypes.AgencyAverageDurationPoint[]
  topModels: bookcarsTypes.TopModelStat[]
}
