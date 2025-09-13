import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
} from '@mui/material'
import Layout from '@/components/Layout'
import * as AgencyVerificationService from '@/services/AgencyVerificationService'

const AdminVerificationDashboard = () => {
  const [docs, setDocs] = useState<any[]>([])

  const loadDocs = async () => {
    const data = await AgencyVerificationService.getDocuments()
    const enriched = await Promise.all(
      data.map(async (doc: any) => {
        const versions = await AgencyVerificationService.getVersions(doc._id)
        return { ...doc, latest: versions[0] }
      }),
    )
    setDocs(enriched)
  }

  useEffect(() => {
    loadDocs()
  }, [])

  return (
    <Layout>
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h5">Agency Documents</Typography>
        {docs.map((doc) => (
          <Box key={doc._id} display="flex" gap={1} alignItems="center">
            <Typography>{doc.docType}</Typography>
            {doc.latest && (
              <Button
                href={AgencyVerificationService.getDownloadUrl(doc.latest._id, true)}
                target="_blank"
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
