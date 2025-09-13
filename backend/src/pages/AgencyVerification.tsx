import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import * as AgencyVerificationService from '@/services/AgencyVerificationService'
import type { AgencyDocumentWithLatest } from '@/services/AgencyVerificationService'

const AgencyVerification = () => {
  const [docType, setDocType] = useState<bookcarsTypes.AgencyDocumentType>(
    bookcarsTypes.AgencyDocumentType.RC,
  )
  const [file, setFile] = useState<File>()
  const [docs, setDocs] = useState<AgencyDocumentWithLatest[]>([])

  const loadDocs = async () => {
    const data = await AgencyVerificationService.getMyDocuments()
    setDocs(data)
  }

  useEffect(() => {
    loadDocs()
  }, [])

  const upload = async () => {
    if (!file) {
      return
    }
    await AgencyVerificationService.upload(docType, file)
    setFile(undefined)
    await loadDocs()
  }

  const download = async (
    versionId: string,
    filename: string,
  ) => {
    const res = await AgencyVerificationService.download(versionId)
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
        <Typography variant="h5">Agency Verification</Typography>
        <Select
          value={docType}
          onChange={(e) => setDocType(e.target.value as bookcarsTypes.AgencyDocumentType)}
        >
          {Object.values(bookcarsTypes.AgencyDocumentType).map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
        <TextField
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0])}
        />
        <Button variant="contained" onClick={upload} disabled={!file}>
          Upload
        </Button>
        {docs.map((doc) => (
          <Box key={doc._id} display="flex" gap={1} alignItems="center">
            <Typography>{doc.docType}</Typography>
            {doc.latest && (
              <>
                <Typography>{doc.latest.status}</Typography>
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
              </>
            )}
          </Box>
        ))}
      </Box>
    </Layout>
  )
}

export default AgencyVerification
