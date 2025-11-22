import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings as contactFormStrings } from '@/lang/contact-form'
import Loading from '@/components/Loading'
import Info from '@/components/Info'

import '@/assets/css/contact.css'

const Contact = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [loading, setLoading] = useState(true)

  const onLoad = (_user?: bookcarsTypes.User) => {
    setUser(_user)
    setLoading(false)
  }

  const description = buildDescription(
    'Contactez-nous pour toute question ou demande concernant la location de voitures en Tunisie. Notre équipe est là pour vous aider !'
  )

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo
        title="Contactez-Nous - Plany.tn"
        description={description}
        canonical="https://plany.tn/contact"
      />
      <Helmet>
        <meta charSet="utf-8" />
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
            contactPoint: [{
              '@type': 'ContactPoint',
              telephone: '+216-21-170-468',
              contactType: 'customer service',
              email: 'contact@plany.tn'
            }],
          })}
        </script>
      </Helmet>
      <div className="contact">
        {loading && (
          <div className="contact-state">
            <Loading text={commonStrings.LOADING} />
          </div>
        )}

        {!loading && !env.RECAPTCHA_ENABLED && (
          <Info
            className="contact-state"
            message={contactFormStrings.RECAPTCHA_DISABLED}
            hideLink
            type="warning"
          />
        )}

        {!loading && env.RECAPTCHA_ENABLED && (
          <ContactForm user={user} className="form" />
        )}
      </div>
      <Footer />
    </Layout>
  )
}

export default Contact
