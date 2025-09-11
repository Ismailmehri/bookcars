import express from 'express'
import multer from 'multer'
import authJwt from '../middlewares/authJwt'
import routeNames from '../config/agencyVerificationRoutes.config'
import * as controller from '../controllers/agencyVerificationController'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const routes = express.Router()

routes.route(routeNames.upload).post([authJwt.verifyToken, upload.single('file')], controller.upload)
routes.route(routeNames.myDocuments).get(authJwt.verifyToken, controller.getMyDocuments)
routes.route(routeNames.download).get(authJwt.verifyToken, controller.download)
routes.route(routeNames.adminList).get(authJwt.verifyToken, controller.getAllDocuments)
routes.route(routeNames.adminVersions).get(authJwt.verifyToken, controller.getVersions)
routes.route(routeNames.adminDecision).post(authJwt.verifyToken, controller.decision)
routes.route(routeNames.adminDownload).get(authJwt.verifyToken, controller.adminDownload)

export default routes
