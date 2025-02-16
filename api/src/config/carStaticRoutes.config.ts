const routes = {
    // Get stats for a specific car
    getCarStats: '/api/car-stats/supplier/:supplierId/:carId?',
    getBookingStats: '/api/car-stats/bookings/:supplierId/:carId?',
    getBookingSummary: '/api/car-stats/summary/:supplierId/',
    getUniqueSuppliersStats: '/api/car-stats/suppliers',
}
export default routes
