const routes = {
  getAgencyCommissions: '/api/agency-commissions',
  downloadMonthlyInvoice: '/api/agency-commissions/invoice/:supplierId/:year/:month',
  downloadBookingInvoice: '/api/agency-commissions/booking/:bookingId/invoice',
}

export default routes
