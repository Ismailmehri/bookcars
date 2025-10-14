import express from 'express'
import routeNames from '../config/carStaticRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as carStatsController from '../controllers/carStatsController'

const routes = express.Router()

routes.route(routeNames.getCarStats).get(authJwt.verifyToken, carStatsController.getCarStats)
routes.route(routeNames.getBookingStats).get(authJwt.verifyToken, carStatsController.getBookingStats)
routes.route(routeNames.getBookingSummary).get(authJwt.verifyToken, carStatsController.getBookingSummary)
routes.route(routeNames.getUniqueSuppliersStats).get(authJwt.verifyToken, carStatsController.getUniqueSuppliers)
routes.route(routeNames.getAdminOverview).get(authJwt.verifyToken, carStatsController.getAdminOverview)
routes.route(routeNames.getAgencyOverview).get(authJwt.verifyToken, carStatsController.getAgencyOverview)

export default routes
