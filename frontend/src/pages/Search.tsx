import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import { strings } from '@/lang/search'
import * as helper from '@/common/helper'
import * as LocationService from '@/services/LocationService'
import * as SupplierService from '@/services/SupplierService'
// import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import NoMatch from './NoMatch'
import CarFilter from '@/components/CarFilter'
import CarSpecsFilter from '@/components/CarSpecsFilter'
import SupplierFilter from '@/components/SupplierFilter'
import CarType from '@/components/CarTypeFilter'
import GearboxFilter from '@/components/GearboxFilter'
import MileageFilter from '@/components/MileageFilter'
import FuelPolicyFilter from '@/components/FuelPolicyFilter'
import DepositFilter from '@/components/DepositFilter'
import CarList from '@/components/CarList'
import CarRatingFilter from '@/components/CarRatingFilter'
import CarRangeFilter from '@/components/CarRangeFilter'
import CarMultimediaFilter from '@/components/CarMultimediaFilter'
import CarSeatsFilter from '@/components/CarSeatsFilter'
import Map from '@/components/Map'

import ViewOnMap from '@/assets/img/view-on-map.png'

import '@/assets/css/search.css'

const Search = () => {
  const location = useLocation()

  const [visible, setVisible] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [pickupLocation, setPickupLocation] = useState<bookcarsTypes.Location>()
  const [dropOffLocation, setDropOffLocation] = useState<bookcarsTypes.Location>()
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [selectedSupplier, setSelectedSupplier] = useState<string[]>()
  const [allSuppliers, setAllSuppliers] = useState<bookcarsTypes.User[]>([])
  const [allSuppliersIds, setAllSuppliersIds] = useState<string[]>([])
  const [suppliers, setSuppliers] = useState<bookcarsTypes.User[]>([])
  const [supplierIds, setSupplierIds] = useState<string[]>()
  const [loading, setLoading] = useState(true)
  const [carSpecs, setCarSpecs] = useState<bookcarsTypes.CarSpecs>({})
  const [carType, setCarType] = useState(bookcarsHelper.getAllCarTypes())
  const [gearbox, setGearbox] = useState([bookcarsTypes.GearboxType.Automatic, bookcarsTypes.GearboxType.Manual])
  const [mileage, setMileage] = useState([bookcarsTypes.Mileage.Limited, bookcarsTypes.Mileage.Unlimited])
  const [fuelPolicy, setFuelPolicy] = useState([bookcarsTypes.FuelPolicy.FreeTank, bookcarsTypes.FuelPolicy.LikeForLike])
  const [deposit, setDeposit] = useState(-1)
  const [ranges, setRanges] = useState(bookcarsHelper.getAllRanges())
  const [multimedia, setMultimedia] = useState<bookcarsTypes.CarMultimedia[]>([])
  const [rating, setRating] = useState(-1)
  const [seats, setSeats] = useState(-1)
  const [openMapDialog, setOpenMapDialog] = useState(false)
  // const [distance, setDistance] = useState('')

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const fetchedSuppliers = await SupplierService.getAllSuppliers()
        setAllSuppliers(fetchedSuppliers)
        setAllSuppliersIds(bookcarsHelper.flattenSuppliers(fetchedSuppliers))
      } catch (err) {
        helper.error(err, 'Failed to fetch suppliers')
      }
    }

    fetchSuppliers()
  }, [])

  useEffect(() => {
    const updateSuppliers = async () => {
      if (pickupLocation) {
        const payload: bookcarsTypes.GetCarsPayload = {
          pickupLocation: pickupLocation._id,
          carSpecs,
          carType,
          gearbox,
          mileage,
          fuelPolicy,
          deposit,
          ranges,
          multimedia,
          rating,
          seats,
          startDate: from,
          endDate: to
        }
        const _suppliers = await SupplierService.getFrontendSuppliers(payload)
        setSuppliers(_suppliers)
      }
    }

    updateSuppliers()
  }, [pickupLocation, carSpecs, carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, from, to])

  const handleCarFilterSubmit = async (filter: bookcarsTypes.CarFilter) => {
    if (suppliers.length < allSuppliers.length) {
      const _supplierIds = bookcarsHelper.clone(allSuppliersIds)
      setSupplierIds(_supplierIds)
    }

    setPickupLocation(filter.pickupLocation)
    setDropOffLocation(filter.dropOffLocation)
    setFrom(filter.from)
    setTo(filter.to)
  }

  const handleSupplierFilterChange = (newSuppliers: string[]) => {
    setSupplierIds(newSuppliers)
    setSelectedSupplier(newSuppliers)
  }

  const handleRatingFilterChange = (value: number) => {
    setRating(value)
  }

  const handleRangeFilterChange = (value: bookcarsTypes.CarRange[]) => {
    setRanges(value)
  }

  const handleMultimediaFilterChange = (value: bookcarsTypes.CarMultimedia[]) => {
    setMultimedia(value)
  }

  const handleSeatsFilterChange = (value: number) => {
    setSeats(value)
  }

  const handleCarSpecsFilterChange = (value: bookcarsTypes.CarSpecs) => {
    setCarSpecs(value)
  }

  const handleCarTypeFilterChange = (values: bookcarsTypes.CarType[]) => {
    setCarType(values)
  }

  const handleGearboxFilterChange = (values: bookcarsTypes.GearboxType[]) => {
    setGearbox(values)
  }

  const handleMileageFilterChange = (values: bookcarsTypes.Mileage[]) => {
    setMileage(values)
  }

  const handleFuelPolicyFilterChange = (values: bookcarsTypes.FuelPolicy[]) => {
    setFuelPolicy(values)
  }

  const handleDepositFilterChange = (value: number) => {
    setDeposit(value)
  }

  const onLoad = async (user?: bookcarsTypes.User) => {
    const searchParams = new URLSearchParams(window.location.search)
    const pickupLocationIdFromUrl = searchParams.get('pickupLocation') || null
    const suppliersFromUrl = searchParams.get('supplier')?.split(',').filter(Boolean) || []

    const { state } = location
    const pickupLocationId = state?.pickupLocationId || pickupLocationIdFromUrl
    const dropOffLocationId = state?.dropOffLocationId || null
    const _from = state?.from || null
    const _to = state?.to || null

    if (!pickupLocationId) {
      setNoMatch(true)
      return
    }

    const now = new Date()
    const defaultFrom = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const defaultTo = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const startDate = _from ? new Date(_from) : defaultFrom
    const endDate = _to ? new Date(_to) : defaultTo

    try {
      const _pickupLocation = await LocationService.getLocation(pickupLocationId)
      if (!_pickupLocation) {
        setLoading(false)
        setNoMatch(true)
        return
      }

      const _dropOffLocation = dropOffLocationId && dropOffLocationId !== pickupLocationId
        ? await LocationService.getLocation(dropOffLocationId)
        : _pickupLocation

      if (!_dropOffLocation) {
        setLoading(false)
        setNoMatch(true)
        return
      }

      const payload: bookcarsTypes.GetCarsPayload = {
        pickupLocation: _pickupLocation._id,
        carSpecs,
        carType,
        gearbox,
        mileage,
        fuelPolicy,
        deposit,
        ranges,
        multimedia,
        rating,
        seats,
        startDate,
        endDate,
        suppliers: suppliersFromUrl
      }

      let _suppliers = await SupplierService.getFrontendSuppliers(payload)

      if (suppliersFromUrl && suppliersFromUrl.length > 0) {
        _suppliers = _suppliers.filter((s) => s._id && suppliersFromUrl.includes(s._id))
      }

      const _supplierIds = bookcarsHelper.flattenSuppliers(_suppliers)

      setPickupLocation(_pickupLocation)
      setDropOffLocation(_dropOffLocation)
      setFrom(startDate)
      setTo(endDate)
      setSuppliers(_suppliers)
      setSupplierIds(_supplierIds)

      if (state?.ranges) {
        setRanges(state.ranges)
      }

      setLoading(false)
      if (!user || user.verified) {
        setVisible(true)
      }
    } catch (err) {
      helper.error(err)
    }
  }

  return (
    <Layout onLoad={onLoad} strict={false}>
      {visible && supplierIds && pickupLocation && dropOffLocation && from && to && (
        <div className="search">
          <div className="col-1">
            {!loading && (
              <>
                {pickupLocation.latitude && pickupLocation.longitude && (
                  <Map
                    position={[pickupLocation.latitude || 36.966428, pickupLocation.longitude || -95.844032]}
                    initialZoom={pickupLocation.latitude && pickupLocation.longitude ? 10 : 2.5}
                    parkingSpots={pickupLocation.parkingSpots}
                    className="map"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMapDialog(true)
                      }}
                      className="view-on-map"
                    >
                      <img alt="View On Map" src={ViewOnMap} />
                      <span>{strings.VIEW_ON_MAP}</span>
                    </button>
                  </Map>
                )}
                <CarFilter
                  className="filter"
                  pickupLocation={pickupLocation}
                  dropOffLocation={dropOffLocation}
                  from={from}
                  to={to}
                  suppliers={selectedSupplier}
                  accordion
                  collapse
                  onSubmit={handleCarFilterSubmit}
                />
                <SupplierFilter className="filter" suppliers={suppliers} onChange={handleSupplierFilterChange} />
                <CarRatingFilter className="filter" onChange={handleRatingFilterChange} />
                <CarRangeFilter className="filter" onChange={handleRangeFilterChange} />
                <CarMultimediaFilter className="filter" onChange={handleMultimediaFilterChange} />
                <CarSeatsFilter className="filter" onChange={handleSeatsFilterChange} />
                <CarSpecsFilter className="filter" onChange={handleCarSpecsFilterChange} />
                <CarType className="filter" onChange={handleCarTypeFilterChange} />
                <GearboxFilter className="filter" onChange={handleGearboxFilterChange} />
                <MileageFilter className="filter" onChange={handleMileageFilterChange} />
                <FuelPolicyFilter className="filter" onChange={handleFuelPolicyFilterChange} />
                <DepositFilter className="filter" onChange={handleDepositFilterChange} />
              </>
            )}
          </div>
          <div className="col-2">
            <CarList
              carSpecs={carSpecs}
              suppliers={supplierIds}
              carType={carType}
              gearbox={gearbox}
              mileage={mileage}
              fuelPolicy={fuelPolicy}
              deposit={deposit}
              pickupLocation={pickupLocation._id}
              dropOffLocation={dropOffLocation._id}
              // pickupLocationName={pickupLocation.name}
              loading={loading}
              from={from}
              to={to}
              ranges={ranges}
              multimedia={multimedia}
              rating={rating}
              seats={seats}
            // distance={distance}
            />
          </div>
        </div>
      )}

      <Dialog
        fullWidth={env.isMobile()}
        maxWidth={false}
        open={openMapDialog}
        onClose={() => {
          setOpenMapDialog(false)
        }}
        sx={{
          '& .MuiDialog-container': {
            '& .MuiPaper-root': {
              width: '80%',
              height: '800px',
            },
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="flex-end">
            <Box>
              <IconButton
                onClick={() => {
                  setOpenMapDialog(false)
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent className="map-dialog-content">
          {pickupLocation && (
            <Map
              position={[pickupLocation.latitude || 36.966428, pickupLocation.longitude || -95.844032]}
              initialZoom={pickupLocation.latitude && pickupLocation.longitude ? 10 : 2.5}
              parkingSpots={pickupLocation.parkingSpots}
              className="map"
            >
              <button
                type="button"
                onClick={() => { }}
                className="view-on-map"
              >
                <img alt="View On Map" src={ViewOnMap} />
                <span>{strings.VIEW_ON_MAP}</span>
              </button>
            </Map>
          )}
        </DialogContent>
      </Dialog>

      {noMatch && <NoMatch hideHeader />}
    </Layout>
  )
}

export default Search
