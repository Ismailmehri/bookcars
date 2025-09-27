const routes = {
  getAgencyCommissions: '/api/agency-commissions',
  downloadMonthlyInvoice: '/api/agency-commissions/invoice/:supplierId/:year/:month',
  downloadBookingInvoice: '/api/agency-commissions/booking/:bookingId/invoice',
  sendCommissionReminder: '/api/agency-commissions/:bookingId/reminders',
  getAdminCommissions: '/api/admin/commissions',
  updateAgencyCommissionStatus: '/api/admin/commissions/:stateId/status',
  toggleAgencyCommissionBlock: '/api/admin/commissions/:stateId/block',
  addAgencyCommissionNote: '/api/admin/commissions/:stateId/notes',
  sendAgencyCommissionReminder: '/api/admin/commissions/:stateId/reminders',
  commissionSettings: '/api/admin/commission-settings',
}

export default routes
