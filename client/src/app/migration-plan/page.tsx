import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Plan de migration Next.js | BookCars',
  description: 'Checklist des étapes de migration du frontend React vers Next.js avec SEO et tests.',
  openGraph: {
    title: 'Plan de migration Next.js | BookCars',
    description: 'Vue d\'ensemble des tâches de migration BookCars vers Next.js.',
    url: 'https://plany.tn/migration-plan',
    siteName: 'BookCars',
    type: 'article'
  }
}

const MigrationPlanPage = () => (
  <main className="landing">
    <section className="hero">
      <h1>Plan de migration Next.js</h1>
      <p>
        Cette page récapitule les prochaines étapes : migration page par page depuis le frontend React existant,
        ajout des meta tags SEO, mise en place des tests et validation visuelle.
      </p>
      <ul>
        <li>Initialisation Next.js + TypeScript</li>
        <li>Migration des layouts communs (Header, Footer, thèmes Plany)</li>
        <li>Pages publiques (accueil, catalogue, détail voiture, auth)</li>
        <li>SEO (sitemap, robots.txt, balises Open Graph, données structurées)</li>
        <li>Tests unitaires et d&apos;intégration (RTL + Jest)</li>
      </ul>
      <div className="cta" style={{ marginTop: '16px' }}>
        <Link href="/">Retour à l&apos;accueil</Link>
      </div>
    </section>
  </main>
)

export default MigrationPlanPage
