import React from 'react'
import { Typography, Container, Box, Grid } from '@mui/material'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'

const About = () => (
  <Layout>
    <Container maxWidth="md">
      {/* Titre principal */}
      <Box my={4}>
        <Typography variant="h3" gutterBottom>
          À Propos de Plany.tn
        </Typography>
        <Typography variant="body1">
          Plany.tn est une plateforme innovante dédiée à la mise en relation entre professionnels de la location de voitures et particuliers.
          Nous avons pour mission de simplifier le processus de réservation tout en offrant une expérience transparente et sécurisée pour les utilisateurs.
        </Typography>
      </Box>

      {/* Notre mission */}
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Notre Mission
        </Typography>
        <Typography variant="body2" paragraph>
          Chez Plany.tn, nous croyons que louer une voiture ne devrait pas être une tâche compliquée. Nous facilitons les échanges
          entre professionnels loueurs de voitures et particuliers grâce à une plateforme intuitive qui met l'accent sur la rapidité,
          la fiabilité et la simplicité.
        </Typography>
        <Typography variant="body2" paragraph>
          Nous nous engageons à fournir une solution pratique pour les professionnels souhaitant élargir leur clientèle et pour
          les utilisateurs à la recherche de véhicules de qualité.
        </Typography>
      </Box>

      {/* Nos Valeurs */}
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Nos Valeurs
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Simplicité</Typography>
            <Typography variant="body2">
              Une interface intuitive pour permettre à tous de trouver ou proposer des véhicules facilement.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Transparence</Typography>
            <Typography variant="body2">
              Une communication claire entre les loueurs et les locataires pour une expérience de confiance.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Innovation</Typography>
            <Typography variant="body2">
              Nous repoussons constamment les limites pour offrir des fonctionnalités modernes et efficaces.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Pourquoi nous choisir */}
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Pourquoi Choisir Plany.tn ?
        </Typography>
        <Typography variant="body2" paragraph>
          Que vous soyez un professionnel cherchant à optimiser la gestion de vos véhicules ou un particulier à la recherche
          d’une solution pratique pour vos déplacements, Plany.tn est conçu pour répondre à vos besoins. Voici ce qui nous distingue :
        </Typography>
        <Typography variant="body2" component="ul">
          <li>Un large choix de véhicules disponibles.</li>
          <li>Un processus de réservation simple et rapide.</li>
          <li>Une communication directe entre loueurs et locataires.</li>
          <li>Un accès gratuit pour les utilisateurs de la plateforme.</li>
        </Typography>
      </Box>

      {/* Équipe */}
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Rencontrez Notre Équipe
        </Typography>
        <Typography variant="body2">
          Notre équipe est composée de passionnés de technologie et de mobilité. Nous travaillons chaque jour pour améliorer
          l'expérience utilisateur et développer de nouvelles fonctionnalités qui répondent aux attentes des professionnels et des particuliers.
        </Typography>
      </Box>

      {/* Conclusion */}
      <Box my={4}>
        <Typography variant="body1" paragraph>
          Chez Plany.tn, notre objectif est de rendre chaque étape de la location de voitures plus fluide et plus agréable.
          Merci de faire partie de notre communauté !
        </Typography>
      </Box>
    </Container>
    <Footer />
  </Layout>
  )

export default About
