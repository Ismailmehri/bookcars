import express from 'express'
import routeNames from '../config/commissionRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as commissionController from '../controllers/commissionController'

const routes = express.Router()

routes.route(routeNames.getAgencyCommissions).post(authJwt.verifyToken, commissionController.getAgencyCommissions)
routes.route(routeNames.downloadMonthlyInvoice).get(authJwt.verifyToken, commissionController.downloadMonthlyInvoice)
routes.route(routeNames.downloadBookingInvoice).get(authJwt.verifyToken, commissionController.downloadBookingInvoice)
routes.route(routeNames.sendCommissionReminder).post(authJwt.verifyToken, commissionController.sendCommissionReminder)
routes.route(routeNames.getAdminCommissions).post(authJwt.verifyToken, commissionController.getAdminCommissions)
routes.route(routeNames.updateAgencyCommissionStatus).put(authJwt.verifyToken, commissionController.updateAgencyCommissionStatusController)
routes.route(routeNames.toggleAgencyCommissionBlock).put(authJwt.verifyToken, commissionController.toggleAgencyCommissionBlockController)
routes.route(routeNames.addAgencyCommissionNote).post(authJwt.verifyToken, commissionController.addAgencyCommissionNoteController)
routes.route(routeNames.sendAgencyCommissionReminder).post(authJwt.verifyToken, commissionController.sendAgencyCommissionReminderController)
routes.route(routeNames.commissionSettings)
  .get(authJwt.verifyToken, commissionController.getCommissionSettings)
  .put(authJwt.verifyToken, commissionController.updateCommissionSettings)

export default routes
