import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@mui/material'
import L from 'leaflet'
import { Helmet } from 'react-helmet'
import env from '@/config/env.config'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import * as LocationService from '@/services/LocationService'
import Layout from '@/components/Layout'
import Map from '@/components/Map'
import SearchForm from '@/components/SearchForm'
import Footer from '@/components/Footer'
import '@/assets/css/locations.css'

const Locations = () => {
  const [locations, setLocations] = useState<bookcarsTypes.Location[]>([])
  const [pickupLocation, setPickupLocation] = useState('')
  const [openSearchFormDialog, setOpenSearchFormDialog] = useState(false)

  // Fonction pour charger les emplacements au chargement du composant
  const onLoad = async () => {
    try {
      const _locations = await LocationService.getLocationsWithPosition()
      setLocations(_locations)
    } catch (error) {
      console.error('Erreur lors du chargement des emplacements :', error)
    }
  }

  useEffect(() => {
    onLoad()
  }, [])

  return (
    <Layout strict={false}>
      {/* SEO et données structurées */}
      <Helmet>
        <meta charSet="utf-8" />
        <title>Carte des Agences de Location de Voiture en Tunisie - Plany.tn</title>
        <meta
          name="description"
          content="Découvrez la carte interactive des agences de location de voiture en Tunisie. Localisez facilement les agences près de chez vous ou dans vos destinations préférées."
        />
        <link rel="canonical" href="https://plany.tn/locations" />

        {/* Balises Open Graph pour les réseaux sociaux */}
        <meta
          property="og:title"
          content="Carte des Agences de Location de Voiture en Tunisie - Plany.tn"
        />
        <meta
          property="og:description"
          content="Découvrez la carte interactive des agences de location de voiture en Tunisie. Localisez facilement les agences près de chez vous ou dans vos destinations préférées."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plany.tn/locations" />
        <meta property="og:image" content="https://plany.tn/map-screenshot.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Plany" />

        {/* Balises Twitter Card pour Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Carte des Agences de Location de Voiture en Tunisie - Plany.tn"
        />
        <meta
          name="twitter:description"
          content="Découvrez la carte interactive des agences de location de voiture en Tunisie. Localisez facilement les agences près de chez vous ou dans vos destinations préférées."
        />
        <meta name="twitter:image" content="https://plany.tn/map-screenshot.png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />

        {/* Données structurées pour Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Map',
            name: 'Carte des Agences de Location de Voiture en Tunisie',
            description:
              'Visualisez la carte interactive des agences de location de voiture en Tunisie. Recherchez et sélectionnez une agence près de chez vous ou dans vos destinations préférées.',
            url: 'https://plany.tn/locations',
            mapType: 'InteractiveMap',
          })}
        </script>
      </Helmet>

      {/* Contenu principal */}
      <div className="locations">
        <Map
          position={new L.LatLng(34.0268755, 1.6528399999999976)}
          initialZoom={5}
          locations={locations}
          onSelelectPickUpLocation={async (locationId) => {
            setPickupLocation(locationId)
            setOpenSearchFormDialog(true)
          }}
        />
      </div>

      {/* Formulaire de recherche dans un dialogue modal */}
      <Dialog
        fullWidth={env.isMobile()}
        maxWidth={false}
        open={openSearchFormDialog}
        onClose={() => {
          setOpenSearchFormDialog(false)
        }}
      >
        <DialogContent className="search-dialog-content">
          <SearchForm
            ranges={bookcarsHelper.getAllRanges()}
            pickupLocation={pickupLocation}
            onCancel={() => {
              setOpenSearchFormDialog(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Pied de page */}
      <Footer />
    </Layout>
  )
}

export default Locations
