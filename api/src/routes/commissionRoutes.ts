import express from 'express'
import routeNames from '../config/commissionRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as commissionController from '../controllers/commissionController'

const routes = express.Router()

routes.route(routeNames.getAgencyCommissions).post(authJwt.verifyToken, commissionController.getAgencyCommissions)
routes.route(routeNames.downloadMonthlyInvoice).get(authJwt.verifyToken, commissionController.downloadMonthlyInvoice)
routes.route(routeNames.downloadBookingInvoice).get(authJwt.verifyToken, commissionController.downloadBookingInvoice)

export default routes
