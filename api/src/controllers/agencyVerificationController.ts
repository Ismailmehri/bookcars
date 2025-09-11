import path from 'node:path'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import { Types } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'
import * as helper from '../common/helper'
import * as authHelper from '../common/authHelper'
import * as logger from '../common/logger'
import User from '../models/User'
import AgencyDocument from '../models/AgencyDocument'
import AgencyDocumentVersion from '../models/AgencyDocumentVersion'

const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg']

export const upload = async (req: Request, res: Response) => {
  try {
    const { docType, note } = req.body
    const { file } = req
    if (!file) {
      return res.status(400).send('Missing file')
    }
    if (!Object.values(bookcarsTypes.AgencyDocumentType).includes(docType)) {
      return res.status(400).send('Invalid document type')
    }
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).send('Invalid file format')
    }
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)
    if (!connectedUser || !helper.supplier(connectedUser)) {
      return res.sendStatus(403)
    }
    const doc = await AgencyDocument.findOneAndUpdate(
      { agency: connectedUser._id, docType },
      { agency: connectedUser._id, docType },
      { upsert: true, new: true },
    )
    const versionNumber = await AgencyDocumentVersion.countDocuments({ document: doc._id }) + 1
    const ext = path.extname(file.originalname)
    const uuid = nanoid()
    const relPath = path.join(String(connectedUser._id), docType, `${uuid}${ext}`)
    const absPath = path.join(env.AGENCY_DOCS_PATH, relPath)
    await helper.mkdir(path.dirname(absPath))
    await fs.writeFile(absPath, file.buffer)
    const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex')
    const version = new AgencyDocumentVersion({
      document: doc._id,
      version: versionNumber,
      originalFilename: file.originalname,
      contentType: file.mimetype,
      sizeBytes: file.size,
      sha256,
      absPath,
      relPath,
      status: bookcarsTypes.AgencyDocumentStatus.EN_REVUE,
      uploadedBy: connectedUser._id,
      note,
    })
    await version.save()
    return res.status(201).json(version)
  } catch (err) {
    logger.error(`[agencyVerification.upload] ${err}`)
    return res.status(500).send('Error')
  }
}

export const getMyDocuments = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const docs = await AgencyDocument.find({ agency: sessionData.id }).lean()
    const results = await Promise.all(
      docs.map(async (doc) => {
        const latest = await AgencyDocumentVersion.findOne({ document: doc._id }).sort({ version: -1 })
        return { ...doc, latest }
      }),
    )
    return res.json(results)
  } catch (err) {
    logger.error(`[agencyVerification.getMyDocuments] ${err}`)
    return res.status(500).send('Error')
  }
}

export const download = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const version = await AgencyDocumentVersion.findById(req.params.versionId).populate('document')
    if (!version) {
      return res.sendStatus(404)
    }
    const doc = version.document as any
    if (String(doc.agency) !== sessionData.id) {
      return res.sendStatus(403)
    }
    return res.download(version.absPath, version.originalFilename)
  } catch (err) {
    logger.error(`[agencyVerification.download] ${err}`)
    return res.status(500).send('Error')
  }
}

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)
    if (!connectedUser || !helper.admin(connectedUser)) {
      return res.sendStatus(403)
    }
    const docs = await AgencyDocument.find().lean()
    return res.json(docs)
  } catch (err) {
    logger.error(`[agencyVerification.getAllDocuments] ${err}`)
    return res.status(500).send('Error')
  }
}

export const getVersions = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)
    if (!connectedUser || !helper.admin(connectedUser)) {
      return res.sendStatus(403)
    }
    const versions = await AgencyDocumentVersion.find({ document: req.params.documentId }).sort({ version: -1 })
    return res.json(versions)
  } catch (err) {
    logger.error(`[agencyVerification.getVersions] ${err}`)
    return res.status(500).send('Error')
  }
}

export const decision = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)
    if (!connectedUser || !helper.admin(connectedUser)) {
      return res.sendStatus(403)
    }
    const { status, comment } = req.body
    if (!Object.values(bookcarsTypes.AgencyDocumentStatus).includes(status)) {
      return res.status(400).send('Invalid status')
    }
    const version = await AgencyDocumentVersion.findById(req.params.versionId)
    if (!version) {
      return res.sendStatus(404)
    }
    version.status = status
    version.statusChangedBy = connectedUser._id as unknown as Types.ObjectId
    version.statusChangedAt = new Date()
    version.statusComment = comment
    await version.save()
    return res.json(version)
  } catch (err) {
    logger.error(`[agencyVerification.decision] ${err}`)
    return res.status(500).send('Error')
  }
}

export const adminDownload = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)
    if (!connectedUser || !helper.admin(connectedUser)) {
      return res.sendStatus(403)
    }
    const version = await AgencyDocumentVersion.findById(req.params.versionId)
    if (!version) {
      return res.sendStatus(404)
    }
    return res.download(version.absPath, version.originalFilename)
  } catch (err) {
    logger.error(`[agencyVerification.adminDownload] ${err}`)
    return res.status(500).send('Error')
  }
}
