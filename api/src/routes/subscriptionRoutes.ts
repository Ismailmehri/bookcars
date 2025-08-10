import express from 'express'
import routeNames from '../config/subscriptionRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as subscriptionController from '../controllers/subscriptionController'

const routes = express.Router()

routes.route(routeNames.create).post(authJwt.verifyToken, subscriptionController.create)
routes.route(routeNames.getCurrent).get(authJwt.verifyToken, subscriptionController.getCurrent)
routes.route(routeNames.getSubscriptions).get(authJwt.verifyToken, subscriptionController.getSubscriptions)
routes.route(routeNames.getSubscription).get(authJwt.verifyToken, subscriptionController.getCurrentById)
routes.route(routeNames.update).post(authJwt.verifyToken, subscriptionController.update)

export default routes
