import React, { useCallback, useMemo } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Link as RouterLink } from 'react-router-dom'

import { strings } from '@/lang/commission-agreement'
import {
  buildCommissionAgreementViewModel,
  type CommissionAgreementViewModel,
} from './commissionAgreement.utils'

interface CommissionAgreementModalProps {
  open: boolean
  accepting: boolean
  commissionPercent: number
  effectiveDate: Date
  monthlyThreshold: number
  onAccept: () => void
}

const CommissionAgreementModal = ({
  open,
  accepting,
  commissionPercent,
  effectiveDate,
  monthlyThreshold,
  onAccept,
}: CommissionAgreementModalProps) => {
  const viewModel = useMemo<CommissionAgreementViewModel>(
    () => buildCommissionAgreementViewModel({
      commissionPercent,
      effectiveDate,
      monthlyThreshold,
    }),
    [commissionPercent, effectiveDate, monthlyThreshold],
  )

  const handleDialogClose = useCallback(() => {}, [])

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      aria-labelledby="commission-agreement-title"
      fullWidth
      maxWidth="sm"
      sx={{ mt: 5 }}
      disableEscapeKeyDown
      keepMounted
    >
      <DialogTitle id="commission-agreement-title">
        <Typography component="h2" variant="h6">
          {strings.TITLE}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <InfoOutlinedIcon color="primary" sx={{ mt: '4px' }} />
            <Stack spacing={1.5}>
              <Typography variant="body1">
                {strings.INTRO
                  .replace('{date}', viewModel.formattedDate)
                  .replace('{percent}', viewModel.formattedPercent)}
              </Typography>
              <Typography variant="body1">
                {strings.COLLECTION.replace('{threshold}', viewModel.formattedThreshold)}
              </Typography>
              <Typography variant="body1">{strings.CARRY_OVER}</Typography>
            </Stack>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.04)', borderColor: 'rgba(25, 118, 210, 0.2)' }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                {strings.EXAMPLE_TITLE}
              </Typography>
              <Divider />
              <Stack spacing={0.75}>
                <Typography variant="body2">
                  {strings.EXAMPLE_BASE.replace('{amount}', viewModel.formattedBasePrice)}
                </Typography>
                <Typography variant="body2">
                  {strings.EXAMPLE_CLIENT
                    .replace('{amount}', viewModel.formattedClientPrice)
                    .replace('{base}', viewModel.formattedBasePrice)
                    .replace('{percent}', viewModel.formattedPercent)}
                </Typography>
                <Typography variant="body2">
                  {strings.EXAMPLE_PAYMENT.replace('{amount}', viewModel.formattedClientPrice)}
                </Typography>
                <Typography variant="body2">
                  {strings.EXAMPLE_REMIT
                    .replace('{amount}', viewModel.formattedCommissionValue)
                    .replace('{percent}', viewModel.formattedPercent)
                    .replace('{base}', viewModel.formattedBasePrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {strings.EXAMPLE_FOOTER.replace('{threshold}', viewModel.formattedThreshold)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Stack spacing={1}>
            <Alert severity="info" variant="outlined">
              {strings.CALLOUT_INCLUDED}
            </Alert>
            <Alert severity="info" variant="outlined">
              {strings.CALLOUT_FLOW}
            </Alert>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box flexGrow={1}>
          <Link component={RouterLink} to="/agency-commissions" underline="hover">
            {strings.VIEW_POLICY}
          </Link>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={onAccept}
          disabled={accepting}
          size="large"
        >
          {strings.ACCEPT}
          {accepting && <CircularProgress size={18} color="inherit" sx={{ ml: 1 }} />}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CommissionAgreementModal
