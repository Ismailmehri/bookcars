import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import BoostedCarsView from '../BoostedCarsView'
import { strings } from '@/lang/insights'
import * as CarService from '@/services/CarService'

vi.mock('@/services/CarService', () => ({
  getCars: vi.fn(),
  updateCarBoost: vi.fn(),
  createCarBoost: vi.fn(),
}))

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
  enableEmailNotifications: true,
  type: bookcarsTypes.UserType.Supplier,
  blacklisted: false,
  reviews: [],
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
  fuelPolicy: bookcarsTypes.FuelPolicy.LikeForLike,
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
  type: bookcarsTypes.CarType.Gasoline,
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
      { suppliers: ['agency-1'], boostStatus: undefined },
      1,
      20,
    )
  })

  it('requests backend sorting when the user sorts a column', async () => {
    const car = buildCar()
    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [car] },
    ])

    render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    expect(await screen.findByText('Peugeot 208')).toBeTruthy()

    getCarsMock.mockClear()
    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [car] },
    ])

    const agencyHeader = await screen.findByRole('columnheader', { name: new RegExp(strings.BOOSTED_TABLE_AGENCY, 'i') })

    await act(async () => {
      fireEvent.click(agencyHeader)
    })

    await waitFor(() => {
      expect(getCarsMock).toHaveBeenCalled()
    })

    expect(getCarsMock).toHaveBeenLastCalledWith(
      '',
      {
        suppliers: ['agency-1'],
        boostStatus: undefined,
        sort: { field: 'supplierName', order: 'asc' },
      },
      1,
      20,
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

  it('normalizes boost payloads originating from aggregate responses', async () => {
    const boostMap = new Map<string, unknown>([
      ['active', 1],
      ['paused', 0],
      ['purchasedViews', '345'],
      ['consumedViews', '12'],
      ['startDate', '2024-04-01T00:00:00.000Z'],
      ['endDate', '2024-05-01T00:00:00.000Z'],
    ])

    const rawCar = {
      ...buildCar({ name: 'Boosted Map', boost: undefined }),
      boost: boostMap,
    } as unknown as bookcarsTypes.Car

    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [rawCar] },
    ])

    render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    expect(await screen.findByText('Boosted Map')).toBeTruthy()

    await waitFor(() => {
      expect(screen.getByText(strings.BOOSTED_STATUS_ACTIVE)).toBeInTheDocument()
    })

    expect(screen.getByText('345')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
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

  it('falls back to agency option label when supplier metadata is missing', async () => {
    const missingSupplier = {
      ...buildCar(),
      supplier: 'agency-1',
    } as unknown as bookcarsTypes.Car

    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [missingSupplier] },
    ])

    render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    expect(await screen.findByText('Peugeot 208')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Agence Alpha' })).toBeInTheDocument()
    })
  })

  it('renders active status, metrics, and schedule for serialized supplier identifiers', async () => {
    const mockIdentifier = { toString: () => 'agency-1' }
    const carWithObjectIds = {
      ...buildCar({
        name: 'Citroën C3',
        boost: undefined,
      }),
      _id: { toString: () => 'car-object-1' },
      supplierId: mockIdentifier,
      supplier: {
        ...buildSupplier({
          fullName: '',
        }),
        _id: mockIdentifier,
        fullName: '',
      },
      boost: {
        active: 'true',
        paused: 'false',
        purchasedViews: '5000',
        consumedViews: '123',
        startDate: '2024-04-10T00:00:00.000Z',
        endDate: '2024-05-20T00:00:00.000Z',
      },
    } as unknown as bookcarsTypes.Car

    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [carWithObjectIds] },
    ])

    render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    const expectedStart = new Date('2024-04-10T00:00:00.000Z').toLocaleDateString()
    const expectedEnd = new Date('2024-05-20T00:00:00.000Z').toLocaleDateString()

    expect(await screen.findByText('Citroën C3')).toBeTruthy()

    await waitFor(() => {
      expect(screen.getByRole('cell', { name: strings.BOOSTED_STATUS_ACTIVE })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'Agence Alpha' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: expectedStart })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: expectedEnd })).toBeInTheDocument()
    })

    expect(screen.getByRole('cell', { name: '5000' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '123' })).toBeInTheDocument()
  })

  it('falls back to backend status metadata when boost flags are missing', async () => {
    const carWithStatusOnly = {
      ...buildCar({
        boost: undefined,
      }),
      boostStatus: 'paused',
      boost: {
        active: false,
        paused: false,
        purchasedViews: 0,
        consumedViews: 0,
      },
    } as unknown as bookcarsTypes.Car

    getCarsMock.mockResolvedValueOnce([
      { pageInfo: { totalRecords: 1 }, resultData: [carWithStatusOnly] },
    ])

    render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    expect(await screen.findByText('Peugeot 208')).toBeTruthy()

    await waitFor(() => {
      expect(screen.getByRole('cell', { name: strings.BOOSTED_STATUS_PAUSED })).toBeInTheDocument()
    })
  })

  it('requests filtered data when status changes', async () => {
    const baseCar = buildCar()
    const car = {
      ...baseCar,
      boost: {
        ...baseCar.boost!,
        paused: false,
      },
    }
    getCarsMock.mockResolvedValue([
      { pageInfo: { totalRecords: 1 }, resultData: [car] },
    ])

    const { findByRole } = render(
      <ThemeProvider theme={createTheme()}>
        <BoostedCarsView agencyOptions={[{ id: 'agency-1', name: 'Agence Alpha' }]} filtersVersion={1} />
      </ThemeProvider>,
    )

    const statusSelect = await findByRole('combobox', { name: strings.BOOSTED_STATUS_LABEL })

    await act(async () => {
      fireEvent.mouseDown(statusSelect)
    })

    const pausedOption = await screen.findByRole('option', { name: strings.BOOSTED_STATUS_INACTIVE })

    await act(async () => {
      fireEvent.click(pausedOption)
    })

    await waitFor(() => {
      expect(getCarsMock).toHaveBeenCalledTimes(2)
    })

    const [, secondPayload] = getCarsMock.mock.calls[1]
    expect(secondPayload).toMatchObject({ boostStatus: 'inactive' })
  })
})
