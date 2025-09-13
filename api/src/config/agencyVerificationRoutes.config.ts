export default {
  upload: '/api/verification/upload',
  myDocuments: '/api/verification/my',
  history: '/api/verification/history',
  download: '/api/verification/download/:versionId',
  adminList: '/api/admin/verification',
  adminVersions: '/api/admin/verification/:documentId/versions',
  adminDecision: '/api/admin/verification/:versionId/decision',
  adminDownload: '/api/admin/verification/download/:versionId',
}
