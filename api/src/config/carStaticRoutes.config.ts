const routes = {
    // Get stats for a specific car
    getCarStats: '/api/car-stats/supplier/:supplierId/:carId?',
    getUniqueSuppliersStats: '/api/car-stats/suppliers',

    // Get stats for a date range
    getStatsRange: '/api/car-stats/supplier/:supplierId/range',

    // Get daily stats
    getDailyStats: '/api/car-stats/supplier/:supplierId/daily',

    // Get monthly stats
    getMonthlyStats: '/api/car-stats/supplier/:supplierId/monthly',

    // Get most viewed cars
    getMostViewed: '/api/car-stats/supplier/:supplierId/most-viewed',

    // Get least viewed cars
    getLeastViewed: '/api/car-stats/supplier/:supplierId/least-viewed',
}
export default routes
