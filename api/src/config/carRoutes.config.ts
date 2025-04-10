const routes = {
  create: '/api/create-car',
  update: '/api/update-car',
  delete: '/api/delete-car/:id',
  createImage: '/api/create-car-image',
  updateImage: '/api/update-car-image/:id',
  deleteImage: '/api/delete-car-image/:id',
  deleteTempImage: '/api/delete-temp-car-image/:image',
  getCar: '/api/car/:id/:language',
  getCars: '/api/cars/:page/:size',
  getBookingCars: '/api/booking-cars/:page/:size',
  getFrontendCars: '/api/frontend-cars/:page/:size',
  getFrontendBoostedCars: '/api/frontend-boosted-cars/:page/:size',
  checkCar: '/api/check-car/:id',
  boostCar: '/api/boost-car',
}

export default routes
