import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
} from '@mui/material'
import Layout from '@/components/Layout'

const AdminVerificationDashboard = () => {
  const [docs, setDocs] = useState<any[]>([])

  const loadDocs = async () => {
    const res = await fetch('/api/admin/verification')
    if (res.ok) {
      const data = await res.json()
      const enriched = await Promise.all(
        data.map(async (doc: any) => {
          const vRes = await fetch(`/api/admin/verification/${doc._id}/versions`)
          const versions = vRes.ok ? await vRes.json() : []
          return { ...doc, latest: versions[0] }
        }),
      )
      setDocs(enriched)
    }
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
                href={`/api/admin/verification/download/${doc.latest._id}`}
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
