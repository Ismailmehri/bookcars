import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { act, fireEvent, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import BoostedCarsView from '../BoostedCarsView'
import { strings } from '@/lang/insights'

vi.mock('@/services/CarService', () => ({
  getCars: vi.fn(),
  updateCarBoost: vi.fn(),
  createCarBoost: vi.fn(),
}))

import * as CarService from '@/services/CarService'

const getCarsMock = CarService.getCars as MockedFunction<typeof CarService.getCars>
const updateBoostMock = CarService.updateCarBoost as MockedFunction<typeof CarService.updateCarBoost>

const buildSupplier = (overrides?: Partial<bookcarsTypes.User>): bookcarsTypes.User => ({
  _id: 'agency-1',
  email: 'contact@agency.tn',
  fullName: 'Agence Alpha',
  language: 'fr',
  location: '',
  payLater: false,
  phone: '',
  bio: '',
  avatar: '',
  active: true,
  verified: true,
  userVerified: true,
  enableEmailNotifications: true,
  enableSmsNotifications: true,
  notificationCount: 0,
  type: bookcarsTypes.RecordType.Supplier,
  access: bookcarsTypes.UserAccess.Admin,
  blacklisted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ratings: [],
  reviews: [],
  agencies: [],
  suppliers: [],
  ...overrides,
})

const buildCar = (overrides?: Partial<bookcarsTypes.Car>): bookcarsTypes.Car => ({
  _id: 'car-1',
  name: 'Peugeot 208',
  supplier: buildSupplier(),
  minimumAge: 21,
  locations: [],
  dailyPrice: 100,
  discountedDailyPrice: null,
  biWeeklyPrice: null,
  discountedBiWeeklyPrice: null,
  weeklyPrice: null,
  discountedWeeklyPrice: null,
  monthlyPrice: null,
  discountedMonthlyPrice: null,
  periodicPrices: [],
  unavailablePeriods: [],
  deposit: 0,
  seats: 5,
  doors: 4,
  aircon: true,
  gearbox: bookcarsTypes.GearboxType.Automatic,
  fuelPolicy: bookcarsTypes.FuelPolicy.FullToFull,
  mileage: -1,
  cancellation: 0,
  amendments: 0,
  theftProtection: 0,
  collisionDamageWaiver: 0,
  fullInsurance: 0,
  additionalDriver: 0,
  range: 'A',
  multimedia: [],
  rating: 4.5,
  co2: 120,
  minimumDrivingLicenseYears: 2,
  minimumRentalDays: 1,
  discounts: { threshold: 0, percentage: 0 },
  boost: {
    active: true,
    paused: false,
    purchasedViews: 2500,
    consumedViews: 1200,
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-03-31T00:00:00Z'),
  },
  boostHistory: [],
  dailyPriceAvg: undefined,
  extraImages: [],
  featured: false,
  available: true,
  type: bookcarsTypes.CarType.City,
  multimediaSpecs: undefined,
  images: [],
  slug: 'peugeot-208',
  trips: 0,
  reviews: [],
  priceHistory: [],
  ...overrides,
})

describe('BoostedCarsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    strings.setLanguage('fr')
  })

  it('loads boosted cars and renders rows', async () => {
    const car = buildCar({ name: 'Renault Clio' })
    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [car] },
    ])

    const { findByText } = render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    expect(await findByText('Renault Clio')).toBeTruthy()
    expect(getCarsMock).toHaveBeenCalledWith(
      '',
      { suppliers: ['agency-1'] },
      1,
      200,
    )
  })

  it('opens the edit dialog and saves boost updates', async () => {
    const car = buildCar()
    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [car] },
    ])
    updateBoostMock.mockResolvedValueOnce({
      ...car.boost!,
      paused: true,
    })

    const { findByText } = render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    const manageButton = await findByText(strings.BOOSTED_ACTION_MANAGE)
    await act(async () => {
      fireEvent.click(manageButton)
    })

    expect(await findByText(strings.BOOSTED_DIALOG_TITLE_EDIT)).toBeTruthy()

    const saveButton = await findByText(strings.BOOSTED_DIALOG_SAVE)
    await act(async () => {
      fireEvent.click(saveButton)
    })

    expect(updateBoostMock).toHaveBeenCalledTimes(1)
    const payload = updateBoostMock.mock.calls[0][1]
    expect(payload.active).toBe(true)
    expect(payload.paused).toBe(false)
    expect(payload.startDate).toBeInstanceOf(Date)
    expect(payload.endDate).toBeInstanceOf(Date)
  })

  it('falls back to empty state when no data returned', async () => {
    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 0 }, resultData: [] },
    ])

    const { findByText } = render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    expect(await findByText(strings.BOOSTED_EMPTY)).toBeTruthy()
  })

  it('displays placeholder data when supplier info is missing', async () => {
    const malformedCar = {
      ...buildCar(),
      supplier: null,
    } as unknown as bookcarsTypes.Car

    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [malformedCar] },
    ])

    const { findByText, findAllByRole } = render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    expect(await findByText('Peugeot 208')).toBeTruthy()
    const placeholderCells = await findAllByRole('cell', { name: '—' })
    expect(placeholderCells.length).toBeGreaterThan(0)
  })
})
