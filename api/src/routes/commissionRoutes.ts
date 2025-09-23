import express from 'express'
import routeNames from '../config/commissionRoutes.config'
import * as commissionController from '../controllers/commissionController'
import authJwt from '../middlewares/authJwt'

const routes = express.Router()

routes.route(routeNames.getList).post(authJwt.verifyToken, commissionController.getMonthlyCommissions)
routes.route(routeNames.exportList).post(authJwt.verifyToken, commissionController.exportMonthlyCommissions)
routes.route(routeNames.getDetails).get(authJwt.verifyToken, commissionController.getAgencyCommissionDetails)
routes.route(routeNames.sendReminder).post(authJwt.verifyToken, commissionController.sendCommissionReminder)
routes.route(routeNames.recordPayment).post(authJwt.verifyToken, commissionController.recordCommissionPayment)
routes.route(routeNames.toggleBlock).post(authJwt.verifyToken, commissionController.toggleAgencyCommissionBlock)
routes.route(routeNames.addNote).post(authJwt.verifyToken, commissionController.addCommissionNote)
routes.route(routeNames.getSettings).get(authJwt.verifyToken, commissionController.getCommissionSettings)
routes.route(routeNames.updateSettings).put(authJwt.verifyToken, commissionController.updateCommissionSettings)
routes.route(routeNames.generateInvoice).get(authJwt.verifyToken, commissionController.generateCommissionInvoice)

export default routes
