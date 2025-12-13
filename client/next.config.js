/**
 * next.config.js
 *
 * Configuration centrale de l'application Next.js en migration.
 * Active le strict mode, prépare l'optimisation des images et laisse place
 * aux futures redirections / headers spécifiques quand les pages seront prêtes.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'plany.tn',
      'localhost',
      // Ajouter ici les domaines externes requis au fur et à mesure
    ],
  },
  async redirects() {
    return []
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
