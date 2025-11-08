import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/users'
import { strings as commonStrings } from '@/lang/common'
import BulkActionRecipients from './BulkActionRecipients'

interface BulkSmsDialogProps {
  open: boolean
  users: bookcarsTypes.User[]
  loading: boolean
  onClose: () => void
  onSubmit: (payload: { message: string }) => void
}

const SMS_MAX_LENGTH = 160

const BulkSmsDialog: React.FC<BulkSmsDialogProps> = ({ open, users, loading, onClose, onSubmit }) => {
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
      setError(commonStrings.FORM_REQUIRED)
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
          <Typography variant="body2" color="text.secondary">
            {strings.SMS_DIALOG_DESCRIPTION}
          </Typography>
          <BulkActionRecipients users={users} />
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
            inputProps={{ maxLength: SMS_MAX_LENGTH }}
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
        <LoadingButton variant="contained" color="primary" loading={loading} onClick={handleConfirm}>
          {strings.SMS_DIALOG_CONFIRM.replace('{count}', users.length.toString())}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default BulkSmsDialog
