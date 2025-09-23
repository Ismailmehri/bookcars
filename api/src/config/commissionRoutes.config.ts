const routes = {
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
}

export default routes
