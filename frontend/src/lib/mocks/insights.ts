import {
  type AdminInsights,
  type AgencyInsights,
  type AgencyOption,
  type AsyncDataState,
  type DateRangeFilter
} from '@/types/insights'

const agencies: AgencyOption[] = [
  { id: 'ag-plany-tunis', name: 'Plany Tunis Downtown' },
  { id: 'ag-plany-sousse', name: 'Plany Sousse' },
  { id: 'ag-plany-djerba', name: 'Plany Djerba Airport' },
]

const agencyInsightsMap: Record<string, AgencyInsights> = {
  'ag-plany-tunis': {
    overview: {
      agencyId: 'ag-plany-tunis',
      name: 'Plany Tunis Downtown',
      revenue30d: 48250,
      bookings30d: 164,
      acceptanceRate: 0.87,
      cancellationRate: 0.08,
      averageRating: 4.6,
      reviewCount: 286,
      occupancyRate: 0.78,
      revenuePerCar: 1340,
      fleetSize: 36,
      medianResponseDelayH: 1.8,
      medianUpdateDelayH: 6.5,
      lateUpdateRate: 0.12,
      onTimeUpdateRate: 0.88,
    },
    revenueTrend: [
      { month: 'Mai', revenue: 36500 },
      { month: 'Juin', revenue: 38800 },
      { month: 'Juil', revenue: 41250 },
      { month: 'Août', revenue: 43900 },
      { month: 'Sep', revenue: 45120 },
      { month: 'Oct', revenue: 48250 },
    ],
    statusHistory: [
      { month: 'Mai', accepted: 120, cancelled: 14 },
      { month: 'Juin', accepted: 132, cancelled: 12 },
      { month: 'Juil', accepted: 141, cancelled: 11 },
      { month: 'Août', accepted: 152, cancelled: 14 },
      { month: 'Sep', accepted: 158, cancelled: 13 },
      { month: 'Oct', accepted: 164, cancelled: 15 },
    ],
    priceDistribution: [
      { category: 'Mini', averagePrice: 79 },
      { category: 'Midi', averagePrice: 104 },
      { category: 'Maxi', averagePrice: 139 },
      { category: 'Scooter', averagePrice: 55 },
    ],
    pendingUpdates: [
      { bookingCode: 'TN-2045', plannedEnd: '2024-10-12', status: 'En cours', delayDays: 2 },
      { bookingCode: 'TN-2038', plannedEnd: '2024-10-10', status: 'En cours', delayDays: 1 },
      { bookingCode: 'TN-2031', plannedEnd: '2024-10-09', status: 'À clôturer', delayDays: 3 },
    ],
    topModels: [
      { model: 'Peugeot 208', bookings: 48 },
      { model: 'Kia Picanto', bookings: 41 },
      { model: 'Renault Clio', bookings: 36 },
      { model: 'Skoda Fabia', bookings: 21 },
    ],
  },
  'ag-plany-sousse': {
    overview: {
      agencyId: 'ag-plany-sousse',
      name: 'Plany Sousse',
      revenue30d: 36620,
      bookings30d: 118,
      acceptanceRate: 0.83,
      cancellationRate: 0.11,
      averageRating: 4.4,
      reviewCount: 164,
      occupancyRate: 0.72,
      revenuePerCar: 1120,
      fleetSize: 29,
      medianResponseDelayH: 2.4,
      medianUpdateDelayH: 8.8,
      lateUpdateRate: 0.18,
      onTimeUpdateRate: 0.82,
    },
    revenueTrend: [
      { month: 'Mai', revenue: 28600 },
      { month: 'Juin', revenue: 29740 },
      { month: 'Juil', revenue: 31120 },
      { month: 'Août', revenue: 33220 },
      { month: 'Sep', revenue: 35410 },
      { month: 'Oct', revenue: 36620 },
    ],
    statusHistory: [
      { month: 'Mai', accepted: 96, cancelled: 13 },
      { month: 'Juin', accepted: 101, cancelled: 11 },
      { month: 'Juil', accepted: 108, cancelled: 12 },
      { month: 'Août', accepted: 112, cancelled: 15 },
      { month: 'Sep', accepted: 114, cancelled: 13 },
      { month: 'Oct', accepted: 118, cancelled: 14 },
    ],
    priceDistribution: [
      { category: 'Mini', averagePrice: 72 },
      { category: 'Midi', averagePrice: 98 },
      { category: 'Maxi', averagePrice: 125 },
      { category: 'Scooter', averagePrice: 47 },
    ],
    pendingUpdates: [
      { bookingCode: 'SO-1088', plannedEnd: '2024-10-11', status: 'À clôturer', delayDays: 4 },
      { bookingCode: 'SO-1082', plannedEnd: '2024-10-08', status: 'En cours', delayDays: 1 },
    ],
    topModels: [
      { model: 'Hyundai i10', bookings: 32 },
      { model: 'Toyota Yaris', bookings: 29 },
      { model: 'Seat Ibiza', bookings: 24 },
      { model: 'Renault Symbol', bookings: 19 },
    ],
  },
  'ag-plany-djerba': {
    overview: {
      agencyId: 'ag-plany-djerba',
      name: 'Plany Djerba Airport',
      revenue30d: 28450,
      bookings30d: 94,
      acceptanceRate: 0.81,
      cancellationRate: 0.1,
      averageRating: 4.5,
      reviewCount: 112,
      occupancyRate: 0.68,
      revenuePerCar: 980,
      fleetSize: 26,
      medianResponseDelayH: 3.6,
      medianUpdateDelayH: 11.4,
      lateUpdateRate: 0.21,
      onTimeUpdateRate: 0.79,
    },
    revenueTrend: [
      { month: 'Mai', revenue: 21400 },
      { month: 'Juin', revenue: 22650 },
      { month: 'Juil', revenue: 23780 },
      { month: 'Août', revenue: 24890 },
      { month: 'Sep', revenue: 26840 },
      { month: 'Oct', revenue: 28450 },
    ],
    statusHistory: [
      { month: 'Mai', accepted: 78, cancelled: 9 },
      { month: 'Juin', accepted: 81, cancelled: 8 },
      { month: 'Juil', accepted: 86, cancelled: 9 },
      { month: 'Août', accepted: 88, cancelled: 11 },
      { month: 'Sep', accepted: 91, cancelled: 10 },
      { month: 'Oct', accepted: 94, cancelled: 12 },
    ],
    priceDistribution: [
      { category: 'Mini', averagePrice: 68 },
      { category: 'Midi', averagePrice: 92 },
      { category: 'Maxi', averagePrice: 118 },
      { category: 'Scooter', averagePrice: 43 },
    ],
    pendingUpdates: [
      { bookingCode: 'DJ-5082', plannedEnd: '2024-10-13', status: 'En cours', delayDays: 2 },
      { bookingCode: 'DJ-5074', plannedEnd: '2024-10-09', status: 'À clôturer', delayDays: 5 },
    ],
    topModels: [
      { model: 'Dacia Sandero', bookings: 26 },
      { model: 'Fiat Panda', bookings: 22 },
      { model: 'Citroën C3', bookings: 21 },
      { model: 'Peugeot 208', bookings: 19 },
    ],
  },
}

const adminInsights: AdminInsights = {
  overview: {
    revenue30d: 113320,
    bookings30d: 376,
    activeAgencies: 18,
    avgAcceptanceRate: 0.84,
    avgCancellationRate: 0.09,
    avgRating: 4.5,
    avgOccupancyRate: 0.73,
    avgRevenuePerCar: 1180,
    medianResponseDelayH: 2.6,
    medianUpdateDelayH: 8.9,
  },
  revenueTrend: [
    { month: 'Mai', revenue: 86500 },
    { month: 'Juin', revenue: 91190 },
    { month: 'Juil', revenue: 96150 },
    { month: 'Août', revenue: 102010 },
    { month: 'Sep', revenue: 107370 },
    { month: 'Oct', revenue: 113320 },
  ],
  statusHistory: [
    { month: 'Mai', accepted: 294, cancelled: 36 },
    { month: 'Juin', accepted: 314, cancelled: 33 },
    { month: 'Juil', accepted: 335, cancelled: 34 },
    { month: 'Août', accepted: 352, cancelled: 39 },
    { month: 'Sep', accepted: 363, cancelled: 36 },
    { month: 'Oct', accepted: 376, cancelled: 41 },
  ],
  funnel: [
    { label: 'Vues', value: 125000 },
    { label: 'Clics', value: 45700 },
    { label: 'Leads', value: 16840 },
    { label: 'Réservations', value: 3840 },
    { label: 'Payées', value: 3120 },
  ],
  ranking: [
    { position: 1, agency: 'Plany Tunis Downtown', score: 92, bookings: 164, fleetSize: 36, revenue: 48250, acceptanceRate: 0.87, cancellationRate: 0.08, lateUpdates: 6, lastActivity: '2024-10-13' },
    { position: 2, agency: 'Plany Sousse', score: 88, bookings: 118, fleetSize: 29, revenue: 36620, acceptanceRate: 0.83, cancellationRate: 0.11, lateUpdates: 7, lastActivity: '2024-10-12' },
    { position: 3, agency: 'Atlas Car Hammamet', score: 84, bookings: 109, fleetSize: 22, revenue: 32180, acceptanceRate: 0.81, cancellationRate: 0.1, lateUpdates: 11, lastActivity: '2024-10-12' },
    { position: 4, agency: 'Djerba Premium Cars', score: 79, bookings: 94, fleetSize: 26, revenue: 28450, acceptanceRate: 0.81, cancellationRate: 0.1, lateUpdates: 12, lastActivity: '2024-10-11' },
  ],
  riskFlags: [
    { agency: 'Atlas Car Hammamet', signal: 'Contrôle assurance expirant', level: 'medium' },
    { agency: 'Djerba Premium Cars', signal: 'Photos véhicule manquantes', level: 'high' },
    { agency: 'Monastir Mobility', signal: 'Retards de clôture récurrents', level: 'medium' },
  ],
  pricingIndex: [
    { agency: 'Plany Tunis Downtown', pricingIndex: 0.94, dispersion: 0.08, pricingDaysShare: 0.93 },
    { agency: 'Plany Sousse', pricingIndex: 0.97, dispersion: 0.11, pricingDaysShare: 0.89 },
    { agency: 'Atlas Car Hammamet', pricingIndex: 1.04, dispersion: 0.16, pricingDaysShare: 0.76 },
    { agency: 'Djerba Premium Cars', pricingIndex: 1.08, dispersion: 0.22, pricingDaysShare: 0.68 },
  ],
}

const simulateDelay = async <T>(value: T, signal?: AbortSignal) => new Promise<T>((resolve, reject) => {
  const timeout = setTimeout(() => {
    resolve(value)
  }, 250)

  if (signal) {
    signal.addEventListener('abort', () => {
      clearTimeout(timeout)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  }
})

export const listAgenciesMock = async () => simulateDelay(agencies)

export const getAgencyInsightsMock = async (
  agencyId: string,
  _range: DateRangeFilter,
  options?: { signal?: AbortSignal }
): Promise<AgencyInsights> => {
  const data = agencyInsightsMap[agencyId] ?? agencyInsightsMap['ag-plany-tunis']
  return simulateDelay(data, options?.signal)
}

export const getAdminInsightsMock = async (
  _range: DateRangeFilter,
  options?: { signal?: AbortSignal }
): Promise<AdminInsights> => simulateDelay(adminInsights, options?.signal)

export const buildInitialAgencyState = (): AsyncDataState<AgencyInsights> => ({
  status: 'idle',
  data: null,
})

export const buildInitialAdminState = (): AsyncDataState<AdminInsights> => ({
  status: 'idle',
  data: null,
})

// TODO backend: expose insights aggregate endpoints returning the following fields per booking:
// - requestAt, firstResponseAt for medianResponseDelayH calculations
// - rentalEndAt, statusClosedAt to compute medianUpdateDelayH and lateUpdateRate
// - vehicle availability (isAvailable/isBooked) per day to compute occupancyRate
// - pricing history with dailyPrice/monthlyPrice per category for pricingIndex & dispersion
// - vehicle hygiene flags (photosCount, hasInsurance, hasMonthlyPrice, hasOptionsFilled)
