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
import * as SupplierService from '@/services/SupplierService'

const docLabels: Record<bookcarsTypes.AgencyDocumentType, string> = {
  [bookcarsTypes.AgencyDocumentType.RC]: 'Registre de Commerce',
  [bookcarsTypes.AgencyDocumentType.MATRICULE_FISCAL]: 'Matricule fiscal',
  [bookcarsTypes.AgencyDocumentType.PATENTE]: 'Patente',
  [bookcarsTypes.AgencyDocumentType.AUTORISATION_TRANSPORT]: 'Autorisation transport',
  [bookcarsTypes.AgencyDocumentType.CNSS]: 'CNSS',
  [bookcarsTypes.AgencyDocumentType.ASSURANCE]: 'Assurance',
  [bookcarsTypes.AgencyDocumentType.AUTRE]: 'Autre',
}

const statusLabels: Record<bookcarsTypes.AgencyDocumentStatus, string> = {
  [bookcarsTypes.AgencyDocumentStatus.ACCEPTE]: 'Accepté',
  [bookcarsTypes.AgencyDocumentStatus.REFUSE]: 'Refusé',
  [bookcarsTypes.AgencyDocumentStatus.EN_REVUE]: 'En revue',
}

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
  const [filterAgency, setFilterAgency] = useState<'all' | string>('all')
  const [suppliers, setSuppliers] = useState<bookcarsTypes.User[]>([])
  const [selected, setSelected] = useState<VersionWithDocument>()
  const [comment, setComment] = useState('')

  const load = async () => {
    const s = await SupplierService.getAllSuppliers()
    setSuppliers(s)
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
      && (filterType === 'all' || v.document.docType === filterType)
      && (filterAgency === 'all' || v.document.agency === filterAgency),
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
      <Box p={2} mt={2} display="flex" flexDirection="column" gap={2}>
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
                {statusLabels[s]}
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
                {docLabels[t]}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={filterAgency}
            onChange={(e) => setFilterAgency(e.target.value)}
            displayEmpty
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Agence</MenuItem>
            {suppliers.map((s) => (
              <MenuItem key={s._id} value={s._id!}>
                {s.fullName}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={() => {
              setFilterStatus('all')
              setFilterType('all')
              setFilterAgency('all')
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
                <TableCell>
                  {suppliers.find((s) => s._id === v.document.agency)?.fullName || v.document.agency}
                </TableCell>
                <TableCell>{docLabels[v.document.docType]}</TableCell>
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
            {selected ? `Décision - ${docLabels[selected.document.docType]}` : ''}
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
