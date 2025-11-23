import React, { Suspense, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { Helmet } from 'react-helmet'
import Seo from '@/components/Seo'
import { buildDescription, stripQuery, isParamSearch } from '@/common/seo'
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
import SupplierFilter from '@/components/SupplierFilter'
import CarType from '@/components/CarTypeFilter'
import GearboxFilter from '@/components/GearboxFilter'
import MileageFilter from '@/components/MileageFilter'
import DepositFilter from '@/components/DepositFilter'
import CarList from '@/components/CarList'
import MapPlaceholder from '@/components/MapPlaceholder'
import PriceRangeFilter from '@/components/PriceRangeFilter'
import SearchStatus from '@/components/SearchStatus'

import ViewOnMap from '@/assets/img/view-on-map.png'

import '@/assets/css/search.css'
import LocationHeader from '@/components/LocationHeader'

const MapView = React.lazy(() => import('@/components/Map'))

const Search = () => {
  const location = useLocation()
  const { pickupLocationSlug, supplierSlug } = useParams()

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
  const [pageStatus, setPageStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [statusMessage, setStatusMessage] = useState<string>()
  const [carSpecs] = useState<bookcarsTypes.CarSpecs>({})
  const [carType, setCarType] = useState(bookcarsHelper.getAllCarTypes())
  const [gearbox, setGearbox] = useState([bookcarsTypes.GearboxType.Automatic, bookcarsTypes.GearboxType.Manual])
  const [mileage, setMileage] = useState([bookcarsTypes.Mileage.Limited, bookcarsTypes.Mileage.Unlimited])
  const [fuelPolicy] = useState([bookcarsTypes.FuelPolicy.FreeTank, bookcarsTypes.FuelPolicy.LikeForLike])
  const [deposit, setDeposit] = useState(-1)
  const [ranges, setRanges] = useState(bookcarsHelper.getAllRanges())
  const [multimedia] = useState<bookcarsTypes.CarMultimedia[]>([])
  const [rating] = useState(-1)
  const [seats] = useState(-1)
  const [openMapDialog, setOpenMapDialog] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showDialogMap, setShowDialogMap] = useState(false)
  const [minMax, setMinMAx] = useState<number[]>([40, 1000])

  // const [distance, setDistance] = useState('')

  useEffect(() => {
    const fetchSuppliers = async () => {
      setPageStatus('loading')
      try {
        let fetchedSuppliers = await SupplierService.getAllSuppliers()
        setAllSuppliers(fetchedSuppliers)
        if (supplierSlug) {
          fetchedSuppliers = fetchedSuppliers.filter((s) => s.slug === supplierSlug)
        }
        setAllSuppliersIds(bookcarsHelper.flattenSuppliers(fetchedSuppliers))
      } catch (err) {
        helper.error(err, 'Failed to fetch suppliers')
        setStatusMessage(strings.SEARCH_ERROR_SUPPLIERS)
        setPageStatus('error')
      }
    }

    fetchSuppliers()
  }, [supplierSlug])

  useEffect(() => {
    const updateSuppliers = async () => {
      if (pickupLocation) {
        try {
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
          let _suppliers = await SupplierService.getFrontendSuppliers(payload)
          if (supplierSlug) {
            _suppliers = _suppliers.filter((s) => s.slug === supplierSlug)
          }
          setSuppliers(_suppliers)
        } catch (err) {
          helper.error(err)
          setStatusMessage(strings.SEARCH_ERROR_SUPPLIERS)
          setPageStatus('error')
        }
      }
    }

    updateSuppliers()
  }, [pickupLocation, carSpecs, carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, from, to, supplierSlug])

  useEffect(() => {
    if (openMapDialog) {
      setShowDialogMap(true)
    }
  }, [openMapDialog])

  const supplier = supplierSlug ? suppliers.find((s) => s.slug === supplierSlug) : undefined

  const canonical = `https://plany.tn${stripQuery(location.pathname)}`

  let title = 'Location Voiture en Tunisie - Comparez et Réservez | Plany.tn'
  let desc = 'Location de voiture en Tunisie ✓ Prix bas garantis ✓ Réservation en ligne ✓ Large choix de véhicules ✓ Agences locales vérifiées. Comparez et réservez sur Plany.tn !'

  if (pickupLocation && supplier) {
    title = `Location voiture – ${supplier.fullName} (${pickupLocation.name}) | Plany.tn`
    desc = `Découvrez les voitures de ${supplier.fullName} à ${pickupLocation.name}. Comparez les prix et réservez en ligne sur Plany.tn.`
  } else if (pickupLocation) {
    title = `Location voiture ${pickupLocation.name} – Prix & agences | Plany.tn`
    desc = `Comparez les agences à ${pickupLocation.name} et réservez au meilleur prix.`
  }

  const description = buildDescription(desc)
  const robots = isParamSearch(location) || noMatch ? 'noindex,follow' : undefined

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
    const filteredSuppliers = suppliers.filter((s) => s._id && newSuppliers.includes(s._id.toString())).map((s) => s.slug) as string[]
    setSelectedSupplier(filteredSuppliers.length === suppliers.length ? [] : filteredSuppliers)
  }

  const handleCarFilterMinMax = (value?: number[]) => {
    if (value) {
      setMinMAx(value)
    }
    // Vérifier que les valeurs obligatoires sont définies
    if (!pickupLocation || !dropOffLocation || !from || !to) {
      console.error('Certains filtres obligatoires sont manquants.')
      return
    }

    // Créer un objet avec tous les filtres actuels
    const updatedFilter = {
      pickupLocation, // Assuré d'être défini
      dropOffLocation, // Assuré d'être défini
      from, // Assuré d'être défini
      to, // Assuré d'être défini
      selectedSupplier: selectedSupplier || [], // Valeur par défaut si undefined
    }

    // Appeler la fonction de soumission avec tous les filtres
    handleCarFilterSubmit(updatedFilter)
  }

  const marks = [
    {
      value: 40,
      label: '40DT',
    },
    {
      value: 1000,
      label: '1000DT',
    }]

  const handleCarTypeFilterChange = (values: bookcarsTypes.CarType[]) => {
    setCarType(values)
  }

  const handleGearboxFilterChange = (values: bookcarsTypes.GearboxType[]) => {
    setGearbox(values)
  }

  const handleMileageFilterChange = (values: bookcarsTypes.Mileage[]) => {
    setMileage(values)
  }

  const handleDepositFilterChange = (value: number) => {
    setDeposit(value)
  }

  const onLoad = async (user?: bookcarsTypes.User) => {
    const searchParams = new URLSearchParams(window.location.search)
    const pickupLocationIdFromUrl = searchParams.get('pickupLocation') || null
    const suppliersFromUrl = searchParams.get('supplier')?.split(',').filter(Boolean) || []
    const { state } = location
    let pickupLocationId = state?.pickupLocationId || pickupLocationIdFromUrl || pickupLocationSlug
    if (!pickupLocationId) {
      const checkoutStr = localStorage.getItem('checkout')
      if (checkoutStr) {
        try {
          const checkout = JSON.parse(checkoutStr) as { pickupLocationId?: string }
          if (checkout.pickupLocationId) {
            pickupLocationId = checkout.pickupLocationId
          }
        } catch {
          /* empty */
        }
      }
    }
    pickupLocationId = pickupLocationId || 'aeroport-international-de-tunis-carthage'
    const dropOffLocationId = state?.dropOffLocationId || null
    const _from = state?.from || null
    const _to = state?.to || null

    if (!pickupLocationId) {
      setNoMatch(true)
      return
    }

    const now = new Date()
    const minPickupDate = new Date(now)
    minPickupDate.setDate(minPickupDate.getDate() + 1)
    minPickupDate.setHours(10, 0, 0, 0)

    const maxDropOffDate = new Date()
    maxDropOffDate.setMonth(maxDropOffDate.getMonth() + env.MAX_BOOKING_MONTHS)
    maxDropOffDate.setHours(20, 30, 0, 0)

    const maxPickupDate = new Date(maxDropOffDate)
    maxPickupDate.setDate(maxPickupDate.getDate() - 1)
    if (maxPickupDate < minPickupDate) {
      maxPickupDate.setTime(minPickupDate.getTime())
    }

    const defaultFrom = new Date(minPickupDate)

    const minDefaultTo = new Date(defaultFrom)
    minDefaultTo.setDate(minDefaultTo.getDate() + 1)

    let defaultTo = new Date(defaultFrom)
    defaultTo.setDate(defaultTo.getDate() + 3)

    if (defaultTo < minDefaultTo) {
      defaultTo = new Date(minDefaultTo)
    }

    if (defaultTo > maxDropOffDate) {
      defaultTo = new Date(maxDropOffDate)
    }

    let startDate = _from ? new Date(_from) : defaultFrom
    if (startDate < minPickupDate) {
      startDate = new Date(minPickupDate)
    }

    if (startDate > maxPickupDate) {
      startDate = new Date(maxPickupDate)
    }

    let endDate = _to ? new Date(_to) : defaultTo
    let minEndDate = new Date(startDate)
    minEndDate.setDate(startDate.getDate() + 1)

    if (minEndDate > maxDropOffDate) {
      minEndDate = new Date(maxDropOffDate)
    }

    if (endDate < minEndDate) {
      endDate = new Date(minEndDate)
    }

    if (endDate > maxDropOffDate) {
      endDate = new Date(maxDropOffDate)
    }

    try {
      const _pickupLocation = await LocationService.getLocation(pickupLocationId, supplierSlug)
      if (!_pickupLocation) {
        setLoading(false)
        setNoMatch(true)
        setPageStatus('error')
        return
      }

      const _dropOffLocation = dropOffLocationId && dropOffLocationId !== pickupLocationId
        ? await LocationService.getLocation(pickupLocationId, supplierSlug)
        : _pickupLocation

      if (!_dropOffLocation) {
        setLoading(false)
        setNoMatch(true)
        setPageStatus('error')
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
      } else if (supplierSlug) {
        _suppliers = _suppliers.filter((s) => s.slug === supplierSlug)
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
      setPageStatus('ready')
    } catch (err) {
      helper.error(err)
      setStatusMessage(strings.SEARCH_ERROR_GENERIC)
      setPageStatus('error')
    }
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Plany.tn - Recherche de Voitures à Louer en Tunisie',
    description: 'Recherchez et comparez les offres de location de voitures en Tunisie selon votre emplacement. Dès 65DT/jour, trouvez la voiture qui correspond à vos besoins.',
    image: 'https://plany.tn/logo.png',
    url: 'https://plany.tn',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Plany.tn',
      description: 'Plateforme de location de voitures en Tunisie proposant des prix compétitifs et une réservation en ligne sécurisée.',
      logo: {
        '@type': 'ImageObject',
        url: 'https://plany.tn/logo.png',
        width: 1200,
        height: 630
      },
      telephone: '+216 21 170 468',
      email: 'contact@plany.tn',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rue de la Liberté',
        addressLocality: 'Tunis',
        postalCode: '1000',
        addressCountry: 'TN'
      },
      priceRange: '65DT - 200DT',
      openingHours: 'Mo-Su 08:00-18:00',
      sameAs: [
        'https://www.facebook.com/plany.tn',
        'https://www.instagram.com/plany.tn'
      ],
      areaServed: [
        {
          '@type': 'City',
          name: 'Tunis',
          url: 'https://plany.tn/search?pickupLocation=67547fef27ee3d7b476bc64d'
        },
        {
          '@type': 'Airport',
          name: 'Aéroport International de Tunis-Carthage',
          url: 'https://plany.tn/search?pickupLocation=675e8576f2a6e5a87913cfed'
        },
        {
          '@type': 'City',
          name: 'Sousse',
          url: 'https://plany.tn/search?pickupLocation=675e8b7ef2a6e5a87913d103'
        },
        {
          '@type': 'City',
          name: 'Monastir',
          url: 'https://plany.tn/search?pickupLocation=675e8d65f2a6e5a87913d199'
        },
        {
          '@type': 'City',
          name: 'Nabeul',
          url: 'https://plany.tn/search?pickupLocation=675e896bf2a6e5a87913d061'
        },
        {
          '@type': 'City',
          name: 'Mahdia',
          url: 'https://plany.tn/search?pickupLocation=675e9201f2a6e5a87913d212'
        },
        {
          '@type': 'Airport',
          name: 'Aéroport International de Monastir Habib-Bourguiba',
          url: 'https://plany.tn/search?pickupLocation=675e85aef2a6e5a87913cffc'
        },
        {
          '@type': 'Airport',
          name: 'Aéroport International de Djerba-Zarzis',
          url: 'https://plany.tn/search?pickupLocation=675e8612f2a6e5a87913d01e'
        }
        // Ajoutez d'autres villes et aéroports ici dynamiquement
      ]
    }
  }

  const handleRetry = () => {
    setPageStatus('loading')
    setStatusMessage(undefined)
    onLoad()
  }

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo title={title} description={description} canonical={canonical} robots={robots} />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {pageStatus === 'error' && <SearchStatus status="error" message={statusMessage} onRetry={handleRetry} />}

      {pageStatus === 'loading' && <SearchStatus status="loading" message={strings.SEARCH_LOADING} />}

      {visible && supplierIds && pickupLocation && dropOffLocation && from && to && pageStatus === 'ready' && (
        <div className="search">
          <div className="col-1">
            {!loading && (
              <>
                {pickupLocation.latitude && pickupLocation.longitude && (
                  <>
                    {!showMap && <MapPlaceholder onShowMap={() => setShowMap(true)} label={strings.VIEW_ON_MAP} />}
                    {showMap && (
                      <Suspense fallback="Chargement…">
                        <MapView
                          position={[pickupLocation.latitude || 36.966428, pickupLocation.longitude || -95.844032]}
                          initialZoom={pickupLocation.latitude && pickupLocation.longitude ? 10 : 2.5}
                          parkingSpots={pickupLocation.parkingSpots}
                          className="map"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setShowDialogMap(true)
                              setOpenMapDialog(true)
                            }}
                            className="view-on-map"
                          >
                            <img alt="View On Map" src={ViewOnMap} />
                            <span>{strings.VIEW_ON_MAP}</span>
                          </button>
                        </MapView>
                      </Suspense>
                    )}
                  </>
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
                { /* <CarRatingFilter className="filter" onChange={handleRatingFilterChange} />
                <CarRangeFilter className="filter" onChange={handleRangeFilterChange} />
                <CarMultimediaFilter className="filter" onChange={handleMultimediaFilterChange} />
                <CarSeatsFilter className="filter" onChange={handleSeatsFilterChange} />
                <FuelPolicyFilter className="filter" onChange={handleFuelPolicyFilterChange} />
                <CarSpecsFilter className="filter" onChange={handleCarSpecsFilterChange} /> */}
                <CarType className="filter" onChange={handleCarTypeFilterChange} />
                <GearboxFilter className="filter" onChange={handleGearboxFilterChange} />
                <MileageFilter className="filter" onChange={handleMileageFilterChange} />
                <DepositFilter className="filter" onChange={handleDepositFilterChange} />
              </>
            )}
          </div>
          <div className="col-2">
            <LocationHeader
              location={pickupLocation}
            />
            <PriceRangeFilter
              value={minMax}
              min={marks[0].value}
              max={marks[1].value}
              marks={marks}
              onChange={(value) => setMinMAx(value)}
              onChangeCommitted={handleCarFilterMinMax}
            />
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
              minPrice={minMax[0]}
              maxPrice={minMax[1]}
              boost={false}
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
        <DialogTitle className="map-dialog-title">
          <button type="button" className="map-dialog-close" onClick={() => setOpenMapDialog(false)} aria-label="Fermer la carte">
            <CloseIcon />
          </button>
        </DialogTitle>
      <DialogContent className="map-dialog-content">
        {pickupLocation && (
          <>
            {!showDialogMap && (
              <MapPlaceholder onShowMap={() => setShowDialogMap(true)} label={strings.VIEW_ON_MAP} />
            )}
            {showDialogMap && (
              <Suspense fallback="Chargement…">
                <MapView
                  position={[pickupLocation.latitude || 36.966428, pickupLocation.longitude || -95.844032]}
                  initialZoom={pickupLocation.latitude && pickupLocation.longitude ? 10 : 2.5}
                  parkingSpots={pickupLocation.parkingSpots}
                  className="map"
                >
                  <button
                    type="button"
                    onClick={() => { setOpenMapDialog(false) }}
                    className="view-on-map"
                  >
                    <img alt="View On Map" src={ViewOnMap} />
                    <span>{strings.VIEW_ON_MAP}</span>
                  </button>
                </MapView>
              </Suspense>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>

      {noMatch && <NoMatch hideHeader />}
    </Layout>
  )
}

export default Search
