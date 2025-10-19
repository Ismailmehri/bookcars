import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/insights'
import { strings as commonStrings } from '@/lang/common'
import BulkActionRecipients from './BulkActionRecipients'

interface UnblockAgenciesDialogProps {
  open: boolean
  agencies: bookcarsTypes.AgencyRankingItem[]
  loading: boolean
  onClose: () => void
  onSubmit: (payload: { reason: string }) => void
}

const UnblockAgenciesDialog: React.FC<UnblockAgenciesDialogProps> = ({
  open,
  agencies,
  loading,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setReason('')
      setError('')
    }
  }, [open])

  const handleConfirm = () => {
    const trimmed = reason.trim()
    if (!trimmed) {
      setError(strings.FORM_REQUIRED)
      return
    }

    setError('')
    onSubmit({ reason: trimmed })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{strings.UNBLOCK_DIALOG_TITLE}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <BulkActionRecipients agencies={agencies} />
          <TextField
            label={strings.UNBLOCK_DIALOG_REASON}
            value={reason}
            onChange={(event) => {
              const value = event.target.value
              setReason(value)
              if (error && value.trim()) {
                setError('')
              }
            }}
            required
            error={Boolean(error)}
            helperText={error}
            placeholder={strings.UNBLOCK_DIALOG_REASON_PLACEHOLDER}
            multiline
            minRows={3}
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
          color="success"
          loading={loading}
          onClick={handleConfirm}
        >
          {strings.UNBLOCK_DIALOG_CONFIRM.replace('{count}', agencies.length.toString())}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default UnblockAgenciesDialog
