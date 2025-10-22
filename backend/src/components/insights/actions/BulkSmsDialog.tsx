import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/insights'
import { strings as commonStrings } from '@/lang/common'
import BulkActionRecipients from './BulkActionRecipients'

interface BulkSmsDialogProps {
  open: boolean
  agencies: bookcarsTypes.AgencyRankingItem[]
  loading: boolean
  onClose: () => void
  onSubmit: (payload: { message: string }) => void
}

const SMS_MAX_LENGTH = 160

const BulkSmsDialog: React.FC<BulkSmsDialogProps> = ({ open, agencies, loading, onClose, onSubmit }) => {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!open) {
      setMessage('')
      setError(undefined)
    }
  }, [open])

  const handleConfirm = () => {
    if (!message.trim()) {
      setError(strings.FORM_REQUIRED)
      return
    }
    setError(undefined)
    onSubmit({ message: message.trim() })
  }

  const characterCount = `${message.length}/${SMS_MAX_LENGTH}`

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{strings.SMS_DIALOG_TITLE}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <BulkActionRecipients agencies={agencies} />
          <TextField
            label={strings.SMS_DIALOG_MESSAGE}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            error={Boolean(error)}
            helperText={error}
            placeholder={strings.SMS_DIALOG_MESSAGE_PLACEHOLDER}
            multiline
            minRows={3}
            fullWidth
          />
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-end' }}>
            {strings.SMS_DIALOG_COUNTER.replace('{count}', characterCount)}
          </Typography>
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
          {strings.SMS_DIALOG_CONFIRM.replace('{count}', agencies.length.toString())}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default BulkSmsDialog
