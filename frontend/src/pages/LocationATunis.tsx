import React from 'react'
import { Container, Typography, Box, Grid, Card, CardActionArea, CardMedia, CardContent, Link, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'
import '@/assets/css/home.css'
import SearchForm from '@/components/SearchForm'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'

const LocationVoitureTunisPasCher = () => {
  // Liste des 5 villes contenant "(Centre-ville)"
  const villesCentreVille = [
    {
      id: '67547fef27ee3d7b476bc64d',
      nom: 'Tunis',
      description: 'Explorez le cœur historique de Tunis avec une voiture de location. Parfait pour découvrir la médina, les souks et les sites culturels.',
    },
    {
      id: '675e896bf2a6e5a87913d061',
      nom: 'Nabeul',
      description: 'Découvrez Nabeul, la capitale de la poterie et des agrumes, avec une voiture de location. Idéal pour explorer les marchés locaux et les plages.',
    },
    {
      id: '675e8b7ef2a6e5a87913d103',
      nom: 'Sousse',
      description: 'Louez une voiture à Sousse pour visiter la médina classée au patrimoine de l\'UNESCO et profiter des plages de la côte est.',
    },
    {
      id: '675e8d65f2a6e5a87913d199',
      nom: 'Monastir',
      description: 'Explorez Monastir, ville natale de Bourguiba, avec une voiture de location. Parfait pour visiter le ribat et le mausolée présidentiel.',
    },
    {
      id: '675e9201f2a6e5a87913d212',
      nom: 'Mahdia',
      description: 'Découvrez Mahdia, une ville côtière pittoresque, avec une voiture de location. Idéal pour les amateurs de plages et de poissons frais.',
    },
  ]

  // Liste des 5 aéroports
  const aeroports = [
    {
      id: '675e8576f2a6e5a87913cfed',
      nom: 'Aéroport International de Tunis-Carthage',
      description: 'Réservez une voiture à l\'aéroport de Tunis-Carthage pour un transfert facile vers le centre-ville ou d\'autres destinations en Tunisie.',
    },
    {
      id: '675e85aef2a6e5a87913cffc',
      nom: 'Aéroport International de Monastir Habib-Bourguiba',
      description: 'Prenez le volant dès votre arrivée à l\'aéroport de Monastir. Idéal pour explorer Sousse, Monastir et les plages environnantes.',
    },
    {
      id: '675e8612f2a6e5a87913d01e',
      nom: 'Aéroport International de Djerba-Zarzis',
      description: 'Louez une voiture à l\'aéroport de Djerba pour découvrir l\'île des rêves, ses plages de sable fin et ses villages traditionnels.',
    },
    {
      id: '675e863af2a6e5a87913d02d',
      nom: 'Aéroport International de Sfax',
      description: 'Réservez une voiture à l\'aéroport de Sfax pour explorer la région du Sahel et ses sites historiques.',
    },
    {
      id: '675e8689f2a6e5a87913d03c',
      nom: 'Aéroport International d\'Enfidha-Hammamet',
      description: 'Démarrez votre voyage en Tunisie avec une voiture de location à l\'aéroport d\'Enfidha. Parfait pour visiter Hammamet et ses environs.',
    },
  ]

  const description = buildDescription(
    `Louez une voiture pas cher à Tunis avec Plany.tn. Dès 65DT/jour, profitez des meilleures offres de location de voiture à ${villesCentreVille.map((v) => v.nom).join(', ')}.`
  )

  return (
    <Layout strict={false}>
      <Seo
        title="Location de Voiture Pas Cher à Tunis - Plany.tn"
        description={description}
        canonical="https://plany.tn/location-voiture-pas-cher-a-tunis"
      />
      <Container maxWidth="lg">
        {/* Section 1 : Titre et Introduction */}
        <Box sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Location de Voiture en Tunisie à partir de 79 DT/jour
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#34495e' }}>
            Explorez la Tunisie en toute liberté avec Plany
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 3, mb: 5 }}>
            Que vous soyez en voyage d&apos;affaires ou en vacances, Plany vous propose des offres de location de voitures adaptées à tous les budgets. Profitez de tarifs imbattables et d&apos;un service de qualité pour découvrir la Tunisie en toute sérénité.
          </Typography>
          <div className="home custom-searsh">
            <div className="home-search">
              <SearchForm />
            </div>

          </div>

        </Box>

        {/* Section 2 : Pourquoi choisir Plany ? */}
        <Box sx={{ mt: 8, mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Pourquoi choisir Plany pour votre location de voiture ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
            Plany est le leader de la location de voitures en Tunisie, offrant des services fiables et abordables. Voici pourquoi nous sommes le meilleur choix :
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {/* Carte 1 : Large choix de véhicules */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: '#34495e' }}>
                    🚗 Large choix de véhicules
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
                    Nous proposons une gamme variée de véhicules, des citadines économiques aux SUV spacieux, adaptés à tous vos besoins.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Carte 2 : Prix compétitifs */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: '#34495e' }}>
                    💰 Prix compétitifs
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
                    Avec des tarifs à partir de 79 DT/jour, nous offrons les meilleurs prix du marché sans frais cachés.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Carte 3 : Réservation facile */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: '#34495e' }}>
                    ⏱️ Réservation facile
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
                    Réservez en quelques clics et recevez une confirmation immédiate. Notre équipe est disponible 24/7 pour vous assister.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Section 3 : À propos de Plany */}
        <Box sx={{ mt: 8, mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            À propos de Plany
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
            Plany est une agence de location de voitures en Tunisie, offrant des services de qualité depuis plusieurs années. Nous fournissons à nos clients un service simple, efficace et rapide pour la location de voitures aux aéroports de la Tunisie ainsi que dans toutes les villes touristiques du pays.
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
            Vous pouvez nous retrouver facilement à l’aéroport de Tunis Carthage, l’aéroport Enfidha, l’aéroport de Monastir et l’aéroport International Djerba Midoun.
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
            Profitez de votre voiture à Tunis, Hammamet ou Djerba. Plany est votre partenaire de route, qui vous offre un service de location de voitures en Tunisie loin de tous les tracas imprévus.
          </Typography>
        </Box>
        {/* Section 4 : Explorez les Villes Tunisiennes */}
        <Box sx={{ mt: 8, mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Explorez les Villes Tunisiennes
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
            Découvrez nos offres de location de voitures dans les principales villes de Tunisie. Profitez de tarifs compétitifs et d&apos;un service de qualité pour explorer ces destinations en toute liberté.
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {villesCentreVille.map((ville) => {
              // Définir l'image en fonction de la ville
              let imageUrl = ''
              switch (ville.nom) {
                case 'Tunis':
                  imageUrl = '/location-voiture-tunis-medina.webp'
                  break
                case 'Nabeul':
                  imageUrl = '/location-voiture-nabeul-plages.webp'
                  break
                case 'Sousse':
                  imageUrl = '/location-voiture-sousse-unesco.webp'
                  break
                case 'Monastir':
                  imageUrl = '/location-voiture-monastir-ribat.webp'
                  break
                case 'Mahdia':
                  imageUrl = '/location-voiture-mahdia-plages.webp'
                  break
                default:
                  imageUrl = '/default-image.webp' // Image par défaut si aucune correspondance
              }

              return (
                <Grid item xs={12} md={6} lg={4} key={ville.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', boxShadow: 3 }}>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        height="140"
                        image={imageUrl} // Utilisation de l'URL dynamique
                        alt={ville.nom}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="div">
                          {ville.nom}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {ville.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Link
                        href={`https://plany.tn/search?pickupLocation=${ville.id}`}
                        target="_blank"
                        rel="noopener"
                        sx={{
                          color: '#1976d2',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Louer une voiture à
                        {' '}
                        {ville.nom}
                      </Link>
                    </Box>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
        {/* Section 5 : Location de Voiture dans les Aéroports */}
        <Box sx={{ mt: 8, mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Location de Voiture dans les Aéroports
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
            Arrivez à destination et prenez le volant dès votre arrivée. Nous proposons des services de location de voitures dans les principaux aéroports de Tunisie.
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {aeroports.map((aeroport) => {
      // Définir l'image en fonction de l'aéroport
      let imageUrl = ''
      switch (aeroport.nom) {
        case 'Aéroport International de Tunis-Carthage':
          imageUrl = '/louer-une-voiture-a-aeroport-tunis-carthage.webp'
          break
        case 'Aéroport International de Monastir Habib-Bourguiba':
          imageUrl = '/location-voiture-aeroport-monastir.webp'
          break
        case 'Aéroport International de Djerba-Zarzis':
          imageUrl = '/location-voiture-aeroport-djerba.webp'
          break
        case 'Aéroport International de Sfax':
          imageUrl = '/location-voiture-aeroport-sfax.webp'
          break
        case 'Aéroport International d\'Enfidha-Hammamet':
          imageUrl = '/location-voiture-aeroport-enfidha.webp'
          break
        default:
          imageUrl = '/default-image.webp' // Image par défaut si aucune correspondance
      }

      return (
        <Grid item xs={12} md={6} lg={4} key={aeroport.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', boxShadow: 3 }}>
            <CardActionArea>
              <CardMedia
                component="img"
                height="140"
                image={imageUrl} // Utilisation de l'URL dynamique
                alt={aeroport.nom}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {aeroport.nom}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {aeroport.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Link
                href={`https://plany.tn/search?pickupLocation=${aeroport.id}`}
                target="_blank"
                rel="noopener"
                sx={{
                  color: '#1976d2',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Louer une voiture à
                {' '}
                {aeroport.nom}
              </Link>
            </Box>
          </Card>
        </Grid>
      )
    })}
          </Grid>
        </Box>

        {/* Section 6 : FAQ */}
        <Box sx={{ mt: 8, mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Foire aux Questions (FAQ)
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Comment réserver une voiture ?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                Vous pouvez réserver une voiture en ligne via notre site web. Après votre réservation, une agence partenaire vous contactera pour confirmer votre réservation.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Quels documents sont nécessaires pour louer une voiture ?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                Vous aurez besoin d&apos;un permis de conduire valide, d&apos;une pièce d&apos;identité et de la caution.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Puis-je louer une voiture sans carte de crédit ?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                Oui, la carte de crédit n&apos;est pas obligatoire. Vous pouvez payer en espèces directement auprès de l&apos;agence partenaire.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>

      <Footer />
    </Layout>
  )
}

export default LocationVoitureTunisPasCher
