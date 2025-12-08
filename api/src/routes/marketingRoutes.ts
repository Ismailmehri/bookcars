import express from 'express'
import * as marketingController from '../controllers/marketingController'

const routes = express.Router()

routes.route('/api/marketing/trigger').post(marketingController.trigger)

export default routes
