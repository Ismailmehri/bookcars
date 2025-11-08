import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/users'
import { strings as commonStrings } from '@/lang/common'
import BulkActionRecipients from './BulkActionRecipients'

interface BulkEmailDialogProps {
  open: boolean
  users: bookcarsTypes.User[]
  loading: boolean
  onClose: () => void
  onSubmit: (payload: { subject: string; message: string }) => void
}

const BulkEmailDialog: React.FC<BulkEmailDialogProps> = ({ open, users, loading, onClose, onSubmit }) => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({})

  useEffect(() => {
    if (!open) {
      setSubject('')
      setMessage('')
      setErrors({})
    }
  }, [open])

  const handleConfirm = () => {
    const nextErrors: { subject?: string; message?: string } = {}

    if (!subject.trim()) {
      nextErrors.subject = commonStrings.FORM_REQUIRED
    }

    if (!message.trim()) {
      nextErrors.message = commonStrings.FORM_REQUIRED
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      onSubmit({ subject: subject.trim(), message: message.trim() })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{strings.EMAIL_DIALOG_TITLE}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {strings.EMAIL_DIALOG_DESCRIPTION}
          </Typography>
          <BulkActionRecipients users={users} />
          <TextField
            label={strings.EMAIL_DIALOG_SUBJECT}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
            error={Boolean(errors.subject)}
            helperText={errors.subject}
            placeholder={strings.EMAIL_DIALOG_SUBJECT_PLACEHOLDER}
            fullWidth
            autoFocus
          />
          <TextField
            label={strings.EMAIL_DIALOG_MESSAGE}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            error={Boolean(errors.message)}
            helperText={errors.message}
            placeholder={strings.EMAIL_DIALOG_MESSAGE_PLACEHOLDER}
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
        <LoadingButton variant="contained" color="primary" loading={loading} onClick={handleConfirm}>
          {strings.EMAIL_DIALOG_CONFIRM.replace('{count}', users.length.toString())}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default BulkEmailDialog
