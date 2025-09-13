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

const AgencyVerification = () => {
  const [docType, setDocType] = useState<bookcarsTypes.AgencyDocumentType>(
    bookcarsTypes.AgencyDocumentType.RC,
  )
  const [file, setFile] = useState<File>()
  const [docs, setDocs] = useState<bookcarsTypes.AgencyDocument[]>([])

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
                  href={AgencyVerificationService.getDownloadUrl(doc.latest._id)}
                  target="_blank"
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
