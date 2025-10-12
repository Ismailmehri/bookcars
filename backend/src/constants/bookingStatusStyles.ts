import * as bookcarsTypes from ':bookcars-types'

export const BOOKING_STATUS_CHIP_STYLES: Record<bookcarsTypes.BookingStatus, { background: string; color: string }> = {
  [bookcarsTypes.BookingStatus.Void]: { background: '#D9D9D9', color: '#6E7C86' },
  [bookcarsTypes.BookingStatus.Pending]: { background: '#FBDCC2', color: '#EF6C00' },
  [bookcarsTypes.BookingStatus.Deposit]: { background: '#CDECDA', color: '#3CB371' },
  [bookcarsTypes.BookingStatus.Paid]: { background: '#D1F9D1', color: '#77BC23' },
  [bookcarsTypes.BookingStatus.Reserved]: { background: '#D9E7F4', color: '#1E88E5' },
  [bookcarsTypes.BookingStatus.Cancelled]: { background: '#FBDFDE', color: '#E53935' },
}

export const FALLBACK_STATUS_CHIP_STYLE = { background: '#ECEFF1', color: '#455A64' }
