import express from 'express'
import authJwt from '../middlewares/authJwt'
import * as emailController from '../controllers/emailController'

const routes = express.Router()

routes.route('/api/email/stats').get(authJwt.verifyToken, emailController.getStats)

export default routes
