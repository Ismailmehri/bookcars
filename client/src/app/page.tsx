import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'BookCars | Nouvelle app Next.js',
  description: 'Version Next.js de BookCars en cours de construction avec SEO et performances améliorés.',
  openGraph: {
    title: 'BookCars | Nouvelle app Next.js',
    description: 'Migration vers Next.js pour de meilleures performances et SEO.',
    url: 'https://plany.tn',
    siteName: 'BookCars',
    type: 'website'
  }
}

const HomePage = () => (
  <main className="landing">
    <section className="hero">
      <h1>Migration BookCars vers Next.js</h1>
      <p>
        Le nouveau frontend Next.js est initialisé. Les pages, composants et styles existants seront migrés
        progressivement tout en conservant le design Plany et en améliorant le SEO.
      </p>
      <div className="cta">
        <Link href="/migration-plan">Voir le plan de migration</Link>
      </div>
    </section>
  </main>
)

export default HomePage
