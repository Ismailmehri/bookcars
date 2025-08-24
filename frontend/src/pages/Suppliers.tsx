import React from 'react'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import SupplierList from '@/components/SupplierList'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Liste des Agences de Location de Voiture en Tunisie',
  description:
    'Découvrez la liste des meilleures agences de location de voiture en Tunisie. Comparez les offres et trouvez l’agence qui correspond à vos besoins.',
  url: 'https://plany.tn/suppliers',
}

const Suppliers = () => {
  const onLoad = () => {}

  const description = buildDescription(
    'Découvrez la liste des meilleures agences de location de voiture en Tunisie. Comparez les offres et trouvez l\'agence qui correspond à vos besoins.'
  )

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo
        title="Liste des Agences de Location de Voiture en Tunisie - Plany.tn"
        description={description}
        canonical="https://plany.tn/suppliers"
      />
      <Helmet>
        <meta charSet="utf-8" />
        <meta
          property="og:title"
          content="Liste des Agences de Location de Voiture en Tunisie - Plany.tn"
        />
        <meta
          property="og:description"
          content="Découvrez la liste des meilleures agences de location de voiture en Tunisie. Comparez les offres et trouvez l'agence qui correspond à vos besoins."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plany.tn/suppliers" />
        <meta property="og:image" content="https://plany.tn/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Plany" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Liste des Agences de Location de Voiture en Tunisie - Plany.tn"
        />
        <meta
          name="twitter:description"
          content="Découvrez la liste des meilleures agences de location de voiture en Tunisie. Comparez les offres et trouvez l'agence qui correspond à vos besoins."
        />
        <meta name="twitter:image" content="https://plany.tn/logo.png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Liste des Agences de Location de Voiture en Tunisie
        </h1>
        <SupplierList />
      </div>
    </Layout>
  )
}

export default Suppliers
