import React from 'react'
import { Alert, AlertTitle, Button, Stack } from '@mui/material'
import { strings as commonStrings } from '@/lang/common'

interface UsersErrorProps {
  message: string
  onRetry?: () => void
}

const UsersError = ({ message, onRetry }: UsersErrorProps) => (
  <Alert
    severity="error"
    action={onRetry && (
      <Button color="inherit" size="small" onClick={onRetry}>
        {commonStrings.RETRY || 'Retry'}
      </Button>
    )}
  >
    <Stack spacing={0.5}>
      <AlertTitle>{commonStrings.ERROR || 'Error'}</AlertTitle>
      {message}
    </Stack>
  </Alert>
)

export default React.memo(UsersError)
