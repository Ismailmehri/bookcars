import { Location } from 'react-router-dom'

export const stripQuery = (url: string) => url.split('?')[0].split('#')[0]

export const buildDescription = (text: string, max = 160) => {
  if (text.length <= max) {
    return text
  }
  return `${text.substr(0, text.lastIndexOf(' ', max))}...`
}

export const isParamSearch = (loc: Location) => !!loc.search && loc.search.length > 1
