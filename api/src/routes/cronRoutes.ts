import express from 'express'
import * as cronController from '../controllers/cronController'
import routeNames from '../config/userRoutes.config'
import apiKeyValidator from '../middlewares/apiKey'

const router = express.Router()

router.post(routeNames.notifySuppliersWithoutCars, apiKeyValidator, cronController.notifySuppliersWithoutCars)
router.post(routeNames.notifySuppliersWithoutPhone, apiKeyValidator, cronController.notifySuppliersWithoutPhone)
router.post(routeNames.notifyClientsWithoutPhone, apiKeyValidator, cronController.notifyClientsWithoutPhone)
router.post(routeNames.notifySuppliersWithPendingBookings, apiKeyValidator, cronController.notifySuppliersWithPendingBookings)

export default router
