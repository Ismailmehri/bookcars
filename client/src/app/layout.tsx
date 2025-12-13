import type { Metadata } from 'next'
import './globals.css'

type RootLayoutProps = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'BookCars | Migration en cours',
  description: 'Nouvelle application Next.js en cours de migration depuis le frontend React.',
  openGraph: {
    title: 'BookCars | Migration en cours',
    description: 'Migration Next.js avec SEO amélioré.',
    url: 'https://plany.tn',
    siteName: 'BookCars',
    type: 'website'
  }
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="fr">
    <body>{children}</body>
  </html>
)

export default RootLayout
