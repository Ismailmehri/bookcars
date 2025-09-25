import express from 'express'
import routeNames from '../config/commissionRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as commissionController from '../controllers/commissionController'

const routes = express.Router()

routes.route(routeNames.getAgencyCommissions).post(authJwt.verifyToken, commissionController.getAgencyCommissions)
routes.route(routeNames.remindSupplier).post(authJwt.verifyToken, commissionController.remindSupplier)
routes.route(routeNames.remindClient).post(authJwt.verifyToken, commissionController.remindClient)

export default routes
