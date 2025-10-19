import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/insights'
import { strings as commonStrings } from '@/lang/common'
import BulkActionRecipients from './BulkActionRecipients'

interface AddNoteDialogProps {
  open: boolean
  agencies: bookcarsTypes.AgencyRankingItem[]
  loading: boolean
  onClose: () => void
  onSubmit: (payload: { note: string }) => void
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ open, agencies, loading, onClose, onSubmit }) => {
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!open) {
      setNote('')
      setError(undefined)
    }
  }, [open])

  const handleConfirm = () => {
    if (!note.trim()) {
      setError(strings.FORM_REQUIRED)
      return
    }
    setError(undefined)
    onSubmit({ note: note.trim() })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{strings.NOTE_DIALOG_TITLE}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <BulkActionRecipients agencies={agencies} />
          <TextField
            label={strings.NOTE_DIALOG_MESSAGE}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            required
            error={Boolean(error)}
            helperText={error}
            placeholder={strings.NOTE_DIALOG_PLACEHOLDER}
            multiline
            minRows={4}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={onClose} color="inherit" disabled={loading}>
          {commonStrings.CANCEL}
        </LoadingButton>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={loading}
          onClick={handleConfirm}
        >
          {strings.NOTE_DIALOG_CONFIRM.replace('{count}', agencies.length.toString())}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default AddNoteDialog
