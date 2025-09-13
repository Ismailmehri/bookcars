import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
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
import type { VersionWithDocument } from '@/services/AgencyVerificationService'

const statusChip = (status: bookcarsTypes.AgencyDocumentStatus) => {
  const map: Record<bookcarsTypes.AgencyDocumentStatus, { label: string; color: 'success' | 'error' | 'default' }> = {
    [bookcarsTypes.AgencyDocumentStatus.ACCEPTE]: { label: 'Accepté', color: 'success' },
    [bookcarsTypes.AgencyDocumentStatus.REFUSE]: { label: 'Refusé', color: 'error' },
    [bookcarsTypes.AgencyDocumentStatus.EN_REVUE]: { label: 'En revue', color: 'default' },
  }
  const { label, color } = map[status]
  return <Chip label={label} color={color} size="small" />
}

const AdminVerificationDashboard = () => {
  const [versions, setVersions] = useState<VersionWithDocument[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | bookcarsTypes.AgencyDocumentStatus>('all')
  const [filterType, setFilterType] = useState<'all' | bookcarsTypes.AgencyDocumentType>('all')
  const [selected, setSelected] = useState<VersionWithDocument>()
  const [comment, setComment] = useState('')

  const load = async () => {
    const docs = await AgencyVerificationService.getDocuments()
    const vers = await Promise.all(
      docs.map(async (doc) => {
        const v = await AgencyVerificationService.getVersions(doc._id!)
        return v.map((ver) => ({ ...ver, document: doc }))
      }),
    )
    setVersions(
      vers
        .flat()
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
    )
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = versions.filter(
    (v) =>
      (filterStatus === 'all' || v.status === filterStatus)
      && (filterType === 'all' || v.document.docType === filterType),
  )

  const download = async (versionId: string, filename: string) => {
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

  const decide = async (status: bookcarsTypes.AgencyDocumentStatus) => {
    if (!selected) {
      return
    }
    if (status === bookcarsTypes.AgencyDocumentStatus.REFUSE && !comment) {
      return
    }
    await AgencyVerificationService.decision(selected._id!, status, comment)
    setSelected(undefined)
    setComment('')
    await load()
  }

  return (
    <Layout>
      <Box p={2} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h5">Tableau de bord de vérification</Typography>
        <Box display="flex" gap={2}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            displayEmpty
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Statut</MenuItem>
            {Object.values(bookcarsTypes.AgencyDocumentStatus).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            displayEmpty
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">Type de document</MenuItem>
            {Object.values(bookcarsTypes.AgencyDocumentType).map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={() => {
              setFilterStatus('all')
              setFilterType('all')
            }}
          >
            Réinitialiser
          </Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Agence</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((v) => (
              <TableRow
                key={v._id}
                hover
                onClick={() => {
                  setSelected(v)
                  setComment(v.statusComment || '')
                }}
              >
                <TableCell>{String(v.document.agency)}</TableCell>
                <TableCell>{v.document.docType}</TableCell>
                <TableCell>{`v${v.version}`}</TableCell>
                <TableCell>
                  {new Date(v.uploadedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{statusChip(v.status)}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      download(v._id!, v.originalFilename)
                    }}
                  >
                    Télécharger
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={Boolean(selected)} onClose={() => setSelected(undefined)}>
          <DialogTitle>
            {selected ? `Décision - ${selected.document.docType}` : ''}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography>
              Nom :
              {' '}
              {selected?.originalFilename}
            </Typography>
            <TextField
              label="Commentaire"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              multiline
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelected(undefined)}>Fermer</Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => decide(bookcarsTypes.AgencyDocumentStatus.REFUSE)}
              disabled={!comment}
            >
              Refuser
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={() => decide(bookcarsTypes.AgencyDocumentStatus.ACCEPTE)}
            >
              Valider
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}

export default AdminVerificationDashboard
