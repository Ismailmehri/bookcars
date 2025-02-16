import express from 'express'
import routeNames from '../config/carStaticRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as carStatsController from '../controllers/carStatsController'

const routes = express.Router()

// routes.route(routeNames.getCarStats).get(authJwt.verifyToken, carStatsController.getCarStats)
routes.route(routeNames.getCarStats).get(authJwt.verifyToken, carStatsController.getCarStats)
routes.route(routeNames.getUniqueSuppliersStats).get(carStatsController.getUniqueSuppliers)

export default routes
