import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  Drawer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Paid as PaidIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Settings as SettingsIcon,
  NoteAdd as NoteAddIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from '@mui/x-data-grid'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import Layout from '@/components/Layout'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import { strings } from '@/lang/agency-commissions'
import { strings as commonStrings } from '@/lang/common'
import * as CommissionService from '@/services/CommissionService'

import '@/assets/css/agency-commissions.css'

const buildMonthLabel = (month: number, year: number, language: string) => {
  const date = new Date(Date.UTC(year, month - 1, 1))
  const label = date.toLocaleString(language, { month: 'long' })
  return bookcarsHelper.capitalize(label)
}

const formatNumber = (value: number, language: string) => {
  return bookcarsHelper.formatNumber(Math.round(value), language)
}

const getReminderChannelLabel = (
  channel?: bookcarsTypes.CommissionReminderChannel,
) => {
  switch (channel) {
    case bookcarsTypes.CommissionReminderChannel.Email:
      return strings.REMINDER_CHANNEL_EMAIL
    case bookcarsTypes.CommissionReminderChannel.Sms:
      return strings.REMINDER_CHANNEL_SMS
    case bookcarsTypes.CommissionReminderChannel.EmailAndSms:
      return strings.REMINDER_CHANNEL_EMAIL_SMS
    default:
      return ''
  }
}

const mapStatusToLabel = (
  status: bookcarsTypes.AgencyCommissionStatus,
) => {
  switch (status) {
    case bookcarsTypes.AgencyCommissionStatus.Blocked:
      return strings.STATUS_BLOCKED
    case bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp:
      return strings.STATUS_NEEDS_FOLLOW_UP
    default:
      return strings.STATUS_ACTIVE
  }
}

const mapLogTypeToLabel = (type: bookcarsTypes.AgencyCommissionEventType) => {
  switch (type) {
    case bookcarsTypes.AgencyCommissionEventType.Reminder:
      return strings.LOG_TYPE_REMINDER
    case bookcarsTypes.AgencyCommissionEventType.Payment:
      return strings.LOG_TYPE_PAYMENT
    case bookcarsTypes.AgencyCommissionEventType.Block:
      return strings.LOG_TYPE_BLOCK
    case bookcarsTypes.AgencyCommissionEventType.Unblock:
      return strings.LOG_TYPE_UNBLOCK
    case bookcarsTypes.AgencyCommissionEventType.Note:
      return strings.LOG_TYPE_NOTE
    default:
      return type
  }
}

const mapPaymentStatusToLabel = (status: bookcarsTypes.CommissionPaymentStatus) => {
  switch (status) {
    case bookcarsTypes.CommissionPaymentStatus.Paid:
      return strings.PAYMENT_STATUS_PAID
    case bookcarsTypes.CommissionPaymentStatus.Partial:
      return strings.PAYMENT_STATUS_PARTIAL
    default:
      return strings.PAYMENT_STATUS_UNPAID
  }
}

const AgencyCommissions = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [admin, setAdmin] = useState(false)
  const now = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | bookcarsTypes.AgencyCommissionStatus>('all')
  const [aboveThreshold, setAboveThreshold] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [data, setData] = useState<bookcarsTypes.AgencyCommissionListResponse>()
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<bookcarsTypes.AgencyCommissionRow | null>(null)
  const [detail, setDetail] = useState<bookcarsTypes.AgencyCommissionDetail>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [settings, setSettings] = useState<bookcarsTypes.CommissionSettings>()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [reminderChannel, setReminderChannel] = useState<bookcarsTypes.CommissionReminderChannel>(
    bookcarsTypes.CommissionReminderChannel.Email,
  )
  const [reminderSubject, setReminderSubject] = useState('')
  const [reminderMessage, setReminderMessage] = useState('')
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [note, setNote] = useState('')
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)

  const language = user?.language || env.DEFAULT_LANGUAGE

  const monthOptions = useMemo(() => Array.from({ length: 12 }).map((_, index) => ({
    value: index + 1,
    label: buildMonthLabel(index + 1, year, language),
  })), [language, year])

  const onLoad = (_user?: bookcarsTypes.User) => {
    if (_user) {
      setUser(_user)
      const isAdmin = helper.admin(_user)
      setAdmin(isAdmin)
      if (!isAdmin) {
        setLoading(false)
      }
    } else {
      setUser(undefined)
      setAdmin(false)
      setLoading(false)
    }
  }

  const buildListPayload = useCallback((): bookcarsTypes.CommissionListPayload => ({
    month,
    year,
    search: search || undefined,
    status: statusFilter === 'all' ? 'all' : statusFilter,
    aboveThreshold,
  }), [month, year, search, statusFilter, aboveThreshold])

  const loadData = useCallback(async () => {
    if (!admin) {
      return
    }

    setLoading(true)
    try {
      const payload = buildListPayload()
      const response = await CommissionService.getMonthlyCommissions(page + 1, pageSize, payload)
      setData(response)
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
    }
  }, [admin, page, pageSize, buildListPayload])

  useEffect(() => {
    if (admin) {
      loadData()
    }
  }, [admin, loadData])

  useEffect(() => {
    if (selectedAgency && data) {
      const updated = data.agencies.find((row) => row.agency.id === selectedAgency.agency.id)
      if (updated && updated !== selectedAgency) {
        setSelectedAgency(updated)
      } else if (!updated) {
        setSelectedAgency(null)
      }
    }
  }, [data, selectedAgency])

  const resetPagination = () => {
    setPage(0)
  }

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setMonth(Number(event.target.value))
    resetPagination()
  }

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setYear(Number(event.target.value))
    resetPagination()
  }

  const handlePreviousMonth = () => {
    setMonth((prev) => {
      if (prev === 1) {
        setYear((y) => y - 1)
        return 12
      }
      return prev - 1
    })
    resetPagination()
  }

  const handleNextMonth = () => {
    setMonth((prev) => {
      if (prev === 12) {
        setYear((y) => y + 1)
        return 1
      }
      return prev + 1
    })
    resetPagination()
  }

  const handleStatusChange = (event: SelectChangeEvent<'all' | bookcarsTypes.AgencyCommissionStatus>) => {
    setStatusFilter(event.target.value as 'all' | bookcarsTypes.AgencyCommissionStatus)
    resetPagination()
  }

  const handleSearch = () => {
    setSearch(searchTerm.trim())
    resetPagination()
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAboveThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAboveThreshold(event.target.checked)
    resetPagination()
  }

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value))
    resetPagination()
  }

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (model.pageSize !== pageSize) {
      setPageSize(model.pageSize)
      setPage(model.page)
    } else {
      setPage(model.page)
    }
  }

  const fetchDetail = useCallback(async (
    agency: bookcarsTypes.AgencyCommissionRow,
  ) => {
    setDetailLoading(true)
    try {
      const response = await CommissionService.getAgencyCommissionDetails(agency.agency.id, year, month)
      setDetail(response)
    } catch (err) {
      helper.error(err)
      setDetail(undefined)
    } finally {
      setDetailLoading(false)
    }
  }, [month, year])

  const openDrawer = async (agency: bookcarsTypes.AgencyCommissionRow) => {
    setSelectedAgency(agency)
    setDrawerOpen(true)
    await fetchDetail(agency)
  }

  const refreshDetail = useCallback(async () => {
    if (selectedAgency) {
      await fetchDetail(selectedAgency)
    }
  }, [fetchDetail, selectedAgency])

  const ensureSettings = useCallback(async (): Promise<bookcarsTypes.CommissionSettings> => {
    if (settings) {
      return settings
    }

    setLoadingSettings(true)
    try {
      const response = await CommissionService.getCommissionSettings()
      setSettings(response)
      return response
    } catch (err) {
      helper.error(err)
      throw err
    } finally {
      setLoadingSettings(false)
    }
  }, [settings])

  const buildTemplateMessage = useCallback((
    template: string,
    agency: bookcarsTypes.AgencyCommissionRow,
    summary?: bookcarsTypes.AgencyCommissionDetailSummary,
  ) => {
    if (!template) {
      return ''
    }

    const amount = summary ? summary.balance : agency.balance
    const placeholders: Record<string, string> = {
      agencyName: agency.agency.name,
      month: buildMonthLabel(month, year, language),
      year: String(year),
      amount: String(Math.max(Math.round(amount), 0)),
      linkPaiement: '',
    }

    return template.replace(/{{(.*?)}}/g, (_, key: string) => placeholders[key.trim()] ?? '')
  }, [language, month, year])

  const handleOpenReminder = async (agency: bookcarsTypes.AgencyCommissionRow) => {
    setSelectedAgency(agency)
    try {
      const currentSettings = await ensureSettings()
      const defaultChannel = currentSettings.reminderChannel || bookcarsTypes.CommissionReminderChannel.Email
      setReminderChannel(defaultChannel)
      const template = defaultChannel === bookcarsTypes.CommissionReminderChannel.Sms
        ? currentSettings.smsTemplate
        : currentSettings.emailTemplate
      const message = buildTemplateMessage(template, agency, detail?.summary)
      setReminderMessage(message)
      setReminderSubject(`Relance commission - ${buildMonthLabel(month, year, language)} ${year}`)
      setReminderDialogOpen(true)
    } catch {
      setReminderDialogOpen(false)
    }
  }

  const handleReminderChannelChange = (event: SelectChangeEvent<bookcarsTypes.CommissionReminderChannel>) => {
    const channel = event.target.value as bookcarsTypes.CommissionReminderChannel
    setReminderChannel(channel)
    if (selectedAgency && settings) {
      const template = channel === bookcarsTypes.CommissionReminderChannel.Sms
        ? settings.smsTemplate
        : settings.emailTemplate
      const message = buildTemplateMessage(template, selectedAgency, detail?.summary)
      setReminderMessage(message)
    }
  }

  const handleSendReminder = async () => {
    if (!selectedAgency) {
      return
    }

    try {
      await CommissionService.sendCommissionReminder({
        agencyId: selectedAgency.agency.id,
        month,
        year,
        channel: reminderChannel,
        subject: reminderSubject,
        message: reminderMessage,
      })
      helper.info(strings.formatString(strings.REMINDER_SUCCESS, selectedAgency.agency.name) as string)
      setReminderDialogOpen(false)
      await Promise.all([loadData(), refreshDetail()])
    } catch (err) {
      helper.error(err, strings.REMINDER_ERROR)
    }
  }

  const handleOpenPaymentDialog = (agency: bookcarsTypes.AgencyCommissionRow) => {
    setSelectedAgency(agency)
    setPaymentAmount('')
    setPaymentDate('')
    setPaymentReference('')
    setPaymentDialogOpen(true)
  }

  const handleRecordPayment = async () => {
    if (!selectedAgency) {
      return
    }

    const amount = Number(paymentAmount)
    if (!amount || amount <= 0 || !paymentDate) {
      helper.error(null, commonStrings.FIX_ERRORS)
      return
    }

    try {
      await CommissionService.recordCommissionPayment({
        agencyId: selectedAgency.agency.id,
        month,
        year,
        amount,
        paymentDate: new Date(paymentDate),
        reference: paymentReference || undefined,
      })
      helper.info(strings.formatString(strings.PAYMENT_SUCCESS, formatNumber(amount, language)) as string)
      setPaymentDialogOpen(false)
      await Promise.all([loadData(), refreshDetail()])
    } catch (err) {
      helper.error(err, strings.PAYMENT_ERROR)
    }
  }

  const handleOpenNoteDialog = (agency: bookcarsTypes.AgencyCommissionRow) => {
    setSelectedAgency(agency)
    setNote('')
    setNoteDialogOpen(true)
  }

  const handleSaveNote = async () => {
    if (!selectedAgency || !note.trim()) {
      helper.error(null, commonStrings.FIX_ERRORS)
      return
    }

    try {
      await CommissionService.addCommissionNote({
        agencyId: selectedAgency.agency.id,
        month,
        year,
        note: note.trim(),
      })
      helper.info(strings.NOTE_SUCCESS)
      setNoteDialogOpen(false)
      await refreshDetail()
    } catch (err) {
      helper.error(err, strings.NOTE_ERROR)
    }
  }

  const handleToggleBlock = async (agency: bookcarsTypes.AgencyCommissionRow) => {
    setSelectedAgency(agency)
    setBlockConfirmOpen(true)
  }

  const confirmToggleBlock = async () => {
    if (!selectedAgency) {
      return
    }

    const block = selectedAgency.status !== bookcarsTypes.AgencyCommissionStatus.Blocked

    try {
      await CommissionService.toggleAgencyBlock({
        agencyId: selectedAgency.agency.id,
        month,
        year,
        block,
      })
      helper.info(strings.formatString(block ? strings.BLOCK_SUCCESS : strings.UNBLOCK_SUCCESS, selectedAgency.agency.name) as string)
      setBlockConfirmOpen(false)
      await Promise.all([loadData(), refreshDetail()])
    } catch (err) {
      helper.error(err, strings.BLOCK_ERROR)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const payload = buildListPayload()
      const blob = await CommissionService.exportMonthlyCommissions(page + 1, pageSize, payload)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `commissions_${year}_${String(month).padStart(2, '0')}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      helper.info(strings.EXPORT_SUCCESS)
    } catch (err) {
      helper.error(err, strings.EXPORT_ERROR)
    } finally {
      setExporting(false)
    }
  }

  const handleGenerateInvoice = async () => {
    if (!selectedAgency) {
      return
    }

    setInvoiceLoading(true)
    try {
      const blob = await CommissionService.generateInvoice(selectedAgency.agency.id, year, month)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `commission_${selectedAgency.agency.id}_${year}_${String(month).padStart(2, '0')}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      helper.info(strings.INVOICE_SUCCESS)
    } catch (err) {
      helper.error(err, strings.INVOICE_ERROR)
    } finally {
      setInvoiceLoading(false)
    }
  }

  const handleSettingsOpen = async () => {
    setSettingsOpen(true)
    try {
      await ensureSettings()
    } catch {
      // ignore
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) {
      return
    }

    try {
      const updated = await CommissionService.updateCommissionSettings({
        reminderChannel: settings.reminderChannel,
        emailTemplate: settings.emailTemplate,
        smsTemplate: settings.smsTemplate,
      })
      setSettings(updated)
      helper.info(strings.SETTINGS_SUCCESS)
      setSettingsOpen(false)
    } catch (err) {
      helper.error(err, strings.SETTINGS_ERROR)
    }
  }

  const updateSettingsField = (
    field: keyof bookcarsTypes.CommissionSettingsPayload,
    value: string | bookcarsTypes.CommissionReminderChannel,
  ) => {
    setSettings((prev) => {
      if (!prev) {
        return prev
      }
      return { ...prev, [field]: value }
    })
  }

  const rows = data?.agencies || []

  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'agency',
      headerName: strings.COLUMN_AGENCY,
      flex: 1.2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<bookcarsTypes.AgencyCommissionRow>) => {
        const agency = params.row.agency
        const tooltip = [agency.email, agency.phone]
          .filter((value) => !!value)
          .join(' • ')

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={tooltip || ''} placement="top">
              <Box>
                <Typography variant="body2" fontWeight={600}>{agency.name}</Typography>
                {agency.email && (
                  <Typography variant="caption" color="text.secondary">{agency.email}</Typography>
                )}
              </Box>
            </Tooltip>
            {agency.city && <Chip size="small" label={agency.city} />}
          </Stack>
        )
      },
    },
    {
      field: 'reservations',
      headerName: strings.COLUMN_RESERVATIONS,
      minWidth: 120,
      type: 'number',
    },
    {
      field: 'grossTurnover',
      headerName: strings.COLUMN_GROSS,
      minWidth: 140,
      valueFormatter: (params) => formatNumber(Number(params?.value ?? 0), language),
    },
    {
      field: 'commissionDue',
      headerName: strings.COLUMN_DUE,
      minWidth: 150,
      valueFormatter: (params) => formatNumber(Number(params?.value ?? 0), language),
    },
    {
      field: 'commissionCollected',
      headerName: strings.COLUMN_COLLECTED,
      minWidth: 170,
      valueFormatter: (params) => formatNumber(Number(params?.value ?? 0), language),
    },
    {
      field: 'balance',
      headerName: strings.COLUMN_BALANCE,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<bookcarsTypes.AgencyCommissionRow>) => {
        const balanceValue = params.row.balance
        const formatted = formatNumber(balanceValue, language)
        const color = balanceValue > 0
          ? 'error'
          : balanceValue < 0
            ? 'success'
            : 'default'
        return (
          <Chip
            size="small"
            color={color === 'default' ? undefined : color}
            variant={color === 'default' ? 'outlined' : 'filled'}
            label={`${formatted} TND`}
          />
        )
      },
    },
    {
      field: 'lastPayment',
      headerName: strings.COLUMN_LAST_PAYMENT,
      minWidth: 150,
      valueFormatter: (params) => {
        if (!params?.value) {
          return strings.LAST_PAYMENT_NONE
        }
        return new Date(params.value as string).toLocaleDateString(language)
      },
    },
    {
      field: 'lastReminder',
      headerName: strings.COLUMN_LAST_REMINDER,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<bookcarsTypes.AgencyCommissionRow>) => {
        const reminder = params.row.lastReminder
        if (!reminder) {
          return <Typography variant="body2" color="text.secondary">{strings.LAST_REMINDER_NONE}</Typography>
        }
        const date = new Date(reminder.date).toLocaleDateString(language)
        return (
          <Typography variant="body2" color={reminder.success ? 'inherit' : 'error'}>
            {`${date} • ${getReminderChannelLabel(reminder.channel)}`}
          </Typography>
        )
      },
    },
    {
      field: 'status',
      headerName: strings.COLUMN_STATUS,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<bookcarsTypes.AgencyCommissionRow>) => {
        const status = params.row.status
        let color: 'default' | 'success' | 'error' | 'warning' = 'default'
        if (status === bookcarsTypes.AgencyCommissionStatus.Blocked) {
          color = 'error'
        } else if (status === bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp) {
          color = 'warning'
        } else {
          color = 'success'
        }
        return <Chip size="small" color={color} label={mapStatusToLabel(status)} />
      },
    },
    {
      field: 'actions',
      headerName: strings.COLUMN_ACTIONS,
      minWidth: 180,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<bookcarsTypes.AgencyCommissionRow>) => {
        const row = params.row
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title={strings.ACTION_REMIND}>
              <IconButton size="small" onClick={() => handleOpenReminder(row)}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={strings.ACTION_MARK_PAID}>
              <IconButton size="small" onClick={() => handleOpenPaymentDialog(row)}>
                <PaidIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.status === bookcarsTypes.AgencyCommissionStatus.Blocked ? strings.ACTION_UNBLOCK : strings.ACTION_BLOCK}>
              <IconButton size="small" onClick={() => handleToggleBlock(row)}>
                {row.status === bookcarsTypes.AgencyCommissionStatus.Blocked ? <LockOpenIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={strings.ACTION_DETAILS}>
              <IconButton size="small" onClick={() => openDrawer(row)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      },
    },
  ], [language])

  const rowCount = data?.total || 0

  return (
    <Layout strict admin onLoad={onLoad}>
      {!admin && !loading && (
        <Typography variant="body1" color="text.secondary" sx={{ p: 3 }}>
          {strings.ACCESS_RESTRICTED}
        </Typography>
      )}
      {admin && (
        <Box className="agency-commissions">
          <Box className="ac-header">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5">{strings.TITLE}</Typography>
              <Chip label={`${strings.THRESHOLD_LABEL}: ${formatNumber(data?.summary.threshold || 0, language)} TND`} size="small" />
            </Stack>
            <Stack direction="row" spacing={1} className="ac-header-controls">
              <IconButton onClick={handlePreviousMonth}><ChevronLeftIcon /></IconButton>
              <FormControl size="small">
                <InputLabel>{strings.MONTH_LABEL}</InputLabel>
                <Select value={month} label={strings.MONTH_LABEL} onChange={handleMonthChange}>
                  {monthOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>{strings.YEAR_LABEL}</InputLabel>
                <Select value={year} label={strings.YEAR_LABEL} onChange={handleYearChange}>
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = now.getFullYear() - 2 + index
                    return <MenuItem key={value} value={value}>{value}</MenuItem>
                  })}
                </Select>
              </FormControl>
              <IconButton onClick={handleNextMonth}><ChevronRightIcon /></IconButton>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={handleSettingsOpen}
                disabled={loadingSettings}
              >
                {strings.SETTINGS}
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
                disabled={exporting || loading}
              >
                {strings.EXPORT_CSV}
              </Button>
            </Stack>
          </Box>

          <Box className="ac-filters">
            <TextField
              className="ac-search-field"
              label={strings.SEARCH_PLACEHOLDER}
              size="small"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{strings.STATUS_FILTER_LABEL}</InputLabel>
              <Select value={statusFilter} label={strings.STATUS_FILTER_LABEL} onChange={handleStatusChange}>
                <MenuItem value="all">{strings.STATUS_ALL}</MenuItem>
                <MenuItem value={bookcarsTypes.AgencyCommissionStatus.Active}>{strings.STATUS_ACTIVE}</MenuItem>
                <MenuItem value={bookcarsTypes.AgencyCommissionStatus.Blocked}>{strings.STATUS_BLOCKED}</MenuItem>
                <MenuItem value={bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp}>{strings.STATUS_NEEDS_FOLLOW_UP}</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={(
                <Switch
                  checked={aboveThreshold}
                  onChange={handleAboveThresholdChange}
                />
              )}
              label={strings.FILTER_ABOVE_THRESHOLD}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{strings.ROWS_PER_PAGE}</InputLabel>
              <Select value={pageSize} label={strings.ROWS_PER_PAGE} onChange={handlePageSizeChange}>
                {[10, 25, 50].map((sizeOption) => (
                  <MenuItem key={sizeOption} value={sizeOption}>{sizeOption}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box className="ac-kpis">
            <Paper elevation={1} className="ac-kpi-card">
              <Typography variant="caption" color="text.secondary">{strings.GROSS_TURNOVER}</Typography>
              <Typography variant="h6">{data ? `${formatNumber(data.summary.grossTurnover, language)} TND` : '-'}</Typography>
            </Paper>
            <Paper elevation={1} className="ac-kpi-card">
              <Typography variant="caption" color="text.secondary">{strings.COMMISSION_DUE}</Typography>
              <Typography variant="h6">{data ? `${formatNumber(data.summary.commissionDue, language)} TND` : '-'}</Typography>
            </Paper>
            <Paper elevation={1} className="ac-kpi-card">
              <Typography variant="caption" color="text.secondary">{strings.COMMISSION_COLLECTED}</Typography>
              <Typography variant="h6">{data ? `${formatNumber(data.summary.commissionCollected, language)} TND` : '-'}</Typography>
            </Paper>
            <Paper elevation={1} className="ac-kpi-card">
              <Typography variant="caption" color="text.secondary">{strings.ABOVE_THRESHOLD_COUNT}</Typography>
              <Typography variant="h6">{data ? data.summary.agenciesAboveThreshold : '-'}</Typography>
            </Paper>
          </Box>

          <Paper elevation={1} className="ac-table">
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              getRowId={(row) => row.agency.id}
              rowCount={rowCount}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={handlePaginationModelChange}
              paginationMode="server"
              disableRowSelectionOnClick
              loading={loading}
              localeText={{ noRowsLabel: aboveThreshold ? strings.EMPTY_THRESHOLD_STATE : strings.EMPTY_STATE }}
            />
          </Paper>

          <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box className="ac-drawer-content">
              {detailLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {!detailLoading && detail && (
                <>
                  <Box className="ac-drawer-header">
                    <Box>
                      <Typography variant="h6">{detail.agency.name}</Typography>
                      <Chip
                        size="small"
                        color={detail.agency.status === bookcarsTypes.AgencyCommissionStatus.Blocked ? 'error' : detail.agency.status === bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp ? 'warning' : 'success'}
                        label={mapStatusToLabel(detail.agency.status)}
                      />
                    </Box>
                    <Button
                      startIcon={detail.agency.status === bookcarsTypes.AgencyCommissionStatus.Blocked ? <LockOpenIcon /> : <BlockIcon />}
                      variant="outlined"
                      onClick={() => selectedAgency && handleToggleBlock(selectedAgency)}
                    >
                      {detail.agency.status === bookcarsTypes.AgencyCommissionStatus.Blocked ? strings.ACTION_UNBLOCK : strings.ACTION_BLOCK}
                    </Button>
                  </Box>

                  <Divider />

                  <Box className="ac-section">
                    <Typography variant="subtitle1">{strings.DRAWER_TITLE_SUMMARY}</Typography>
                    <Box className="ac-summary-grid">
                      <Paper elevation={0} className="ac-kpi-card">
                        <Typography variant="caption" color="text.secondary">{strings.DRAWER_SUMMARY_RESERVATIONS}</Typography>
                        <Typography variant="body1">{detail.summary.reservations}</Typography>
                      </Paper>
                      <Paper elevation={0} className="ac-kpi-card">
                        <Typography variant="caption" color="text.secondary">{strings.DRAWER_SUMMARY_GROSS}</Typography>
                        <Typography variant="body1">{`${formatNumber(detail.summary.grossTurnover, language)} TND`}</Typography>
                      </Paper>
                      <Paper elevation={0} className="ac-kpi-card">
                        <Typography variant="caption" color="text.secondary">{strings.DRAWER_SUMMARY_DUE}</Typography>
                        <Typography variant="body1">{`${formatNumber(detail.summary.commissionDue, language)} TND`}</Typography>
                      </Paper>
                      <Paper elevation={0} className="ac-kpi-card">
                        <Typography variant="caption" color="text.secondary">{strings.DRAWER_SUMMARY_COLLECTED}</Typography>
                        <Typography variant="body1">{`${formatNumber(detail.summary.commissionCollected, language)} TND`}</Typography>
                      </Paper>
                      <Paper elevation={0} className="ac-kpi-card">
                        <Typography variant="caption" color="text.secondary">{strings.DRAWER_SUMMARY_BALANCE}</Typography>
                        <Typography variant="body1">{`${formatNumber(detail.summary.balance, language)} TND`}</Typography>
                      </Paper>
                      <Paper elevation={0} className="ac-kpi-card">
                        <Typography variant="caption" color="text.secondary">{strings.DRAWER_SUMMARY_THRESHOLD}</Typography>
                        <Typography variant="body1">{`${formatNumber(detail.summary.threshold, language)} TND`}</Typography>
                      </Paper>
                    </Box>
                  </Box>

                  <Divider />

                  <Box className="ac-section">
                    <Typography variant="subtitle1">{strings.DRAWER_ACTIONS}</Typography>
                    <Box className="ac-actions">
                      <Button variant="outlined" startIcon={<SendIcon />} onClick={() => selectedAgency && handleOpenReminder(selectedAgency)}>
                        {strings.DRAWER_ACTION_REMIND}
                      </Button>
                      <Button variant="outlined" startIcon={<PaidIcon />} onClick={() => selectedAgency && handleOpenPaymentDialog(selectedAgency)}>
                        {strings.DRAWER_ACTION_PAYMENT}
                      </Button>
                      <Button variant="outlined" startIcon={<NoteAddIcon />} onClick={() => selectedAgency && handleOpenNoteDialog(selectedAgency)}>
                        {strings.DRAWER_ACTION_NOTE}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handleGenerateInvoice}
                        disabled={invoiceLoading}
                      >
                        {strings.DRAWER_ACTION_INVOICE}
                      </Button>
                    </Box>
                  </Box>

                  <Divider />

                  <Box className="ac-section">
                    <Typography variant="subtitle1">{strings.DRAWER_OPERATIONS}</Typography>
                    <Box className="ac-logs">
                      {detail.logs.length === 0 && (
                        <Typography variant="body2" color="text.secondary">{strings.EMPTY_STATE}</Typography>
                      )}
                      {detail.logs.map((log) => (
                        <Box key={log.id} className="ac-log-entry">
                          <Typography variant="subtitle2">{`${mapLogTypeToLabel(log.type)} • ${new Date(log.date).toLocaleString(language)}`}</Typography>
                          {log.admin && (
                            <Typography variant="caption" color="text.secondary">{`${strings.LOG_ADMIN_LABEL} ${log.admin.name}`}</Typography>
                          )}
                          {log.channel && (
                            <Typography variant="caption" color="text.secondary">{`${strings.LOG_CHANNEL_LABEL} ${getReminderChannelLabel(log.channel)}`}</Typography>
                          )}
                          {typeof log.amount === 'number' && (
                            <Typography variant="caption" color="text.secondary">{`${strings.LOG_AMOUNT_LABEL} ${formatNumber(log.amount, language)} TND`}</Typography>
                          )}
                          {log.paymentDate && (
                            <Typography variant="caption" color="text.secondary">{`${strings.LOG_PAYMENT_DATE_LABEL} ${new Date(log.paymentDate).toLocaleDateString(language)}`}</Typography>
                          )}
                          {log.reference && (
                            <Typography variant="caption" color="text.secondary">{`${strings.LOG_REFERENCE_LABEL} ${log.reference}`}</Typography>
                          )}
                          {typeof log.success === 'boolean' && (
                            <Typography variant="caption" color={log.success ? 'success.main' : 'error'}>
                              {`${strings.LOG_STATUS_LABEL} ${log.success ? strings.LOG_STATUS_SUCCESS : strings.LOG_STATUS_FAILURE}`}
                            </Typography>
                          )}
                          {log.note && (
                            <Typography variant="body2">{`${strings.LOG_NOTE_LABEL} ${log.note}`}</Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Divider />

                  <Box className="ac-section">
                    <Typography variant="subtitle1">{strings.DRAWER_BOOKINGS}</Typography>
                    <Box>
                      <DataGrid
                        autoHeight
                        rows={detail.bookings}
                        columns={[
                          { field: 'id', headerName: strings.BOOKING_COLUMN_ID, flex: 1, minWidth: 140 },
                          {
                            field: 'from',
                            headerName: strings.BOOKING_COLUMN_FROM,
                            minWidth: 130,
                            valueFormatter: (params) => {
                              if (!params?.value) {
                                return ''
                              }
                              return new Date(params.value as string).toLocaleDateString(language)
                            },
                          },
                          {
                            field: 'to',
                            headerName: strings.BOOKING_COLUMN_TO,
                            minWidth: 130,
                            valueFormatter: (params) => {
                              if (!params?.value) {
                                return ''
                              }
                              return new Date(params.value as string).toLocaleDateString(language)
                            },
                          },
                          {
                            field: 'totalPrice',
                            headerName: strings.BOOKING_COLUMN_TOTAL,
                            minWidth: 160,
                            valueFormatter: (params) => {
                              return `${formatNumber(Number(params?.value ?? 0), language)} TND`
                            },
                          },
                          {
                            field: 'commission',
                            headerName: strings.BOOKING_COLUMN_COMMISSION,
                            minWidth: 170,
                            valueFormatter: (params) => {
                              return `${formatNumber(Number(params?.value ?? 0), language)} TND`
                            },
                          },
                          {
                            field: 'paymentStatus',
                            headerName: strings.BOOKING_COLUMN_PAYMENT_STATUS,
                            minWidth: 180,
                            renderCell: (params) => (
                              <Chip
                                size="small"
                                color={params.value === bookcarsTypes.CommissionPaymentStatus.Unpaid ? 'error' : params.value === bookcarsTypes.CommissionPaymentStatus.Partial ? 'warning' : 'success'}
                                label={mapPaymentStatusToLabel(params.value as bookcarsTypes.CommissionPaymentStatus)}
                              />
                            ),
                          },
                        ]}
                        getRowId={(row) => row.id}
                        hideFooter
                        disableColumnMenu
                        disableRowSelectionOnClick
                      />
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Drawer>

          <Dialog open={reminderDialogOpen} onClose={() => setReminderDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>{strings.REMINDER_DIALOG_TITLE}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{strings.REMINDER_DIALOG_CHANNEL}</InputLabel>
                <Select
                  value={reminderChannel}
                  label={strings.REMINDER_DIALOG_CHANNEL}
                  onChange={handleReminderChannelChange}
                >
                  <MenuItem value={bookcarsTypes.CommissionReminderChannel.Email}>{strings.REMINDER_CHANNEL_EMAIL}</MenuItem>
                  <MenuItem value={bookcarsTypes.CommissionReminderChannel.Sms}>{strings.REMINDER_CHANNEL_SMS}</MenuItem>
                  <MenuItem value={bookcarsTypes.CommissionReminderChannel.EmailAndSms}>{strings.REMINDER_CHANNEL_EMAIL_SMS}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={strings.REMINDER_DIALOG_SUBJECT}
                value={reminderSubject}
                onChange={(event) => setReminderSubject(event.target.value)}
                fullWidth
              />
              <TextField
                label={strings.REMINDER_DIALOG_MESSAGE}
                value={reminderMessage}
                onChange={(event) => setReminderMessage(event.target.value)}
                fullWidth
                multiline
                minRows={5}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReminderDialogOpen(false)}>{strings.CANCEL}</Button>
              <Button variant="contained" onClick={handleSendReminder}>{strings.REMINDER_DIALOG_SEND}</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} fullWidth maxWidth="xs">
            <DialogTitle>{strings.PAYMENT_DIALOG_TITLE}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={strings.PAYMENT_DIALOG_AMOUNT}
                value={paymentAmount}
                type="number"
                onChange={(event) => setPaymentAmount(event.target.value)}
                fullWidth
              />
              <TextField
                label={strings.PAYMENT_DIALOG_DATE}
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label={strings.PAYMENT_DIALOG_REFERENCE}
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPaymentDialogOpen(false)}>{strings.CANCEL}</Button>
              <Button variant="contained" onClick={handleRecordPayment}>{strings.PAYMENT_DIALOG_CONFIRM}</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>{strings.NOTE_DIALOG_TITLE}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                multiline
                minRows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={strings.NOTE_DIALOG_PLACEHOLDER}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNoteDialogOpen(false)}>{strings.CANCEL}</Button>
              <Button variant="contained" onClick={handleSaveNote}>{strings.NOTE_DIALOG_CONFIRM}</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={blockConfirmOpen} onClose={() => setBlockConfirmOpen(false)}>
            <DialogTitle>{selectedAgency && selectedAgency.status === bookcarsTypes.AgencyCommissionStatus.Blocked ? strings.UNBLOCK_CONFIRM_TITLE : strings.BLOCK_CONFIRM_TITLE}</DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                {selectedAgency && selectedAgency.status === bookcarsTypes.AgencyCommissionStatus.Blocked
                  ? strings.UNBLOCK_CONFIRM_MESSAGE
                  : strings.BLOCK_CONFIRM_MESSAGE}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBlockConfirmOpen(false)}>{strings.CANCEL}</Button>
              <Button variant="contained" color="error" onClick={confirmToggleBlock}>{strings.CONFIRM}</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>{strings.SETTINGS_DIALOG_TITLE}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{strings.SETTINGS_CHANNEL_LABEL}</InputLabel>
                <Select
                  value={settings?.reminderChannel || bookcarsTypes.CommissionReminderChannel.Email}
                  label={strings.SETTINGS_CHANNEL_LABEL}
                  onChange={(event) => updateSettingsField('reminderChannel', event.target.value as bookcarsTypes.CommissionReminderChannel)}
                >
                  <MenuItem value={bookcarsTypes.CommissionReminderChannel.Email}>{strings.REMINDER_CHANNEL_EMAIL}</MenuItem>
                  <MenuItem value={bookcarsTypes.CommissionReminderChannel.Sms}>{strings.REMINDER_CHANNEL_SMS}</MenuItem>
                  <MenuItem value={bookcarsTypes.CommissionReminderChannel.EmailAndSms}>{strings.REMINDER_CHANNEL_EMAIL_SMS}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={strings.SETTINGS_EMAIL_TEMPLATE}
                multiline
                minRows={4}
                value={settings?.emailTemplate || ''}
                onChange={(event) => updateSettingsField('emailTemplate', event.target.value)}
                fullWidth
              />
              <TextField
                label={strings.SETTINGS_SMS_TEMPLATE}
                multiline
                minRows={3}
                value={settings?.smsTemplate || ''}
                onChange={(event) => updateSettingsField('smsTemplate', event.target.value)}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSettingsOpen(false)}>{strings.CANCEL}</Button>
              <Button variant="contained" onClick={handleSaveSettings}>{strings.SETTINGS_SAVE}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Layout>
  )
}

export default AgencyCommissions
