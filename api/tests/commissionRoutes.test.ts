import routes from '../src/config/commissionRoutes.config'

describe('commissionRoutes.config', () => {
  it('should expose the full set of commission endpoints', () => {
    expect(routes).toMatchObject({
      getList: '/api/commission/list/:page/:size',
      exportList: '/api/commission/export/:page/:size',
      getDetails: '/api/commission/details/:agencyId/:year/:month',
      sendReminder: '/api/commission/reminder',
      recordPayment: '/api/commission/payment',
      toggleBlock: '/api/commission/block',
      addNote: '/api/commission/note',
      getSettings: '/api/commission/settings',
      updateSettings: '/api/commission/settings',
      generateInvoice: '/api/commission/invoice/:agencyId/:year/:month',
      getAgencyBookings: '/api/commission/agency/bookings',
      downloadAgencyInvoice: '/api/commission/agency/:agencyId/invoice/:year/:month',
      downloadAgencyBookingInvoice: '/api/commission/agency/invoice/booking/:bookingId',
    })
  })

  it('should only duplicate routes for shared read/write endpoints', () => {
    const values = Object.values(routes)
    const duplicates = values.filter((value, index) => values.indexOf(value) !== index)

    expect(new Set(duplicates)).toEqual(new Set([routes.getSettings]))
  })
})
