# Suivi de migration Next.js (`client/`)

## Ce qui a été fait
- Initialisation manuelle du squelette Next.js (App Router) avec TypeScript strict et alias `@/*`.
- Configuration ESLint (core-web-vitals, règles Plany : pas de point-virgule, `curly` systématique, composants en arrow functions).
- Configuration Jest + Testing Library (preset ts-jest, jsdom, collecte de couverture) et ajout d'un premier test pour la page d'accueil.
- Mise en place des fichiers fondamentaux :
  - `next.config.js` (strict mode, domaines d'images, headers de sécurité basiques)
  - `tsconfig.json`, `next-env.d.ts`, `jest.config.ts`, `jest.setup.ts`
  - Structure App Router : `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/migration-plan/page.tsx`, `src/app/globals.css`
- Ajout d'un début de contenu SEO (métadonnées `metadata` sur les pages d'accueil et plan de migration).

## Ce qu'il reste à faire
- Installer les dépendances npm (échec actuel : erreur 403 depuis le registry npm). Relancer `npm install` quand le réseau l'autorisera afin d'obtenir `node_modules` et le `package-lock.json`.
- Brancher les styles Plany existants : importer les feuilles de style/global theme du frontend actuel pour reproduire exactement le design (couleurs, marges, typo) et vérifier le responsive.
- Migrer les layouts communs (Header, Footer, providers de thème/ i18n / auth) et définir la navigation globale.
- Migrer les pages fonctionnelles (accueil réelle, catalogue, détail voiture, authentification, réservations, profil, etc.) avec SSG/ISR + meta tags dynamiques.
- Ajouter sitemap.xml, robots.txt, Open Graph/structured data page par page.
- Implémenter les états loading/empty/error sur chaque page et composant dynamique (filtres, formulaires, listes), avec tests correspondants.
- Atteindre ≥80 % de couverture sur les fichiers migrés ; étendre la suite de tests (composants, hooks, pages) avec React Testing Library.
- Mettre en place les optimisations performances (images Next optimisées, lazy loading, éventuels cache headers, analyse du bundle) et vérifier l'accessibilité (labels, navigation clavier, contrastes).

## Commandes à relancer après résolution du problème réseau
```bash
cd client
npm install
npm run lint
npm test
npm run dev
```

## Validation visuelle et fonctionnelle à prévoir
- Comparer chaque page migrée avec la version actuelle (desktop + mobile) en utilisant les mêmes données et interactions.
- Vérifier l'absence d'avertissements ESLint/TypeScript et la présence des états de chargement/erreur/vides.
- Exécuter Lighthouse (performance + SEO + a11y) et ajuster les meta tags/optimisations au besoin.
