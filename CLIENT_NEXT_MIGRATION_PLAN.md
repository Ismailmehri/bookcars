# Plan de refonte frontend React \u279c Next.js (client)

## 1. Initialisation du projet Next.js
**Objectif**: Cr\u00e9er une nouvelle application Next.js dans `client` avec TypeScript, ESLint, Prettier et base CSS compatible Plany.

**Sous-t\u00e2ches**
- G\u00e9n\u00e9rer l'app : `npx create-next-app@latest client --typescript --eslint --app --src-dir --import-alias @/*`.
- Supprimer les exemples par d\u00e9faut, conserver la structure `app/`.
- Ajouter Prettier et config partag\u00e9e (option `-no-semi` pour rester align\u00e9 avec les r\u00e8gles actuelles).
- Installer d\u00e9pendances UI identiques (MUI, Leaflet, react-helmet rempla\u00e7\u00e9 par `next/head`, etc.).
- Activer les polices et assets existants dans `public/`.

**Commandes**
```bash
npx create-next-app@latest client --typescript --eslint --app --src-dir --import-alias @/*
cd client
npm install @mui/material @emotion/react @emotion/styled leaflet react-leaflet
npm install @mui/icons-material react-hook-form react-query classnames
npm install next-sitemap next-seo
npm install -D prettier eslint-config-prettier eslint-plugin-testing-library jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest
```

**Configs cl\u00e9s**
- `package.json` scripts :
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "format": "prettier --check .",
    "format:write": "prettier --write ."
  }
}
```
- `.eslintrc.json` (extrait) :
```json
{
  "extends": ["next/core-web-vitals", "eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "semi": ["error", "never"],
    "react/function-component-definition": ["error", {"namedComponents": "arrow-function"}],
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```
- `.prettierrc` :
```json
{"singleQuote": true, "semi": false, "trailingComma": "all"}
```

**R\u00e9sultat attendu**
- Projet `client` initialis\u00e9 en Next.js + TS, conforme ESLint/Prettier, scripts npm disponibles.

---

## 2. Structure du dossier `client`
**Objectif**: Organiser l'app Next.js en dossiers clairs align\u00e9s sur l'existant.

**Structure recommand\u00e9e**
```
client
├── public
│   ├── icons / images copi\u00e9s de frontend/public
│   └── sitemap.xml (g\u00e9n\u00e9r\u00e9), robots.txt
├── src
│   ├── app
│   │   ├── layout.tsx
│   │   ├── page.tsx (home)
│   │   ├── search
│   │   │   └── page.tsx
│   │   ├── bookings
│   │   │   └── page.tsx
│   │   ├── booking
│   │   │   └── [id]
│   │   │       └── page.tsx
│   │   ├── settings
│   │   ├── auth (signin, signup, activate, reset-password, change-password)
│   │   ├── info (about, contact, privacy, tos)
│   │   ├── locations
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx (pages LocationA*)
│   │   ├── suppliers
│   │   ├── checkout
│   │   │   ├── page.tsx
│   │   │   └── session/page.tsx
│   │   └── not-found.tsx
│   ├── components
│   ├── styles (CSS modules / global.css)
│   ├── services (calls REST conserv\u00e9s)
│   ├── hooks
│   ├── lib (helpers, seo utils)
│   ├── types (re-export des packages partag\u00e9s)
│   └── tests
├── jest.config.js
├── next.config.js
├── next-sitemap.config.js
├── tsconfig.json
└── package.json
```

**R\u00e9sultat attendu**
- Hi\u00e9rarchie claire pour pages, composants, styles, tests, SEO.

---

## 3. Migration page par page
**Objectif**: Reproduire les pages actuelles de `frontend/src/pages` dans `client/src/app` en conservant design et routes.

**Strat\u00e9gie g\u00e9n\u00e9rale**
- Utiliser l'`app router` de Next.js avec `generateMetadata` pour SEO dynamique.
- Privil\u00e9gier `fetch`/services dans `getStaticProps`/`generateStaticParams` (SSG/ISR) pour pages publiques, `useEffect` client seulement pour interactions.
- Conserver les CSS existants : importer les feuilles globales dans `src/app/globals.css` ou convertir en modules.

**Mapping principal**
- `Home.tsx` -> `src/app/page.tsx` (SSG avec revalidation, structured data via `<Script type="application/ld+json">`).
- `Search.tsx` -> `src/app/search/page.tsx` (ISR, params de requ\u00eate via `searchParams`).
- `Booking.tsx`, `Checkout.tsx`, `CheckoutSession.tsx` -> routes dynamiques `booking/[id]`, `checkout/page.tsx`, `checkout/session/page.tsx`.
- `Bookings.tsx`, `Notifications.tsx`, `Settings.tsx` -> pages prot\u00e9g\u00e9es (middleware pour auth, rendering `force-dynamic`).
- `SignIn.tsx`, `SignUp.tsx`, `Activate.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `ChangePassword.tsx` -> `app/auth/*` avec formulaires identiques.
- `Locations.tsx` + toutes les `LocationA*.tsx` -> route dynamique `[slug]` avec data statique `locationData_SEO.ts` pour `generateStaticParams` + `generateMetadata`.
- `Suppliers.tsx`, `Info.tsx`, `About.tsx`, `Contact.tsx`, `ToS.tsx`, `Privacy.tsx`, `Review.tsx` -> pages statiques (SSG) + meta.
- `Error.tsx`, `NoMatch.tsx` -> `not-found.tsx` + gestion erreurs.

**Exemple Migration Home**
- React actuel : `frontend/src/pages/Home.tsx` utilise `Helmet` et `Seo` personnalis\u00e9.
- Next.js :
```tsx
// src/app/page.tsx
import { Metadata } from 'next'
import Script from 'next/script'
import HomeView from '@/components/HomeView'
import { buildDescription } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Location de voitures en Tunisie – R\u00e9servez en ligne | Plany.tn',
  description: buildDescription('Plany.tn : ...'),
  openGraph: { url: 'https://plany.tn/', images: ['/home-image.png'] },
}

const structuredData = { /* m\u00eame contenu que structuredData dans Home.tsx */ }

const Page = async () => {
  const suppliers = await getSuppliers()
  const countries = await getCountries()
  return (
    <>
      <Script type="application/ld+json" id="home-jsonld">
        {JSON.stringify(structuredData)}
      </Script>
      <HomeView suppliers={suppliers} countries={countries} />
    </>
  )
}

export default Page
```
- Diff SEO : `metadata` + JSON-LD rendus c\u00f4t\u00e9 serveur \u2192 indexation am\u00e9lior\u00e9e.
- Styles : importer `@/styles/home.css` dans `HomeView` ou `app/globals.css`.

**Exemple migration Location dynamic**
```tsx
// src/app/locations/[slug]/page.tsx
import { Metadata } from 'next'
import { getLocationBySlug } from '@/services/location'
import LocationPage from '@/components/LocationPage'

export const revalidate = 86400

export const generateStaticParams = async () =>
  locationData_SEO.map(({ slug }) => ({ slug }))

export const generateMetadata = async ({ params }): Promise<Metadata> => {
  const page = locationData_SEO.find((l) => l.slug === params.slug)
  return {
    title: page?.title,
    description: page?.description,
    alternates: { canonical: `https://plany.tn/${params.slug}` },
  }
}

const Page = async ({ params }) => {
  const location = await getLocationBySlug(params.slug)
  return <LocationPage location={location} />
}

export default Page
```

**R\u00e9sultat attendu**
- Toutes les pages reproduites, rendering c\u00f4t\u00e9 serveur pour SEO, routes identiques (y compris query params).

---

## 4. Composants partag\u00e9s
**Objectif**: Factoriser et r\u00e9utiliser les composants existants avec API Next.js.

**Sous-t\u00e2ches**
- Copier `frontend/src/components` vers `client/src/components` en adaptant :
  - Remplacer `react-router-dom` par `next/link` et `useRouter` (ou `redirect`).
  - Remplacer `Helmet` par `next/head` ou `metadata`.
  - Encapsuler les images via `next/image` pour optimisation.
- Ajouter `providers` pour React Query / context dans `src/app/layout.tsx`.

**Exemple Link/Image**
```tsx
import Link from 'next/link'
import Image from 'next/image'

<Link href="/search?pickupLocation=tunis">Voir les offres</Link>
<Image src="/img/logo.png" alt="Plany" width={120} height={32} priority />
```

**R\u00e9sultat attendu**
- Composants compatibles Next.js, lazy loading conserv\u00e9 (React.lazy ou dynamic import), performances am\u00e9lior\u00e9es.

---

## 5. SEO : meta tags et g\u00e9n\u00e9ration
**Objectif**: G\u00e9n\u00e9rer des meta dynamiques, sitemap et robots.txt.

**Sous-t\u00e2ches**
- Utiliser `generateMetadata` par page (app router) pour titre/description/OG/Twitter.
- Ajouter `next-sitemap` :
```js
// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://plany.tn',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  transform: async (config, path) => ({
    loc: path,
    changefreq: path.startsWith('/locations') ? 'weekly' : 'daily',
    priority: path === '/' ? 1.0 : 0.7,
    lastmod: new Date().toISOString(),
  }),
}
```
- Ajouter `robots.txt` automatique via `next-sitemap` ou `app/robots.ts`.
- Ajouter `app/sitemap.ts` pour routes dynamiques (ISR).
- Utiliser `<Script type="application/ld+json">` pour JSON-LD.

**R\u00e9sultat attendu**
- Pages statiques indexables, sitemap/robots livr\u00e9s, balises OG/Twitter/JSON-LD disponibles c\u00f4t\u00e9 serveur.

---

## 6. Tests unitaires et d'int\u00e9gration
**Objectif**: Couvrir composants/pages avec Jest + React Testing Library (\u2265 80% des fichiers modifi\u00e9s).

**Sous-t\u00e2ches**
- Config Jest :
```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
}
```
- `src/tests/setupTests.ts` :
```ts
import '@testing-library/jest-dom'
```
- Test composant exemple :
```tsx
import { render, screen } from '@testing-library/react'
import HomeHero from '@/components/HomeHero'

test('affiche le CTA principal', () => {
  render(<HomeHero />)
  expect(screen.getByRole('button', { name: /rechercher/i })).toBeInTheDocument()
})
```
- Test page Next.js avec `next/router` mock\u00e9 :
```tsx
import { render, screen } from '@testing-library/react'
import SearchPage from '@/app/search/page'

test('affiche la liste des voitures', async () => {
  render(await SearchPage({ searchParams: { pickupLocation: 'tunis' } }))
  expect(screen.getByText(/voitures disponibles/i)).toBeInTheDocument()
})
```

**R\u00e9sultat attendu**
- Suite de tests runnable via `npm test`, couverture \u2265 80% sur fichiers modifi\u00e9s.

---

## 7. D\u00e9ploiement
**Objectif**: Int\u00e9grer le dossier `client` au pipeline et d\u00e9ployer sur l'infra actuelle ou Vercel.

**Sous-t\u00e2ches**
- Ajouter workflow GitHub Actions :
```yaml
- uses: actions/setup-node@v4
  with: { node-version: 20 }
- run: npm ci
  working-directory: client
- run: npm run lint && npm test && npm run build
  working-directory: client
```
- Adapter `docker-compose` si auto-h\u00e9berg\u00e9 : stage `client` servi par `next start` derri\u00e8re Nginx.
- Vercel : connecter repo, d\u00e9finir `root=client`, build command `npm run build`, output `.next`.

**R\u00e9sultat attendu**
- CI v\u00e9rifie lint/tests/build, d\u00e9ploiement automatis\u00e9.

---

## 8. Checklist SEO & qualit\u00e9
**Objectif**: Garantir SEO, performances et qualit\u00e9.

**Checklist**
- Meta title/description uniques par page (v\u00e9rifier via `view-source`).
- H1 unique, hi\u00e9rarchie Hn respect\u00e9e.
- Canonical, OG, Twitter, JSON-LD pr\u00e9sents.
- Sitemap/robots.txt g\u00e9n\u00e9r\u00e9s.
- Temps TTFB et LCP \u2264 objectifs Lighthouse \u2265 90.
- Images optimis\u00e9es `next/image`, lazy loading carrousels.
- Accessibilit\u00e9 : contrastes, aria-labels sur inputs/boutons, navigation clavier.
- Responsive desktop/mobile (v\u00e9rification manuelle + Playwright optionnel).
- Loading/empty/error states pour chaque data fetch.
- Aucun warning ESLint/Prettier; TS strict OK.

**R\u00e9sultat attendu**
- Score Lighthouse \u2265 90 SEO/perf/accessibility/best practices.

---

## 9. Commandes & scripts
**Objectif**: Centraliser les scripts d'usage.

```
npm run dev        # next dev (client)
npm run build      # next build
npm run start      # next start
npm run lint       # ESLint
npm run test       # Jest + RTL
npm run format     # Prettier check
npm run format:write
npm run sitemap    # next-sitemap (ajouter script "sitemap": "next-sitemap")
```

**R\u00e9sultat attendu**
- Scripts disponibles dans `client/package.json`.

---

## 10. Estimation de temps & priorit\u00e9s
**Objectif**: Planifier la livraison.

- J1-J2 : initialisation, setup ESLint/Prettier/TS, migration Layout, Header/Footer, Home (SSG).
- J3 : Search + Listing/filters (ISR) avec states loading/empty/error.
- J4 : Auth pages + formulaires, Notifications/Settings (client components).
- J5 : Pages Checkout/Bookings/Booking (dynamic), middleware auth.
- J6 : Pages statiques (About/Contact/ToS/Privacy/Review) + locations dynamiques.
- J7 : SEO final (metadata, sitemap, robots), tests unitaires/integ \u2265 80% coverage, Lighthouse + responsive check, documentation.

**R\u00e9sultat attendu**
- Refonte livr\u00e9e en 7 jours ouvr\u00e9s avec couverture de tests et SEO optimis\u00e9.

---

## Validation visuelle
- Comparer pages `frontend` vs `client` via environnements parall\u00e8les (Vite dev vs `next dev`).
- Utiliser Playwright ou Cypress pour des screenshots diff (desktop/mobile).
- V\u00e9rifier carrousels, modales, formulaires (hover/focus) et coh\u00e9rence des tailles/marges (charte Plany).

