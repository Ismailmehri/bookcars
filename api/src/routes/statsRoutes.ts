import express from 'express'
import authJwt from '../middlewares/authJwt'
import * as statsController from '../controllers/statsController'

const routes = express.Router()

routes.route('/api/stats/agency/:supplierId').get(authJwt.verifyToken, statsController.getAgencyStats)
routes.route('/api/stats/admin').get(authJwt.verifyToken, statsController.getAdminStats)

export default routes
