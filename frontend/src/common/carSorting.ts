import * as bookcarsTypes from ':bookcars-types'

export type CarSortOption = 'priceAsc' | 'priceDesc' | 'rating'

const getDailyPrice = (car: bookcarsTypes.Car): number => {
  if (typeof car.discountedDailyPrice === 'number' && car.discountedDailyPrice > 0) {
    return car.discountedDailyPrice
  }

  if (typeof car.dailyPrice === 'number') {
    return car.dailyPrice
  }

  return 0
}

const getRatingScore = (car: bookcarsTypes.Car): number => {
  if (typeof car.rating === 'number') {
    return car.rating
  }

  if (car.supplier && typeof car.supplier === 'object' && 'score' in car.supplier) {
    const supplierScore = typeof car.supplier.score === 'number' ? car.supplier.score : 0
    return Math.round(((supplierScore / 100) * 5) * 10) / 10
  }

  return 0
}

export const sortCars = (cars: bookcarsTypes.Car[], sortBy: CarSortOption): bookcarsTypes.Car[] => {
  const normalizedSort: CarSortOption = sortBy ?? 'priceAsc'
  const sorted = [...cars]

  switch (normalizedSort) {
    case 'priceDesc':
      sorted.sort((a, b) => getDailyPrice(b) - getDailyPrice(a))
      break
    case 'rating':
      sorted.sort((a, b) => getRatingScore(b) - getRatingScore(a))
      break
    case 'priceAsc':
    default:
      sorted.sort((a, b) => getDailyPrice(a) - getDailyPrice(b))
      break
  }

  return sorted
}

export const buildSortLabel = (sortBy: CarSortOption): string => {
  switch (sortBy) {
    case 'priceDesc':
      return 'priceDesc'
    case 'rating':
      return 'rating'
    default:
      return 'priceAsc'
  }
}

export const __testing__ = {
  getDailyPrice,
  getRatingScore,
}
