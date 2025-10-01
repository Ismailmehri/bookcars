import React, { useState } from 'react'
import { Alert, Button, Checkbox, Dialog, DialogContent, FormControlLabel, Tab, Tabs } from '@mui/material'
import L from 'leaflet'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
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
import * as AgencyVerificationService from '@/services/AgencyVerificationService'
import Layout from '@/components/Layout'
import SupplierCarrousel from '@/components/SupplierCarrousel'
import TabPanel, { a11yProps } from '@/components/TabPanel'
import LocationCarrousel from '@/components/LocationCarrousel'
import SearchForm from '@/components/SearchForm'
import Map from '@/components/Map'
import Footer from '@/components/Footer'

import Mini from '@/assets/img/mini.png'
import Midi from '@/assets/img/midi.png'
import Maxi from '@/assets/img/maxi.png'

import '@/assets/css/home.css'
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
  const [showAgencyVerificationReminder, setShowAgencyVerificationReminder] = useState(false)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const onLoad = async (loadedUser?: bookcarsTypes.User) => {
    let _suppliers = await SupplierService.getAllSuppliers()
    _suppliers = _suppliers.filter((supplier) => supplier.avatar && !/no-image/i.test(supplier.avatar))
    bookcarsHelper.shuffle(_suppliers)
    setSuppliers(_suppliers)
    const _countries = await CountryService.getCountriesWithLocations('', true, env.MIN_LOCATIONS)
    setCountries(_countries)
    const _locations = await LocationService.getLocationsWithPosition()
    setLocations(_locations)

    if (loadedUser && loadedUser.type === bookcarsTypes.UserType.Supplier) {
      if (loadedUser.agencyVerified) {
        setShowAgencyVerificationReminder(false)
        return
      }

      try {
        const documents = await AgencyVerificationService.getMyDocuments()
        const hasAllApprovedDocuments = bookcarsTypes.REQUIRED_AGENCY_DOCUMENTS.every((requiredDocType) => {
          const document = documents.find((doc) => doc.docType === requiredDocType)
          return document?.latest?.status === bookcarsTypes.AgencyDocumentStatus.ACCEPTE
        })
        setShowAgencyVerificationReminder(!hasAllApprovedDocuments)
      } catch (err) {
        console.error(err)
        setShowAgencyVerificationReminder(false)
      }
    } else {
      setShowAgencyVerificationReminder(false)
    }
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
      {showAgencyVerificationReminder && (
        <Alert
          severity="warning"
          sx={{ mt: 2, mb: 3 }}
          action={(
            <Button
              color="warning"
              component={Link}
              to="/agency-verification"
              variant="contained"
            >
              {strings.AGENCY_VERIFICATION_REMINDER_BUTTON}
            </Button>
          )}
        >
          {strings.AGENCY_VERIFICATION_REMINDER_MESSAGE}
        </Alert>
      )}
      <div className="home">
        <div className="home-content">

          <div className="home-cover">{strings.COVER}</div>

          <div className="home-search">
            <SearchForm />
          </div>

        </div>

        <div className="home-suppliers">
          {suppliers.length > 0 && (
            <>
              <h1>{strings.SUPPLIERS_TITLE}</h1>
              <SupplierCarrousel suppliers={suppliers} />
            </>
          )}
        </div>

        {countries.length > 0 && (
          <div className="destinations">
            <h1>{strings.DESTINATIONS_TITLE}</h1>
            <div className="tabs">
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="destinations"
                TabIndicatorProps={{ sx: { display: env.isMobile() ? 'none' : null } }}
                sx={{
                  '& .MuiTabs-flexContainer': {
                    flexWrap: 'wrap',
                  },
                }}
              >
                {
                  countries.map((country, index) => (
                    <Tab key={country._id} label={country.name?.toUpperCase()} {...a11yProps(index)} />
                  ))
                }
              </Tabs>

              {
                countries.map((country, index) => (
                  <TabPanel key={country._id} value={tabValue} index={index}>
                    <LocationCarrousel
                      locations={country.locations!}
                      onSelect={(location) => {
                        setPickupLocation(location._id)
                        setOpenLocationSearchFormDialog(true)
                      }}
                    />
                  </TabPanel>
                ))
              }
            </div>
          </div>
        )}
        <HowItWorks />
        <div className="car-size">
          <h1>{strings.CAR_SIZE_TITLE}</h1>
          <p>{strings.CAR_SIZE_TEXT}</p>
          <div className="boxes">
            <div className="box">
              <img alt="Mini" src={Mini} />
              <div className="box-content">
                <FormControlLabel
                  control={(
                    <Checkbox
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
                    />
                  )}
                  label={strings.MINI}
                />
                <div>
                  <span className="price">
                    À partir de
                    {' '}
                    {bookcarsHelper.formatPrice(100, commonStrings.CURRENCY, language)}
                    /Jour
                  </span>
                </div>
                <div>
                  Compacte et économique, parfaite pour les trajets urbains ou courts voyages.
                </div>
              </div>
            </div>
            <div className="box">
              <img alt="Midi" src={Midi} />
              <div className="box-content">
                <FormControlLabel
                  control={(
                    <Checkbox
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
                    />
                  )}
                  label={strings.MIDI}
                />
                <div>
                  <span className="price">
                    À partir de
                    {' '}
                    {bookcarsHelper.formatPrice(130, commonStrings.CURRENCY, language)}
                    /Jour
                  </span>
                </div>
                <div>
                  Confortable et polyvalente, idéale pour les familles et les longs trajets
                </div>
              </div>
            </div>
            <div className="box">
              <img alt="Maxi" src={Maxi} />
              <div className="box-content">
                <FormControlLabel
                  control={(
                    <Checkbox
                      onChange={(e) => {
                        const _ranges = bookcarsHelper.cloneArray(ranges) || []
                        if (e.target.checked) {
                          _ranges.push(bookcarsTypes.CarRange.Maxi)
                        } else {
                          _ranges.splice(_ranges.findIndex((r) => r === bookcarsTypes.CarRange.Maxi), 1)
                        }
                        setRanges(_ranges)
                      }}
                    />
                  )}
                  label={strings.MAXI}
                />
                <div>
                  <span className="price">
                    À partir de
                    {' '}
                    {bookcarsHelper.formatPrice(160, commonStrings.CURRENCY, language)}
                    /Jour
                  </span>
                </div>
                <div>
                  Spacieuse et pratique, idéale pour les groupes et les longs voyages.
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="contained"
            className="btn-primary btn-home"
            disabled={ranges.length === 0}
            onClick={() => {
              setOpenRangeSearchFormDialog(true)
            }}
          >
            {strings.SEARCH_FOR_CAR}
          </Button>
        </div>
        <div className="home-map">
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

      <Dialog
        fullWidth={env.isMobile()}
        maxWidth={false}
        open={openLocationSearchFormDialog}
        onClose={() => {
          setOpenLocationSearchFormDialog(false)
        }}
      >
        <DialogContent className="search-dialog-content">
          <SearchForm
            ranges={bookcarsHelper.getAllRanges()}
            pickupLocation={pickupLocation}
            onCancel={() => {
              setOpenLocationSearchFormDialog(false)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        fullWidth={env.isMobile()}
        maxWidth={false}
        open={openRangeSearchFormDialog}
        onClose={() => {
          setOpenRangeSearchFormDialog(false)
        }}
      >
        <DialogContent className="search-dialog-content">
          <SearchForm
            ranges={ranges}
            onCancel={() => {
              setOpenRangeSearchFormDialog(false)
            }}
          />
        </DialogContent>
      </Dialog>

      <Footer />
    </Layout>
  )
}

export default Home
