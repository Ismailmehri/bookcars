import * as bookcarsTypes from ':bookcars-types'


/**
 * Format a number.
 *
 * @export
 * @param {number} x
 * @param {string} language ISO 639-1 language code
 * @returns {string}
 */
export const formatNumber = (x: number, language: string): string => {
  const parts: string[] = String(x % 1 !== 0 ? x.toFixed(2) : x).split('.')
  const separator = language === 'en' ? ',' : ' '
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return parts.join('.')
}

/**
 * Format a Date number to two digits.
 *
 * @export
 * @param {number} n
 * @returns {string}
 */
export const formatDatePart = (n: number): string => {
  return n > 9 ? String(n) : '0' + n
}

/**
 * Capitalize a string.
 *
 * @export
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Check if a value is a Date.
 *
 * @export
 * @param {?*} [value]
 * @returns {boolean}
 */
export const isDate = (value?: any): boolean => {
  return value instanceof Date && !Number.isNaN(value.valueOf())
}

/**
 * Join two url parts.
 *
 * @param {?string} [part1]
 * @param {?string} [part2]
 * @returns {string}
 */
export const joinURL = (part1?: string, part2?: string) => {
  if (!part1) {
    const msg = '[joinURL] part1 undefined'
    console.log(msg)
    throw new Error(msg)
  }
  if (!part2) {
    part2 = '6754705027ee3d7b476bc591_1736289800096.png'
  }

  if (part1.charAt(part1.length - 1) === '/') {
    part1 = part1.substring(0, part1.length - 1)
  }
  if (part2.charAt(0) === '/') {
    part2 = part2.substring(1)
  }
  return part1 + '/' + part2
}

/**
 * Check if a string is an integer.
 *
 * @param {string} val
 * @returns {boolean}
 */
export const isInteger = (val: string) => {
  return /^\d+$/.test(val)
}

/**
 * Check if a string is a year.
 *
 * @param {string} val
 * @returns {boolean}
 */
export const isYear = (val: string) => {
  return /^\d{2}$/.test(val)
}

/**
 * Check if a string is a CVV.
 *
 * @param {string} val
 * @returns {boolean}
 */
export const isCvv = (val: string) => {
  return /^\d{3,4}$/.test(val)
}

/**
 * Check if two arrays are equal.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export const arrayEqual = (a: any, b: any) => {
  if (a === b) {
    return true
  }
  if (a == null || b == null) {
    return false
  }
  if (a.length !== b.length) {
    return false
  }

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

/**
 * Clone an object or array.
 *
 * @param {*} obj
 * @returns {*}
 */
export const clone = (obj: any) => {
  return Array.isArray(obj) ? Array.from(obj) : Object.assign({}, obj)
}

/**
 * Clone an array.
 *
 * @export
 * @template T
 * @param {T[]} arr
 * @returns {(T[] | undefined | null)}
 */
export const cloneArray = <T>(arr: T[]): T[] | undefined | null => {
  if (typeof arr === 'undefined') {
    return undefined
  }
  if (arr == null) {
    return null
  }
  return [...arr]
}

/**
 * Check if two filters are equal.
 *
 * @param {?(bookcarsTypes.Filter | null)} [a]
 * @param {?(bookcarsTypes.Filter | null)} [b]
 * @returns {boolean}
 */
export const filterEqual = (a?: bookcarsTypes.Filter | null, b?: bookcarsTypes.Filter | null) => {
  if (a === b) {
    return true
  }
  if (a == null || b == null) {
    return false
  }

  if (a.from !== b.from) {
    return false
  }
  if (a.to !== b.to) {
    return false
  }
  if (a.pickupLocation !== b.pickupLocation) {
    return false
  }
  if (a.dropOffLocation !== b.dropOffLocation) {
    return false
  }
  if (a.keyword !== b.keyword) {
    return false
  }

  return true
}

/**
 * Flatten Supplier array.
 *
 * @param {bookcarsTypes.User[]} suppliers
 * @returns {string[]}
 */
export const flattenSuppliers = (suppliers: bookcarsTypes.User[]): string[] =>
  suppliers.map((supplier) => supplier._id ?? '')

/**
 * Get number of days between two dates.
 *
 * @param {?Date} [from]
 * @param {?Date} [to]
 * @returns {number}
 */
export const days = (from?: Date, to?: Date) =>
  (from && to && Math.ceil((to.getTime() - from.getTime()) / (1000 * 3600 * 24))) || 0

/**
 * Format price
 *
 * @param {number} price
 * @param {string} currency
 * @param {string} language ISO 639-1 language code
 * @returns {boolean}
 */
export const formatPrice = (price: number, currency: string, language: string) => {
  const formatedPrice = formatNumber(price, language)

  if (currency === '$') {
    return `$${formatedPrice}`
  }

  return `${formatedPrice} ${currency}`
}

/**
 * Calculate total price.
 *
 * @param {bookcarsTypes.Car} car
 * @param {Date} from
 * @param {Date} to
 * @param {?bookcarsTypes.CarOptions} [options]
 * @returns {number}
 */
export const calculateTotalPrice = (
  car: bookcarsTypes.Car,
  from: Date,
  to: Date,
  options?: bookcarsTypes.CarOptions
): number => {
  // Calculer le nombre total de jours
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day
  const totalDays = Math.ceil((to.getTime() - from.getTime()) / oneDay);
  let totalPrice = 0;

  // Parcourir chaque jour de la réservation
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(from.getTime() + i * oneDay);
    let dailyPrice = car.dailyPrice; // Prix par défaut

    // Vérifier si une période spéciale existe pour ce jour
    if (car.periodicPrices) {
      for (const period of car.periodicPrices) {
        if (!period.startDate || !period.endDate) {
          break;
        }

        const startDate = new Date(period.startDate);
        const endDate = new Date(period.endDate);

        // Vérifier que les dates sont valides et que la date courante est dans l'intervalle
        if (
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime()) &&
          startDate <= currentDate &&
          currentDate <= endDate
        ) {
          dailyPrice = period.dailyPrice ?? 0;
          break; // Utiliser le prix spécial pour cette journée
        }
      }
    }

    totalPrice += dailyPrice; // Ajouter le prix de la journée au total
  }

  if (car.discounts && car.discounts.threshold && car.discounts.percentage && totalDays >= car.discounts.threshold) {
    // Calcul de la remise en pourcentage sur le total
    const discountAmount = totalPrice * (car.discounts.percentage / 100);
    // Soustraction de la remise du prix total
    totalPrice = totalPrice - discountAmount;
  }

  // Ajouter les prix par options si définis
  if (options) {
    if (options.cancellation && car.cancellation > 0) {
      totalPrice += car.cancellation;
    }
    if (options.amendments && car.amendments > 0) {
      totalPrice += car.amendments;
    }
    if (options.theftProtection && car.theftProtection > 0) {
      totalPrice += car.theftProtection * totalDays;
    }
    if (options.collisionDamageWaiver && car.collisionDamageWaiver > 0) {
      totalPrice += car.collisionDamageWaiver * totalDays;
    }
    if (options.fullInsurance && car.fullInsurance > 0) {
      totalPrice += car.fullInsurance * totalDays;
    }
    if (options.additionalDriver && car.additionalDriver > 0) {
      totalPrice += car.additionalDriver * totalDays;
    }
  }

  return totalPrice;
};




/**
 * Check whether language is french
 *
 * @param {string} language
 * @returns {boolean}
 */
export const isFrench = (language?: string) => language === 'fr'

/**
 * Return all car types.
 *
 * @returns {bookcarsTypes.CarType[]}
 */
export const getAllCarTypes = () => [
  bookcarsTypes.CarType.Diesel,
  bookcarsTypes.CarType.Gasoline,
  bookcarsTypes.CarType.Electric,
  bookcarsTypes.CarType.Hybrid,
  bookcarsTypes.CarType.PlugInHybrid,
  bookcarsTypes.CarType.Unknown
]

/**
 * Randomize (shuffle) an array.
 *
 * @param {any[]} array
 */
export const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

/**
 * Return all car ranges.
 *
 * @returns {bookcarsTypes.CarRange[]}
 */
export const getAllRanges = () => [
  bookcarsTypes.CarRange.Mini,
  bookcarsTypes.CarRange.Midi,
  bookcarsTypes.CarRange.Maxi,
  bookcarsTypes.CarRange.Scooter,
]

/**
 * Return all multimedia types.
 *
 * @returns {bookcarsTypes.CarMultimedia[]}
 */
export const getAllMultimedias = () => [
  bookcarsTypes.CarMultimedia.Touchscreen,
  bookcarsTypes.CarMultimedia.Bluetooth,
  bookcarsTypes.CarMultimedia.AndroidAuto,
  bookcarsTypes.CarMultimedia.AppleCarPlay,
]

/**
 * Return all fuel policies.
 *
 * @returns {bookcarsTypes.FuelPolicy[]}
 */
export const getAllFuelPolicies = () => [
  bookcarsTypes.FuelPolicy.FreeTank,
  bookcarsTypes.FuelPolicy.LikeForLike,
]

/**
 * Calculate distance between two points on map.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {('K' | 'M')} unit
 * @returns {number}
 */
export const distance = (lat1: number, lon1: number, lat2: number, lon2: number, unit: 'K' | 'M') => {
  const radlat1 = (Math.PI * lat1) / 180
  const radlat2 = (Math.PI * lat2) / 180
  const theta = lon1 - lon2
  const radtheta = (Math.PI * theta) / 180
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
  dist = Math.acos(dist)
  dist = (dist * 180) / Math.PI
  dist = dist * 60 * 1.1515
  if (unit === 'K') {
    dist *= 1.609344
  } else if (unit === 'M') {
    dist *= 0.8684
  }
  return dist
}

/**
 * Format distance in Km/m.
 *
 * @param {number} d distance
 * @param {string} language
 * @returns {string}
 */
export const formatDistance = (d: number, language: string): string => {
  if (d > 0) {
    if (d < 1) {
      d *= 1000
    }
    const parts: string[] = String(d % 1 !== 0 ? d.toFixed(2) : d).split('.')
    const separator = language === 'en' ? ',' : ' '
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    if (parts.length > 1 && parts[1] === '00') {
      parts.splice(1, 1)
    }
    return `${parts.join('.')} ${d < 1 ? 'm' : 'Km'}`
  }
  return ''
}

/**
 * Removes a start line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trimStart = (str: string, char: string): string => {
  let res = str
  while (res.charAt(0) === char) {
    res = res.substring(1, res.length)
  }
  return res
}

/**
 * Removes a leading and trailing line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trimEnd = (str: string, char: string): string => {
  let res = str
  while (res.charAt(res.length - 1) === char) {
    res = res.substring(0, res.length - 1)
  }
  return res
}

/**
 * Removes a stating, leading and trailing line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trim = (str: string, char: string): string => {
  let res = trimStart(str, char)
  res = trimEnd(res, char)
  return res
}
