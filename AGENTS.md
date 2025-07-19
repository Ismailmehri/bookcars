# BookCars Agent Instructions

This repository contains a full-stack car rental platform built with TypeScript.  
It is organized into multiple applications and packages:

- **api/** – Node.js + Express REST API with MongoDB
- **backend/** – Admin dashboard built with React and Vite
- **frontend/** – Public booking website built with React and Vite
- **mobile/** – React Native mobile app
- **packages/** – Shared TypeScript packages (`bookcars-helper`, `bookcars-types`, `disable-react-devtools`)
- **server/** – Simple Express server for CDN

## Development guidelines

### General
- Use **TypeScript** in all projects. Avoid the `any` type when possible.
- Follow the existing ESLint configurations. The codebase extends Airbnb rules and disables semicolons. Run `npm run lint` before committing (see each package.json).
- Use `npm` as the package manager.
- Keep functions small and well-documented with comments and JSDoc where applicable.
- Environment variables are defined in `.env` files; reference `api/src/config/env.config.ts` for available keys.

### Directory conventions
- Source code lives under the `src` folder of each application.
- Shared types reside in `packages/bookcars-types` and utilities in `packages/bookcars-helper`.
- Import shared modules using the alias prefixes defined in `tsconfig.json` (e.g. `:bookcars-types`).

### Building
- Each project has its own `package.json` with scripts. Typical commands:
  - `npm run build` – transpiles TypeScript and bundles with Vite or tsc.
  - `npm run dev` – starts the development server.
  - `npm run lint` – runs ESLint.
- The API supports tests with Jest. Use `npm test` inside the `api` directory to run them.
- Docker builds are defined for each service (see `docker-compose.yml`).

### Coding style highlights
- No semicolons – enforced via ESLint.
- Brace style: "1tbs".
- Prefer arrow functions for React components (`react/function-component-definition` rule).
- Keep `curly` braces for all control statements.
- Logging is allowed (`no-console` is disabled). Use `winston` in the API where possible.

### Pull requests
- Keep commits focused and descriptive. Example: `feat(api): add booking status filter`.
- Update or add tests for API changes.
- Run `npm run lint` and `npm test` (API) before submitting a PR.

### Deployment
- Deployment scripts are located in `__scripts/`. They assume a Linux environment with systemd and MongoDB.
- See `docker-compose.yml` for containerized deployment using Traefik, MongoDB, WordPress and Nginx CDN.

### Documentation
- The main README lists features and links to the project Wiki. When modifying core behaviour, update the Wiki accordingly.
- All code is MIT licensed (see `LICENSE`).

