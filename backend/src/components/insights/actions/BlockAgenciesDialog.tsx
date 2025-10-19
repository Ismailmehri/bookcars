import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/insights'
import { strings as commonStrings } from '@/lang/common'
import BulkActionRecipients from './BulkActionRecipients'

interface BlockAgenciesDialogProps {
  open: boolean
  agencies: bookcarsTypes.AgencyRankingItem[]
  loading: boolean
  onClose: () => void
  onSubmit: (payload: {
    reason: string
    notifyByEmail: boolean
    notifyBySms: boolean
    emailSubject?: string
    emailMessage?: string
    smsMessage?: string
  }) => void
}

const BlockAgenciesDialog: React.FC<BlockAgenciesDialogProps> = ({ open, agencies, loading, onClose, onSubmit }) => {
  const [reason, setReason] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifySms, setNotifySms] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      setReason('')
      setNotifyEmail(false)
      setNotifySms(false)
      setEmailSubject('')
      setEmailMessage('')
      setSmsMessage('')
      setErrors({})
    }
  }, [open])

  const handleConfirm = () => {
    const nextErrors: Record<string, string> = {}
    if (!reason.trim()) {
      nextErrors.reason = strings.FORM_REQUIRED
    }
    if (notifyEmail) {
      if (!emailSubject.trim()) {
        nextErrors.emailSubject = strings.FORM_REQUIRED
      }
      if (!emailMessage.trim()) {
        nextErrors.emailMessage = strings.FORM_REQUIRED
      }
    }
    if (notifySms && !smsMessage.trim()) {
      nextErrors.smsMessage = strings.FORM_REQUIRED
    }
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      onSubmit({
        reason: reason.trim(),
        notifyByEmail: notifyEmail,
        notifyBySms: notifySms,
        emailSubject: notifyEmail ? emailSubject.trim() : undefined,
        emailMessage: notifyEmail ? emailMessage.trim() : undefined,
        smsMessage: notifySms ? smsMessage.trim() : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{strings.BLOCK_DIALOG_TITLE}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <BulkActionRecipients agencies={agencies} />
          <TextField
            label={strings.BLOCK_DIALOG_REASON}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            error={Boolean(errors.reason)}
            helperText={errors.reason}
            placeholder={strings.BLOCK_DIALOG_REASON_PLACEHOLDER}
            multiline
            minRows={3}
            fullWidth
          />
          <FormControlLabel
            control={(
              <Checkbox
                checked={notifyEmail}
                onChange={(event) => setNotifyEmail(event.target.checked)}
              />
            )}
            label={strings.BLOCK_DIALOG_NOTIFY_EMAIL}
          />
          {notifyEmail ? (
            <Stack spacing={1}>
              <TextField
                label={strings.BLOCK_DIALOG_EMAIL_SUBJECT}
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
                required
                error={Boolean(errors.emailSubject)}
                helperText={errors.emailSubject}
                placeholder={strings.BLOCK_DIALOG_EMAIL_SUBJECT_PLACEHOLDER}
                fullWidth
              />
              <TextField
                label={strings.BLOCK_DIALOG_EMAIL_MESSAGE}
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
                required
                error={Boolean(errors.emailMessage)}
                helperText={errors.emailMessage}
                placeholder={strings.BLOCK_DIALOG_EMAIL_PLACEHOLDER}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          ) : null}
          <FormControlLabel
            control={(
              <Checkbox
                checked={notifySms}
                onChange={(event) => setNotifySms(event.target.checked)}
              />
            )}
            label={strings.BLOCK_DIALOG_NOTIFY_SMS}
          />
          {notifySms ? (
            <TextField
              label={strings.BLOCK_DIALOG_SMS_MESSAGE}
              value={smsMessage}
              onChange={(event) => setSmsMessage(event.target.value)}
              required
              error={Boolean(errors.smsMessage)}
              helperText={errors.smsMessage}
              placeholder={strings.BLOCK_DIALOG_SMS_PLACEHOLDER}
              multiline
              minRows={3}
              fullWidth
            />
          ) : null}
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
          {strings.BLOCK_DIALOG_CONFIRM.replace('{count}', agencies.length.toString())}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default BlockAgenciesDialog
