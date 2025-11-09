import type { ComponentType, LazyExoticComponent } from 'react'
import { lazy } from 'react'

type LocationPageImporter = () => Promise<{ default: ComponentType }>

export interface LocationPageConfig {
  path: string
  importer: LocationPageImporter
}

export interface LazyLocationPage {
  path: string
  Component: LazyExoticComponent<ComponentType>
}

export const locationPageConfigs: readonly LocationPageConfig[] = Object.freeze([
  {
    path: '/location-voiture-pas-cher-a-tunis',
    importer: () => import('@/pages/LocationATunis'),
  },
  {
    path: '/location-voiture-pas-cher-a-sousse',
    importer: () => import('@/pages/LocationASousse'),
  },
  {
    path: '/location-voiture-pas-cher-a-sfax',
    importer: () => import('@/pages/LocationASfax'),
  },
  {
    path: '/location-voiture-pas-cher-a-nabeul',
    importer: () => import('@/pages/LocationANabeul'),
  },
  {
    path: '/location-voiture-pas-cher-a-monastir',
    importer: () => import('@/pages/LocationAMonastir'),
  },
  {
    path: '/location-voiture-pas-cher-a-mahdia',
    importer: () => import('@/pages/LocationAMahdia'),
  },
  {
    path: '/location-voiture-pas-cher-a-kairouan',
    importer: () => import('@/pages/LocationAKairouan'),
  },
  {
    path: '/location-voiture-pas-cher-a-djerba',
    importer: () => import('@/pages/LocationADjerba'),
  },
  {
    path: '/location-voiture-pas-cher-a-ariana',
    importer: () => import('@/pages/LocationAAriana'),
  },
  {
    path: '/location-voiture-pas-cher-a-ben-arous',
    importer: () => import('@/pages/LocationABenArous'),
  },
  {
    path: '/location-voiture-pas-cher-a-bizerte',
    importer: () => import('@/pages/LocationABizerte'),
  },
  {
    path: '/location-voiture-pas-cher-a-gabes',
    importer: () => import('@/pages/LocationAGabes'),
  },
  {
    path: '/location-voiture-pas-cher-a-gafsa',
    importer: () => import('@/pages/LocationAGafsa'),
  },
  {
    path: '/location-voiture-pas-cher-a-tozeur',
    importer: () => import('@/pages/LocationATozeur'),
  },
  {
    path: '/location-voiture-pas-cher-a-kasserine',
    importer: () => import('@/pages/LocationAKasserine'),
  },
  {
    path: '/location-voiture-pas-cher-a-sidi-bouzid',
    importer: () => import('@/pages/LocationASidiBouzid'),
  },
  {
    path: '/location-voiture-pas-cher-a-zaghouan',
    importer: () => import('@/pages/LocationAZaghouan'),
  },
  {
    path: '/location-voiture-pas-cher-a-medenine',
    importer: () => import('@/pages/LocationAMedenine'),
  },
  {
    path: '/location-voiture-pas-cher-a-jerba-midoun',
    importer: () => import('@/pages/LocationAJerbaMidoun'),
  },
  {
    path: '/location-voiture-pas-cher-a-hammamet',
    importer: () => import('@/pages/LocationAHammamet'),
  },
])

export const lazyLocationPages: readonly LazyLocationPage[] = Object.freeze(
  locationPageConfigs.map(({
    path,
    importer,
  }) => ({
    path,
    Component: lazy(importer),
  })),
)
