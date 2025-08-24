import React, { useState } from 'react'
// Removed Material UI imports in favor of native elements with Tailwind CSS
import L from 'leaflet'
import { Helmet } from 'react-helmet'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/home'
import * as UserService from '@/services/UserService'
import * as SupplierService from '@/services/SupplierService'
import * as CountryService from '@/services/CountryService'
import * as LocationService from '@/services/LocationService'
import Layout from '@/components/Layout'
import SupplierCarrousel from '@/components/SupplierCarrousel'
// TabPanel replaced with simple conditional rendering
import LocationCarrousel from '@/components/LocationCarrousel'
import SearchForm from '@/components/SearchForm'
import Map from '@/components/Map'
import Footer from '@/components/Footer'

import Mini from '@/assets/img/mini.png'
import Midi from '@/assets/img/midi.png'
import Maxi from '@/assets/img/maxi.png'

// Tailwind CSS styles are used; removed old stylesheet
import HowItWorks from '@/components/HowItWorks'
import RentalAgencySection from '@/components/RentalAgencySection'

const Home = () => {
  const [suppliers, setSuppliers] = useState<bookcarsTypes.User[]>([])
  const [countries, setCountries] = useState<bookcarsTypes.CountryInfo[]>([])
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropOffLocation, setDropOffLocation] = useState('')
  const [sameLocation, setSameLocation] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [openLocationSearchFormDialog, setOpenLocationSearchFormDialog] = useState(false)
  const [locations, setLocations] = useState<bookcarsTypes.Location[]>([])
  const [ranges, setRanges] = useState([bookcarsTypes.CarRange.Mini, bookcarsTypes.CarRange.Midi])
  const [openRangeSearchFormDialog, setOpenRangeSearchFormDialog] = useState(false)

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue)
  }

  const onLoad = async () => {
    let _suppliers = await SupplierService.getAllSuppliers()
    _suppliers = _suppliers.filter((supplier) => supplier.avatar && !/no-image/i.test(supplier.avatar))
    bookcarsHelper.shuffle(_suppliers)
    setSuppliers(_suppliers)
    const _countries = await CountryService.getCountriesWithLocations('', true, env.MIN_LOCATIONS)
    setCountries(_countries)
    const _locations = await LocationService.getLocationsWithPosition()
    setLocations(_locations)
  }

  const language = UserService.getLanguage()

  const locationsData = [
    {
      _id: '675e85aef2a6e5a87913cffc',
      name: 'Aéroport International de Monastir Habib-Bourguiba',
      latitude: 35.7597,
      longitude: 10.7547
    },
    {
      _id: '675e8612f2a6e5a87913d01e',
      name: 'Aéroport International de Djerba-Zarzis',
      latitude: 33.875,
      longitude: 10.7758
    },
    {
      _id: '675e8576f2a6e5a87913cfed',
      name: 'Aéroport International de Tunis-Carthage',
      latitude: 36.851,
      longitude: 10.227
    },
    // Ajoutez ici toutes les autres données...
    {
      _id: '675e8b7ef2a6e5a87913d103',
      name: 'Sousse (Centre-ville)',
      latitude: 35.8256,
      longitude: 10.636
    },
    {
      _id: '675e896bf2a6e5a87913d061',
      name: 'Nabeul (centre-ville)',
      latitude: 36.4551,
      longitude: 10.7377
    },
    {
      _id: '675e8d65f2a6e5a87913d199',
      name: 'Monastir (Centre-ville)',
      latitude: 35.776,
      longitude: 10.8262
    },
    {
      _id: '675e9201f2a6e5a87913d212',
      name: 'Mahdia (Centre-ville)',
      latitude: 35.506798,
      longitude: 11.046753
    },
    {
      _id: '675e863af2a6e5a87913d02d',
      name: 'Aéroport International de Sfax',
      latitude: 34.718,
      longitude: 10.69
    },
    {
      _id: '675e8689f2a6e5a87913d03c',
      name: "Aéroport International d'Enfidha-Hammamet",
      latitude: 36.0758,
      longitude: 10.4386
    }
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Accueil - Plany.tn',
    description:
      'Plany.tn : La plateforme leader de location de voitures en Tunisie. Louez une voiture facilement avec notre comparateur d’agences locales.',
    url: 'https://plany.tn/',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Plany.tn',
      description:
        'Découvrez nos offres de location de voitures dans les principales villes et aéroports de Tunisie. Réservez en ligne rapidement et en toute sécurité.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rue de la Liberté',
        addressLocality: 'Tunis',
        postalCode: '1000',
        addressCountry: 'TN',
      },
      areaServed: locationsData.map((location) => ({
        '@type': location.name.includes('Aéroport') ? 'Airport' : 'City',
        name: location.name,
        url: `https://plany.tn/search?pickupLocation=${location._id}`,
      })),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Offres de Location de Voitures',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Location de Voiture Économique',
            description: 'Voiture compacte idéale pour une conduite en ville.',
            price: '65',
            priceCurrency: 'TND',
            availability: 'http://schema.org/InStock',
            url: 'https://plany.tn/location-voiture-pas-cher-a-tunis',
          },
          {
            '@type': 'Offer',
            name: 'Location de Voiture Premium',
            description: 'Voiture de luxe pour un confort exceptionnel.',
            price: '200',
            priceCurrency: 'TND',
            availability: 'http://schema.org/InStock',
            url: 'https://plany.tn/search',
          },
        ],
      },
    },
  }

  const description = buildDescription(
    'Plany.tn : La plateforme leader de location de voitures en Tunisie. Louez une voiture facilement avec notre comparateur d’agences locales.'
  )

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo
        title="Location de voitures en Tunisie – Réservez en ligne au meilleur tarif | Plany.tn"
        description={description}
        canonical="https://plany.tn/"
      />
      <Helmet>
        <meta charSet="utf-8" />
        {/* Balises Open Graph */}
        <meta property="og:title" content="Location de voitures en Tunisie – Réservez en ligne au meilleur tarif | Plany.tn" />
        <meta
          property="og:description"
          content="Plany.tn : La plateforme leader de location de voitures en Tunisie. Louez une voiture facilement avec notre comparateur d’agences locales."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plany.tn/" />
        <meta property="og:image" content="https://plany.tn/home-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Plany" />

        {/* Balises Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Accueil - Plany.tn" />
        <meta
          name="twitter:description"
          content="Plany.tn : La plateforme leader de location de voitures en Tunisie. Louez une voiture facilement avec notre comparateur d’agences locales."
        />
        <meta name="twitter:image" content="https://plany.tn/home-image.png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />

        {/* Données Structurées Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div className="space-y-8">
        <div className="text-center py-10 bg-gray-100">
          {strings.COVER}
        </div>

        <div className="flex justify-center">
          <SearchForm />
        </div>

        {suppliers.length > 0 && (
          <div className="px-4">
            <h1 className="text-xl font-bold mb-4">{strings.SUPPLIERS_TITLE}</h1>
            <SupplierCarrousel suppliers={suppliers} />
          </div>
        )}

        {countries.length > 0 && (
          <div className="destinations px-4">
            <h1 className="text-xl font-bold mb-4">{strings.DESTINATIONS_TITLE}</h1>
            <div>
              <div className="flex flex-wrap">
                {countries.map((country, index) => (
                  <button
                    type="button"
                    key={country._id}
                    className={`px-4 py-2 border-b-2 ${tabValue === index ? 'border-primary text-primary' : 'border-transparent'}`}
                    onClick={() => handleTabChange(index)}
                  >
                    {country.name?.toUpperCase()}
                  </button>
                ))}
              </div>
              {countries.map((country, index) => (
                tabValue === index && (
                  <div key={country._id} className="mt-4">
                    <LocationCarrousel
                      locations={country.locations!}
                      onSelect={(location) => {
                        setPickupLocation(location._id)
                        setOpenLocationSearchFormDialog(true)
                      }}
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        <HowItWorks />
        <div className="car-size px-4">
          <h1 className="text-xl font-bold mb-4">{strings.CAR_SIZE_TITLE}</h1>
          <p className="mb-4">{strings.CAR_SIZE_TEXT}</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded p-4 text-center">
              <img alt="Mini" src={Mini} className="mx-auto mb-2" />
              <label htmlFor="rangeMini" className="flex items-center justify-center space-x-2 mb-2">
                <input
                  id="rangeMini"
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => {
                    const _ranges = bookcarsHelper.cloneArray(ranges) || []
                    if (e.target.checked) {
                      _ranges.push(bookcarsTypes.CarRange.Mini)
                    } else {
                      _ranges.splice(_ranges.findIndex((r) => r === bookcarsTypes.CarRange.Mini), 1)
                    }
                    setRanges(_ranges)
                  }}
                  className="h-4 w-4"
                />
                <span>{strings.MINI}</span>
              </label>
              <div className="font-medium mb-1">
                À partir de
                {' '}
                {bookcarsHelper.formatPrice(100, commonStrings.CURRENCY, language)}
                /Jour
              </div>
              <div>
                Compacte et économique, parfaite pour les trajets urbains ou courts voyages.
              </div>
            </div>
            <div className="border rounded p-4 text-center">
              <img alt="Midi" src={Midi} className="mx-auto mb-2" />
              <label htmlFor="rangeMidi" className="flex items-center justify-center space-x-2 mb-2">
                <input
                  id="rangeMidi"
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => {
                    const _ranges = bookcarsHelper.cloneArray(ranges) || []
                    if (e.target.checked) {
                      _ranges.push(bookcarsTypes.CarRange.Midi)
                    } else {
                      _ranges.splice(_ranges.findIndex((r) => r === bookcarsTypes.CarRange.Midi), 1)
                    }
                    setRanges(_ranges)
                  }}
                  className="h-4 w-4"
                />
                <span>{strings.MIDI}</span>
              </label>
              <div className="font-medium mb-1">
                À partir de
                {' '}
                {bookcarsHelper.formatPrice(130, commonStrings.CURRENCY, language)}
                /Jour
              </div>
              <div>
                Confortable et polyvalente, idéale pour les familles et les longs trajets
              </div>
            </div>
            <div className="border rounded p-4 text-center">
              <img alt="Maxi" src={Maxi} className="mx-auto mb-2" />
              <label htmlFor="rangeMaxi" className="flex items-center justify-center space-x-2 mb-2">
                <input
                  id="rangeMaxi"
                  type="checkbox"
                  onChange={(e) => {
                    const _ranges = bookcarsHelper.cloneArray(ranges) || []
                    if (e.target.checked) {
                      _ranges.push(bookcarsTypes.CarRange.Maxi)
                    } else {
                      _ranges.splice(_ranges.findIndex((r) => r === bookcarsTypes.CarRange.Maxi), 1)
                    }
                    setRanges(_ranges)
                  }}
                  className="h-4 w-4"
                />
                <span>{strings.MAXI}</span>
              </label>
              <div className="font-medium mb-1">
                À partir de
                {' '}
                {bookcarsHelper.formatPrice(160, commonStrings.CURRENCY, language)}
                /Jour
              </div>
              <div>
                Spacieuse et pratique, idéale pour les groupes et les longs voyages.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
            disabled={ranges.length === 0}
            onClick={() => {
              setOpenRangeSearchFormDialog(true)
            }}
          >
            {strings.SEARCH_FOR_CAR}
          </button>
        </div>
        <div className="px-4">
          <Map
            title={strings.MAP_TITLE}
            position={new L.LatLng(33.886917, 9.537499)}
            initialZoom={env.isMobile() ? 6 : 7}
            locations={locations}
            onSelelectPickUpLocation={async (locationId) => {
              setPickupLocation(locationId)
              if (sameLocation) {
                setDropOffLocation(locationId)
              } else {
                setSameLocation(dropOffLocation === locationId)
              }
              setOpenLocationSearchFormDialog(true)
            }}
          // onSelelectDropOffLocation={async (locationId) => {
          //   setDropOffLocation(locationId)
          //   setSameLocation(pickupLocation === locationId)
          //   helper.info(strings.MAP_DROP_OFF_SELECTED)
          // }}
          />
        </div>
        <RentalAgencySection />
      </div>

      {openLocationSearchFormDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-lg p-4">
            <SearchForm
              ranges={bookcarsHelper.getAllRanges()}
              pickupLocation={pickupLocation}
              onCancel={() => {
                setOpenLocationSearchFormDialog(false)
              }}
            />
          </div>
        </div>
      )}

      {openRangeSearchFormDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-lg p-4">
            <SearchForm
              ranges={ranges}
              onCancel={() => {
                setOpenRangeSearchFormDialog(false)
              }}
            />
          </div>
        </div>
      )}

      <Footer />
    </Layout>
  )
}

export default Home
