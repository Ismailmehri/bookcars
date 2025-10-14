import React, { useMemo } from 'react'
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
import * as UserService from '@/services/UserService'

interface CommissionAgreementModalProps {
  open: boolean
  accepting: boolean
  commissionPercent: number
  effectiveDate: Date
  monthlyThreshold: number
  onAccept: () => void
}

const getLocale = (language: string) => {
  switch (language) {
    case 'fr':
      return 'fr-FR'
    case 'es':
      return 'es-ES'
    default:
      return 'en-US'
  }
}

export interface CommissionAgreementViewModel {
  formattedPercent: string
  formattedDate: string
  formattedBasePrice: string
  formattedClientPrice: string
  formattedCommissionValue: string
  formattedThreshold: string
}

interface BuildCommissionAgreementParams {
  language: string
  commissionPercent: number
  effectiveDate: Date
  monthlyThreshold: number
  basePrice?: number
}

export const buildCommissionAgreementViewModel = ({
  language,
  commissionPercent,
  effectiveDate,
  monthlyThreshold,
  basePrice = 100,
}: BuildCommissionAgreementParams): CommissionAgreementViewModel => {
  const locale = getLocale(language)

  const formattedPercent = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(commissionPercent)

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(effectiveDate)

  const formatAmount = (value: number) => {
    const normalized = Number(value.toFixed(2))
    const hasDecimals = Math.abs(normalized - Math.trunc(normalized)) > 0.001
    return `${normalized.toLocaleString(locale, {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    })} DT`
  }

  const commissionValue = Number(((basePrice * commissionPercent) / 100).toFixed(2))
  const clientPrice = Number((basePrice + commissionValue).toFixed(2))

  return {
    formattedPercent,
    formattedDate,
    formattedBasePrice: formatAmount(basePrice),
    formattedClientPrice: formatAmount(clientPrice),
    formattedCommissionValue: formatAmount(commissionValue),
    formattedThreshold: formatAmount(monthlyThreshold),
  }
}

const CommissionAgreementModal = ({
  open,
  accepting,
  commissionPercent,
  effectiveDate,
  monthlyThreshold,
  onAccept,
}: CommissionAgreementModalProps) => {
  const language = UserService.getLanguage()
  const viewModel = useMemo(() => buildCommissionAgreementViewModel({
    language,
    commissionPercent,
    effectiveDate,
    monthlyThreshold,
  }), [language, commissionPercent, effectiveDate, monthlyThreshold])

  const handleBackdropClose = (_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick') {
      return
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleBackdropClose}
      aria-labelledby="commission-agreement-title"
      fullWidth
      maxWidth="sm"
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
