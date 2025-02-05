import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'

import '@/assets/css/contact.css'

const Contact = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()

  const onLoad = (_user?: bookcarsTypes.User) => {
    setUser(_user)
  }

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Contactez-Nous - Plany.tn</title>
        <meta
          name="description"
          content="Contactez-nous pour toute question ou demande concernant la location de voitures en Tunisie. Notre équipe est là pour vous aider !"
        />
        <link rel="canonical" href="https://plany.tn/contact" />

        {/* Balises Open Graph pour les réseaux sociaux */}
        <meta property="og:title" content="Contactez-Nous - Plany.tn" />
        <meta
          property="og:description"
          content="Contactez-nous pour toute question ou demande concernant la location de voitures en Tunisie. Notre équipe est là pour vous aider !"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plany.tn/contact" />
        <meta property="og:image" content="https://plany.tn/contact-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Plany" />

        {/* Balises Twitter Card pour Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Contactez-Nous - Plany.tn" />
        <meta
          name="twitter:description"
          content="Contactez-nous pour toute question ou demande concernant la location de voitures en Tunisie. Notre équipe est là pour vous aider !"
        />
        <meta name="twitter:image" content="https://plany.tn/contact-image.png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />

        {/* Données structurées pour Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Page de Contact - Plany.tn',
            description:
              'Utilisez notre formulaire de contact pour nous envoyer vos questions ou demandes concernant la location de voitures en Tunisie.',
            url: 'https://plany.tn/contact',
          })}
        </script>
      </Helmet>
      <div className="contact">
        <ContactForm user={user} className="form" />
      </div>
      <Footer />
    </Layout>
  )
}

export default Contact
