import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import * as AgencyVerificationService from '@/services/AgencyVerificationService'
import type {
  AgencyDocumentWithLatest,
  VersionWithDocument,
} from '@/services/AgencyVerificationService'
import AgencyVerificationBanner, { AgencyVerificationStatus } from '@/components/AgencyVerificationBanner'
import AgencyVerificationBenefits from '@/components/AgencyVerificationBenefits'

const docLabels: Record<bookcarsTypes.AgencyDocumentType, string> = {
  [bookcarsTypes.AgencyDocumentType.RC]: 'Registre de Commerce',
  [bookcarsTypes.AgencyDocumentType.MATRICULE_FISCAL]: 'Matricule fiscal',
  [bookcarsTypes.AgencyDocumentType.PATENTE]: 'Patente',
  [bookcarsTypes.AgencyDocumentType.AUTORISATION_TRANSPORT]: 'Autorisation transport',
  [bookcarsTypes.AgencyDocumentType.CNSS]: 'CNSS',
  [bookcarsTypes.AgencyDocumentType.ASSURANCE]: 'Assurance',
  [bookcarsTypes.AgencyDocumentType.AUTRE]: 'Autre',
}

const statusChip = (status?: bookcarsTypes.AgencyDocumentStatus) => {
  if (!status) {
    return <Chip label="Non soumis" size="small" />
  }
  const map: Record<bookcarsTypes.AgencyDocumentStatus, { label: string; color: 'success' | 'error' | 'default' }> = {
    [bookcarsTypes.AgencyDocumentStatus.ACCEPTE]: { label: 'Accepté', color: 'success' },
    [bookcarsTypes.AgencyDocumentStatus.REFUSE]: { label: 'Refusé', color: 'error' },
    [bookcarsTypes.AgencyDocumentStatus.EN_REVUE]: { label: 'En revue', color: 'default' },
  }
  const { label, color } = map[status]
  return <Chip label={label} color={color} size="small" />
}

const requiredDocs = [
  bookcarsTypes.AgencyDocumentType.RC,
  bookcarsTypes.AgencyDocumentType.MATRICULE_FISCAL,
]

const AgencyVerification = () => {
  const [docs, setDocs] = useState<AgencyDocumentWithLatest[]>([])
  const [history, setHistory] = useState<VersionWithDocument[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<bookcarsTypes.AgencyDocumentType>()
  const [file, setFile] = useState<File>()
  const [note, setNote] = useState('')
  const [otherType, setOtherType] = useState('')

  const load = async () => {
    const d = await AgencyVerificationService.getMyDocuments()
    setDocs(d)
    const h = await AgencyVerificationService.getHistory()
    setHistory(h)
  }

  useEffect(() => {
    load()
  }, [])

  const openModal = (type: bookcarsTypes.AgencyDocumentType) => {
    setModalType(type)
    setFile(undefined)
    setNote('')
    setModalOpen(true)
  }

  const handleUpload = async () => {
    if (!file || !modalType) {
      return
    }
    await AgencyVerificationService.upload(modalType, file, note)
    setModalOpen(false)
    setFile(undefined)
    setNote('')
    await load()
  }

  const download = async (versionId: string, filename: string) => {
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

  const computeStatus = (): AgencyVerificationStatus => {
    const statuses = requiredDocs.map(
      (t) => docs.find((d) => d.docType === t)?.latest?.status,
    )
    if (
      statuses.every(
        (s) => s === bookcarsTypes.AgencyDocumentStatus.ACCEPTE,
      )
    ) {
      return 'VALIDEE'
    }
    if (statuses.some((s) => s === bookcarsTypes.AgencyDocumentStatus.EN_REVUE)) {
      return 'EN_REVUE'
    }
    if (
      statuses.some((s) => s === bookcarsTypes.AgencyDocumentStatus.REFUSE)
      && statuses.every(
        (s) =>
          s !== bookcarsTypes.AgencyDocumentStatus.ACCEPTE
          && s !== bookcarsTypes.AgencyDocumentStatus.EN_REVUE,
      )
    ) {
      return 'REFUSEE'
    }
    return 'NON_SOUMIS'
  }

  const status = computeStatus()

  const globalMap: Record<AgencyVerificationStatus, { label: string; color: 'success' | 'error' | 'default' }> = {
    VALIDEE: { label: 'Validée', color: 'success' },
    EN_REVUE: { label: 'En revue', color: 'default' },
    REFUSEE: { label: 'Refusée', color: 'error' },
    NON_SOUMIS: { label: 'Non soumis', color: 'default' },
  }

  const global = globalMap[status]

  return (
    <Layout>
      <Box
        p={{ xs: 2, md: 8 }}
        mt={{ xs: 2, md: 4 }}
        display="flex"
        flexDirection="column"
        gap={3}
      >
        <AgencyVerificationBanner status={status} />
        <AgencyVerificationBenefits />
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5">Vérification de votre agence</Typography>
            <Chip label={global.label} color={global.color} />
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
            {requiredDocs.map((t) => {
              const doc = docs.find((d) => d.docType === t)
              const latest = doc?.latest
              return (
                <Card key={t} sx={{ flex: 1, minWidth: 250 }}>
                  <CardContent>
                    <Typography variant="h6">
                      {`${docLabels[t]} (obligatoire)`}
                    </Typography>
                    <Box mt={1} mb={1}>{statusChip(latest?.status)}</Box>
                    {latest && (
                      <Typography variant="body2">
                        Dernière mise à jour :
                        {' '}
                        {new Date(latest.uploadedAt).toLocaleString()}
                      </Typography>
                    )}
                    {latest?.status === bookcarsTypes.AgencyDocumentStatus.REFUSE && (
                      <Typography variant="body2" color="error">
                        {latest.statusComment}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => openModal(t)}
                    >
                      Téléverser une nouvelle version
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6">Autres justificatifs</Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Select
              value={otherType}
              onChange={(e) => setOtherType(e.target.value)}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Type de document</MenuItem>
              {Object.values(bookcarsTypes.AgencyDocumentType)
                .filter((t) => !requiredDocs.includes(t))
                .map((t) => (
                  <MenuItem key={t} value={t}>
                    {docLabels[t]}
                  </MenuItem>
                ))}
            </Select>
            <Button
              variant="contained"
              disabled={!otherType}
              onClick={() => openModal(otherType as bookcarsTypes.AgencyDocumentType)}
            >
              Téléverser un document
            </Button>
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom>
            Historique des documents
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Commentaire admin</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((v) => (
                <TableRow key={v._id}>
                  <TableCell>{docLabels[v.document.docType]}</TableCell>
                  <TableCell>{`v${v.version}`}</TableCell>
                  <TableCell>
                    {new Date(v.uploadedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{statusChip(v.status)}</TableCell>
                  <TableCell>{v.statusComment}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => download(v._id!, v.originalFilename)}
                    >
                      Télécharger
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
          <DialogTitle>Téléverser un document</DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
          >
            <Typography>{modalType ? docLabels[modalType] : ''}</Typography>
            <Button component="label" variant="outlined">
              Choisir un fichier
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFile(e.target.files?.[0])
                }}
              />
            </Button>
            {file && <Typography variant="body2">{file.name}</Typography>}
            <TextField
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file}
            >
              Téléverser
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}

export default AgencyVerification
