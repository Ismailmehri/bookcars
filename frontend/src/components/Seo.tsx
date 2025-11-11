import React from 'react'
import { Helmet } from 'react-helmet'

interface SeoProps {
  title?: string
  description?: string
  canonical?: string
  robots?: string
  keywords?: string | string[]
}

const Seo = ({ title, description, canonical, robots, keywords }: SeoProps) => {
  const keywordContent = Array.isArray(keywords) ? keywords.join(', ') : keywords

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {robots && <meta name="robots" content={robots} />}
      {keywordContent && <meta name="keywords" content={keywordContent} />}
    </Helmet>
  )
}

export default Seo
