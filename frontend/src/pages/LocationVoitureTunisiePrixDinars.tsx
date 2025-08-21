import React from 'react'
import { Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, List, ListItem } from '@mui/material'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'
import '@/assets/css/home.css'
import SearchForm from '@/components/SearchForm'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'

const LocationVoitureTunisiePrixDinars = () => {
  const description = buildDescription(
    'Location voiture Tunisie prix en dinars : hiver vs été dès 56 TND/j, kilométrage illimité, annulation flexible. Comparez et réservez sur Plany.tn'
  )

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': 'https://plany.tn/location-voiture-tunisie-prix-dinars#article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://plany.tn/location-voiture-tunisie-prix-dinars'
    },
    headline: 'Location voiture en Tunisie : prix en dinars (hiver vs haute saison)',
    description:
      'Comparez les prix de location de voiture en Tunisie en TND : hiver (déc–fév) vs haute saison (juil–août). Modèles populaires, conseils & avantages Plany.tn.',
    image: ['https://plany.tn/static/og/location-voiture-tunisie.jpg'],
    author: {
      '@type': 'Organization',
      name: 'Plany.tn',
      url: 'https://plany.tn'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Plany.tn',
      url: 'https://plany.tn',
      logo: {
        '@type': 'ImageObject',
        url: 'https://plany.tn/static/logo/plany-logo-512.png',
        width: 512,
        height: 512
      }
    },
    datePublished: '2025-08-21',
    dateModified: '2025-08-21'
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quel est le prix moyen d\u2019une location en été en Tunisie ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'En haute saison (juil–août), comptez généralement ~100–120 TND/j pour une citadine économique réservée à l\u2019avance, avec des pics possibles pour les modèles très demandés.'
        }
      },
      {
        '@type': 'Question',
        name: 'Faut-il un permis international pour louer en Tunisie ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Pour un séjour touristique court, un permis national lisible en caractères latins suffit généralement. Le permis international n\u2019est pas systématiquement exigé.'
        }
      },
      {
        '@type': 'Question',
        name: 'Peut-on louer une voiture automatique à Tunis (aéroport Tunis-Carthage) ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Oui, de nombreuses agences proposent des voitures automatiques à Tunis et à l\u2019aéroport TUN. Il est conseillé de réserver tôt en été pour garantir la disponibilité.'
        }
      },
      {
        '@type': 'Question',
        name: 'Quelle est la politique d\u2019annulation avec Plany.tn ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'La majorité des offres affichent une annulation flexible, souvent gratuite jusqu\u2019à 48 h avant la prise en charge. Les conditions exactes figurent sur chaque fiche véhicule.'
        }
      }
    ]
  }

  const offerCatalogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': 'https://plany.tn/location-voiture-tunisie-prix-dinars#catalog',
    name: 'Fourchettes de prix location voiture en Tunisie (TND/jour)',
    url: 'https://plany.tn/location-voiture-tunisie-prix-dinars',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Hiver (déc–fév)',
        itemListElement: [
          { '@type': 'Offer', name: 'Kia Picanto', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '56', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Hyundai i10', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '65', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Suzuki Swift', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '80', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Dacia Sandero', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '75', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Skoda Fabia', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '75', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Peugeot 208', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '80', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Renault Clio 5', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '85', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Volkswagen Polo', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '85', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Volkswagen Virtus', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '90', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Kia Rio', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '85', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Hyundai i20', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '85', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Mahindra KUV100', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '80', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Mahindra XUV300', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '90', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'BYD F3', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '85', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Chery Tiggo 3x', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '85', priceCurrency: 'TND' } }
        ]
      },
      {
        '@type': 'OfferCatalog',
        name: 'Haute saison (juil–août)',
        itemListElement: [
          { '@type': 'Offer', name: 'Kia Picanto', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '75', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Hyundai i10', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '85', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Suzuki Swift', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '90', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Dacia Sandero', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '95', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Skoda Fabia', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '95', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Peugeot 208', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '100', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Renault Clio 5', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '105', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Volkswagen Polo', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '110', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Volkswagen Virtus', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '115', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Kia Rio', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '110', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Hyundai i20', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '110', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Mahindra KUV100', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '105', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Mahindra XUV300', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '120', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'BYD F3', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '110', priceCurrency: 'TND' } },
          { '@type': 'Offer', name: 'Chery Tiggo 3x', priceCurrency: 'TND', priceSpecification: { '@type': 'PriceSpecification', price: '115', priceCurrency: 'TND' } }
        ]
      }
    ]
  }

  return (
    <Layout strict={false}>
      <Seo
        title="Location voiture Tunisie : prix en dinars | Plany.tn"
        description={description}
        canonical="https://plany.tn/location-voiture-tunisie-prix-dinars"
      />
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Location voiture Tunisie prix en dinars
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 3, mb: 5 }}>
            Envie de parcourir la Tunisie en toute liberté ? Plany.tn compare pour vous les offres locales de location voiture pas chère Tunisie en TND, sans frais cachés, que ce soit pour une location voiture aéroport Tunis Carthage ou au centre-ville.
          </Typography>
          <div className="home custom-searsh">
            <div className="home-search">
              <SearchForm />
            </div>
          </div>
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Variation des prix selon la saison
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
            Les prix location voiture Tunisie hiver débutent à ~56 TND/j, tandis que la location voiture juillet août Tunisie voit la demande grimper. Réserver tôt permet de profiter des meilleurs tarifs.
          </Typography>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Prix indicatifs par modèle (TND/jour)
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Modèle (catégorie)</TableCell>
                <TableCell>Hiver (déc\u2013fév)</TableCell>
                <TableCell>Haute saison (juil\u2013août)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Kia Picanto (mini)</TableCell>
                <TableCell>~56 TND/j</TableCell>
                <TableCell>~75 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hyundai i10 (éco)</TableCell>
                <TableCell>~65 TND/j</TableCell>
                <TableCell>~85 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Suzuki Swift (compacte)</TableCell>
                <TableCell>~80 TND/j</TableCell>
                <TableCell>~90 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Dacia Sandero (compacte)</TableCell>
                <TableCell>~75 TND/j</TableCell>
                <TableCell>~95 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Skoda Fabia (compacte)</TableCell>
                <TableCell>~75 TND/j</TableCell>
                <TableCell>~95 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Peugeot 208 (compacte)</TableCell>
                <TableCell>~80 TND/j</TableCell>
                <TableCell>~100 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Renault Clio 5 (compacte)</TableCell>
                <TableCell>~85 TND/j</TableCell>
                <TableCell>~105 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Volkswagen Polo (compacte)</TableCell>
                <TableCell>~85 TND/j</TableCell>
                <TableCell>~110 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Volkswagen Virtus (berline)</TableCell>
                <TableCell>~90 TND/j</TableCell>
                <TableCell>~115 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Kia Rio (berline)</TableCell>
                <TableCell>~85 TND/j</TableCell>
                <TableCell>~110 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hyundai i20 (compacte+)</TableCell>
                <TableCell>~85 TND/j</TableCell>
                <TableCell>~110 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mahindra KUV100 (SUV urbain)</TableCell>
                <TableCell>~80 TND/j</TableCell>
                <TableCell>~105 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mahindra XUV300 (SUV)</TableCell>
                <TableCell>~90 TND/j</TableCell>
                <TableCell>~120 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BYD F3 (berline)</TableCell>
                <TableCell>~85 TND/j</TableCell>
                <TableCell>~110 TND/j</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Chery Tiggo 3x (SUV urbain)</TableCell>
                <TableCell>~85 TND/j</TableCell>
                <TableCell>~115 TND/j</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Les avantages de Plany.tn
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Kilométrage illimité
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            De nombreuses offres incluent le kilométrage illimité location Tunisie pour explorer le pays sans contrainte.
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Annulation flexible
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            Souvent gratuite jusqu\u2019à J-2 selon l\u2019offre, vous gardez le contrôle de votre réservation.
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Caution transparente
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            Les dépôts de garantie sont clairement indiqués. La caution location voiture Tunisie et l\u2019assurance location voiture Tunisie sont visibles pour comparer et choisir une caution faible.
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Large choix de véhicules
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            Boîte manuelle ou voiture automatique Tunisie location, citadines, SUV ou minivans pour votre location voiture touristique Tunisie : Plany.tn propose un catalogue complet avec filtres pratiques.
          </Typography>
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Conseils pour économiser
          </Typography>
          <List sx={{ color: '#7f8c8d', mt: 2 }}>
            <ListItem>Réservez tôt, surtout pour juillet et août</ListItem>
            <ListItem>Comparez les prix entre l\u2019aéroport et le centre-ville</ListItem>
            <ListItem>Évitez les réservations de dernière minute</ListItem>
            <ListItem>Plus la durée est longue, plus le prix par jour baisse</ListItem>
          </List>
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            FAQ
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Quel est le prix moyen d\u2019une location en été en Tunisie ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            En haute saison, comptez généralement 100\u2013120 TND/j pour une citadine économique réservée à l\u2019avance.
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Faut-il un permis international pour louer en Tunisie ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            Un permis national lisible suffit pour un court séjour touristique. Le permis international n\u2019est pas toujours exigé.
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Peut-on louer une voiture automatique à Tunis (aéroport Tunis-Carthage) ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            Oui, de nombreuses agences proposent des voitures automatiques à Tunis et à l\u2019aéroport Tunis-Carthage.
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Quelle est la politique d\u2019annulation avec Plany.tn ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            La plupart des offres offrent une annulation gratuite jusqu\u201948 h avant la prise en charge.
          </Typography>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mt: 4 }}>
            Quelle caution prévoir et comment la réduire ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
            Préparez une caution de 800\u20131200 TND selon le modèle. Choisissez des offres avec assurance complète ou options r\u00E9duisant le d\u00E9p\u00F4t.
          </Typography>
        </Box>

        <Box sx={{ mt: 8, mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Conclusion
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 2 }}>
            Location voiture Tunisie prix en dinars : retenez que les tarifs varient selon la saison, mais Plany.tn garantit transparence et avantages exclusifs.
            Comparez les offres et r\u00E9servez sur Plany.tn.
          </Typography>
        </Box>

      </Container>
      <Footer />
      <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(offerCatalogJsonLd)}</script>
    </Layout>
  )
}

export default LocationVoitureTunisiePrixDinars
