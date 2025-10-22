import express from 'express'
import authJwt from '../middlewares/authJwt'
import * as insightsController from '../controllers/insightsController'

const routes = express.Router()

routes.post('/api/insights/actions/email', authJwt.verifyToken, insightsController.sendBulkEmail)
routes.post('/api/insights/actions/sms', authJwt.verifyToken, insightsController.sendBulkSms)
routes.post('/api/insights/actions/block', authJwt.verifyToken, insightsController.blockAgencies)
routes.post('/api/insights/actions/unblock', authJwt.verifyToken, insightsController.unblockAgencies)
routes.post('/api/insights/actions/note', authJwt.verifyToken, insightsController.addManualNote)
routes.get('/api/insights/notes/:agencyId', authJwt.verifyToken, insightsController.getAgencyNotes)

export default routes
