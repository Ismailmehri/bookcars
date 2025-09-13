import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
} from '@mui/material'
import Layout from '@/components/Layout'
import * as AgencyVerificationService from '@/services/AgencyVerificationService'
import type { AgencyDocumentWithLatest } from '@/services/AgencyVerificationService'

const AdminVerificationDashboard = () => {
  const [docs, setDocs] = useState<AgencyDocumentWithLatest[]>([])

  const loadDocs = async () => {
    const data = await AgencyVerificationService.getDocuments()
    const enriched: AgencyDocumentWithLatest[] = await Promise.all(
      data.map(async (doc) => {
        const versions = await AgencyVerificationService.getVersions(doc._id)
        return { ...doc, latest: versions[0] }
      }),
    )
    setDocs(enriched)
  }

  useEffect(() => {
    loadDocs()
  }, [])

  const download = async (
    versionId: string,
    filename: string,
  ) => {
    const res = await AgencyVerificationService.download(versionId, true)
    const url = window.URL.createObjectURL(res.data)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h5">Agency Documents</Typography>
        {docs.map((doc) => (
          <Box key={doc._id} display="flex" gap={1} alignItems="center">
            <Typography>{doc.docType}</Typography>
            {doc.latest && (
              <Button
                onClick={() =>
                  download(
                    doc.latest._id,
                    doc.latest.originalFilename,
                  )}
                size="small"
              >
                Download
              </Button>
            )}
          </Box>
        ))}
      </Box>
    </Layout>
  )
}

export default AdminVerificationDashboard
