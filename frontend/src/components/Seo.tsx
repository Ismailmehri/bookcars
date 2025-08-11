import React from 'react'
import { Helmet } from 'react-helmet'

interface SeoProps {
  title?: string
  description?: string
  canonical?: string
  robots?: string
}

const Seo = ({ title, description, canonical, robots }: SeoProps) => (
  <Helmet>
    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}
    {canonical && <link rel="canonical" href={canonical} />}
    {robots && <meta name="robots" content={robots} />}
  </Helmet>
)

export default Seo
