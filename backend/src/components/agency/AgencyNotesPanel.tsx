import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import { strings as commonStrings } from '@/lang/common'
import { strings as ulStrings } from '@/lang/user-list'
import { formatDateTime } from '@/common/format'
import * as InsightsActionService from '@/services/InsightsActionService'
import * as helper from '@/common/helper'

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

const getNoteLabel = (type: bookcarsTypes.AgencyNoteType) => {
  switch (type) {
    case bookcarsTypes.AgencyNoteType.Email:
      return ulStrings.AGENCY_NOTE_TYPE_EMAIL
    case bookcarsTypes.AgencyNoteType.Sms:
      return ulStrings.AGENCY_NOTE_TYPE_SMS
    case bookcarsTypes.AgencyNoteType.Block:
      return ulStrings.AGENCY_NOTE_TYPE_BLOCK
    case bookcarsTypes.AgencyNoteType.Unblock:
      return ulStrings.AGENCY_NOTE_TYPE_UNBLOCK
    case bookcarsTypes.AgencyNoteType.Note:
    default:
      return ulStrings.AGENCY_NOTE_TYPE_NOTE
  }
}

const getChipColor = (type: bookcarsTypes.AgencyNoteType): ChipColor => {
  switch (type) {
    case bookcarsTypes.AgencyNoteType.Email:
      return 'primary'
    case bookcarsTypes.AgencyNoteType.Sms:
      return 'secondary'
    case bookcarsTypes.AgencyNoteType.Block:
      return 'error'
    case bookcarsTypes.AgencyNoteType.Unblock:
      return 'success'
    case bookcarsTypes.AgencyNoteType.Note:
    default:
      return 'info'
  }
}

interface AgencyNotesPanelProps {
  agencyId: string
}

const AgencyNotesPanel = ({ agencyId }: AgencyNotesPanelProps) => {
  const [notes, setNotes] = useState<bookcarsTypes.AgencyNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    const fetchNotes = async () => {
      setLoading(true)
      setError(false)
      try {
        const response = await InsightsActionService.getAgencyNotes(agencyId)
        if (!active) {
          return
        }

        const normalizedNotes = response.notes.map((note) => ({
          ...note,
          createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt),
        }))
        setNotes(normalizedNotes)
      } catch (err) {
        helper.error(err)
        if (active) {
          setNotes([])
          setError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (agencyId) {
      fetchNotes()
    } else {
      setNotes([])
      setError(false)
      setLoading(false)
    }

    return () => {
      active = false
    }
  }, [agencyId])

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {ulStrings.AGENCY_NOTES_TITLE}
      </Typography>
      {loading && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            {commonStrings.LOADING}
          </Typography>
        </Stack>
      )}
      {!loading && error && (
        <Alert severity="error">{ulStrings.AGENCY_NOTES_ERROR}</Alert>
      )}
      {!loading && !error && notes.length === 0 && (
        <Alert severity="info">{ulStrings.AGENCY_NOTES_EMPTY}</Alert>
      )}
      {!loading && !error && notes.length > 0 && (
        <List disablePadding>
          {notes.map((note, index) => (
            <React.Fragment key={note._id}>
              <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }} data-testid="agency-note-item">
                <ListItemText
                  primary={(
                    <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
                      <Chip size="small" label={getNoteLabel(note.type)} color={getChipColor(note.type)} />
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                        {note.summary}
                      </Typography>
                    </Box>
                  )}
                  secondary={(
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(note.createdAt, { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {note.author.name || ulStrings.AGENCY_NOTE_UNKNOWN_AUTHOR}
                      </Typography>
                      {note.details && (
                        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                          {note.details}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
              </ListItem>
              {index < notes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  )
}

export default AgencyNotesPanel
