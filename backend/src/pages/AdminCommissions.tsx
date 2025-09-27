import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined'
import CloseIcon from '@mui/icons-material/Close'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/admin-commissions'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import * as CommissionService from '@/services/CommissionService'

type Filters = {
  status: 'all' | 'active' | 'blocked' | 'follow_up'
  aboveThreshold: boolean
  month: number
  year: number
  query: string
  page: number
  pageSize: number
}

type ReminderChannel = 'email' | 'sms' | 'both'

const formatter = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 })

const formatCurrency = (value: number) => `${formatter.format(Math.round(value || 0))} TND`

const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
}

const PAYMENT_STATUS_COLOR: Record<bookcarsTypes.AgencyCommissionPaymentStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  [bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid]: 'error',
  [bookcarsTypes.AgencyCommissionPaymentStatus.FollowUp]: 'warning',
  [bookcarsTypes.AgencyCommissionPaymentStatus.Partial]: 'info',
  [bookcarsTypes.AgencyCommissionPaymentStatus.Paid]: 'success',
}

const CHANNEL_OPTIONS: Array<{ value: ReminderChannel; label: string }> = [
  { value: 'email', label: strings.REMINDER_CHANNEL_EMAIL },
  { value: 'sms', label: strings.REMINDER_CHANNEL_SMS },
  { value: 'both', label: strings.REMINDER_CHANNEL_BOTH },
]

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const mapLocale = (language?: string) => LOCALE_MAP[language || 'fr'] || 'fr-FR'

const applyTemplate = (
  template: string,
  agency: bookcarsTypes.AgencyCommissionAgencySummary,
  data: bookcarsTypes.GetAdminCommissionsResponse,
) => {
  const months = strings.MONTHS as string[]
  const variables: Record<string, string> = {
    agency_name: agency.supplier.fullName || '',
    month_label: months[data.month] || `${data.month + 1}`,
    year: String(data.year),
    commission_due: formatter.format(Math.round(agency.commissionDue || 0)),
    threshold: formatter.format(Math.round(data.threshold || 0)),
    payment_link: `${window.location.origin}/payments`,
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => variables[key] ?? '')
}

const AdminCommissions = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [filters, setFilters] = useState<Filters>(() => ({
    status: 'all',
    aboveThreshold: false,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    query: '',
    page: 1,
    pageSize: 25,
  }))
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<bookcarsTypes.GetAdminCommissionsResponse | null>(null)
  const [selected, setSelected] = useState<bookcarsTypes.AgencyCommissionAgencySummary | null>(null)
  const [settings, setSettings] = useState<bookcarsTypes.AgencyCommissionSettings | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [noteValue, setNoteValue] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [reminderForm, setReminderForm] = useState<{ channel: ReminderChannel; emailSubject: string; emailBody: string; smsBody: string }>(() => ({
    channel: 'email',
    emailSubject: '',
    emailBody: '',
    smsBody: '',
  }))
  const [reminderLoading, setReminderLoading] = useState(false)
  const [statusForm, setStatusForm] = useState<{ status: bookcarsTypes.AgencyCommissionPaymentStatus; amountPaid: string; note: string }>(() => ({
    status: bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid,
    amountPaid: '',
    note: '',
  }))
  const [statusLoading, setStatusLoading] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [csvLoading, setCsvLoading] = useState(false)

  const months = strings.MONTHS as string[]
  const locale = mapLocale(user?.language)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 400)

    return () => {
      window.clearTimeout(handle)
    }
  }, [search])

  useEffect(() => {
    setFilters((prev) => ({ ...prev, query: debouncedSearch, page: 1 }))
  }, [debouncedSearch])

  const loadSettings = async () => {
    try {
      setSettingsLoading(true)
      const data = await CommissionService.getCommissionSettings()
      setSettings(data)
    } catch (err) {
      helper.error(err, strings.SETTINGS_ERROR)
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleLoad = async (_user?: bookcarsTypes.User) => {
    if (!_user || !helper.admin(_user)) {
      navigate('/sign-in')
      return
    }

    setUser(_user)

    try {
      const data = await CommissionService.getCommissionSettings()
      setSettings(data)
    } catch (err) {
      helper.error(err)
    }
  }

  const fetchCommissions = async (nextFilters?: Partial<Filters>, showLoader = true) => {
    if (!user || !helper.admin(user)) {
      return
    }

    const updatedFilters = nextFilters ? { ...filters, ...nextFilters } : filters
    if (nextFilters) {
      setFilters(updatedFilters)
    }

    try {
      if (showLoader) {
        setLoading(true)
      }

      const data = await CommissionService.getAdminCommissions({ filters: updatedFilters })
      setResponse(data)

      if (selected) {
        const updatedSelection = data.agencies.find((agency) => agency.stateId === selected.stateId) || null
        setSelected(updatedSelection)
      }
    } catch (err) {
      helper.error(err)
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!user || !helper.admin(user)) {
      return
    }

    fetchCommissions(undefined, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters.month, filters.year, filters.status, filters.aboveThreshold, filters.page, filters.pageSize, filters.query])

  const handleMonthChange = (delta: number) => {
    setFilters((prev) => {
      const nextDate = new Date(prev.year, prev.month + delta, 1)
      return {
        ...prev,
        month: nextDate.getMonth(),
        year: nextDate.getFullYear(),
        page: 1,
      }
    })
  }

  const handleOpenDrawer = (agency: bookcarsTypes.AgencyCommissionAgencySummary) => {
    setSelected(agency)
  }

  const handleCloseDrawer = () => {
    setSelected(null)
    setNoteValue('')
  }

  const handleReminderOpen = (agency: bookcarsTypes.AgencyCommissionAgencySummary) => {
    if (!response) {
      return
    }

    setSelected(agency)
    const baseSettings = settings
    setReminderForm({
      channel: 'email',
      emailSubject: baseSettings ? applyTemplate(baseSettings.email_subject || '', agency, response) : '',
      emailBody: baseSettings ? applyTemplate(baseSettings.email_body || '', agency, response) : '',
      smsBody: baseSettings ? applyTemplate(baseSettings.sms_body || '', agency, response) : '',
    })
    setReminderOpen(true)
  }

  const handleReminderSubmit = async () => {
    if (!selected) {
      return
    }

    try {
      setReminderLoading(true)
      await CommissionService.sendAgencyCommissionReminder(selected.stateId, reminderForm)
      helper.info(strings.REMINDER_SUCCESS)
      setReminderOpen(false)
      await fetchCommissions(undefined, false)
    } catch (err) {
      helper.error(err, strings.REMINDER_ERROR)
    } finally {
      setReminderLoading(false)
    }
  }

  const handleStatusOpen = (agency: bookcarsTypes.AgencyCommissionAgencySummary) => {
    setSelected(agency)
    setStatusForm({
      status: agency.paymentStatus,
      amountPaid: agency.commissionPaid ? String(Math.round(agency.commissionPaid)) : '',
      note: '',
    })
    setStatusOpen(true)
  }

  const handleStatusSubmit = async () => {
    if (!selected) {
      return
    }

    try {
      setStatusLoading(true)
      await CommissionService.updateAgencyCommissionStatus(selected.stateId, {
        status: statusForm.status,
        amountPaid: statusForm.amountPaid ? Number.parseFloat(statusForm.amountPaid) : undefined,
        note: statusForm.note?.trim() || undefined,
      })
      helper.info(strings.STATUS_SUCCESS)
      setStatusOpen(false)
      await fetchCommissions(undefined, false)
    } catch (err) {
      helper.error(err, strings.STATUS_ERROR)
    } finally {
      setStatusLoading(false)
    }
  }

  const handleBlockToggle = async (agency: bookcarsTypes.AgencyCommissionAgencySummary, blocked: boolean) => {
    try {
      setBlockLoading(true)
      await CommissionService.toggleAgencyCommissionBlock(agency.stateId, {
        blocked,
      })
      helper.info(strings.BLOCK_SUCCESS)
      await fetchCommissions(undefined, false)
    } catch (err) {
      helper.error(err, strings.BLOCK_ERROR)
    } finally {
      setBlockLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!selected || !noteValue.trim()) {
      return
    }

    try {
      setNoteLoading(true)
      await CommissionService.addAgencyCommissionNote(selected.stateId, { message: noteValue.trim() })
      helper.info(strings.NOTE_SUCCESS)
      setNoteValue('')
      await fetchCommissions(undefined, false)
    } catch (err) {
      helper.error(err, strings.NOTE_ERROR)
    } finally {
      setNoteLoading(false)
    }
  }

  const handleSettingsOpen = async () => {
    if (!settings) {
      await loadSettings()
    }
    setSettingsOpen(true)
  }

  const handleSettingsSave = async () => {
    if (!settings) {
      return
    }

    try {
      setSettingsLoading(true)
      const updated = await CommissionService.updateCommissionSettings({
        email_subject: settings.email_subject,
        email_body: settings.email_body,
        sms_body: settings.sms_body,
        from_email: settings.from_email,
        from_name: settings.from_name,
        from_sms_sender: settings.from_sms_sender,
      })
      setSettings(updated)
      helper.info(strings.SETTINGS_SUCCESS)
      setSettingsOpen(false)
    } catch (err) {
      helper.error(err, strings.SETTINGS_ERROR)
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleExportCsv = async () => {
    if (!user || !helper.admin(user)) {
      return
    }

    try {
      setCsvLoading(true)
      const total = response?.total || filters.pageSize
      const exportData = await CommissionService.getAdminCommissions({
        filters: {
          ...filters,
          page: 1,
          pageSize: Math.max(total, filters.pageSize),
        },
      })

      const rows = exportData.agencies.map((agency) => {
        const lastReminder = [agency.reminders.lastEmailAt, agency.reminders.lastSmsAt]
          .filter(Boolean)
          .map((value) => new Date(String(value)))
          .sort((a, b) => b.getTime() - a.getTime())[0]

        return {
          agency_id: agency.supplier._id,
          agency_name: agency.supplier.fullName,
          reservations_count: agency.bookingsCount,
          ca_brut: Math.round(agency.grossTotal),
          commission_due: Math.round(agency.commissionDue),
          commission_paid: Math.round(agency.commissionPaid),
          payment_status: agency.paymentStatus,
          blocked: agency.blocked,
          over_threshold: agency.overThreshold,
          last_reminder_at: lastReminder ? lastReminder.toISOString() : '',
        }
      })

      const headers = Object.keys(rows[0] || {})
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => headers.map((header) => String((row as Record<string, unknown>)[header] ?? '')).join(',')),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const monthLabel = months[exportData.month] || `${exportData.month + 1}`
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', strings.CSV_FILENAME.replace('{year}', String(exportData.year)).replace('{month}', monthLabel))
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      helper.error(err)
    } finally {
      setCsvLoading(false)
    }
  }

  const page = filters.page - 1
  const rowsPerPage = filters.pageSize
  const agencies = response?.agencies || []
  const summary = response?.summary
  const threshold = response?.threshold || env.COMMISSION_MONTHLY_THRESHOLD || 0
  const monthLabel = months[filters.month] || `${filters.month + 1}`

  return (
    <Layout onLoad={handleLoad} strict admin>
      <Box padding={3} display="flex" flexDirection="column" gap={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={700}>{strings.PAGE_TITLE}</Typography>
            <Typography variant="subtitle2" color="text.secondary">{strings.HEADER_TITLE}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              onClick={handleExportCsv}
              disabled={loading || csvLoading || !response}
            >
              {csvLoading ? '...' : strings.EXPORT_CSV}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SettingsOutlinedIcon />}
              onClick={handleSettingsOpen}
            >
              {strings.SETTINGS_BUTTON}
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ padding: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={strings.FILTER_SEARCH_PLACEHOLDER}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>{strings.FILTER_STATUS_LABEL}</InputLabel>
                <Select
                  label={strings.FILTER_STATUS_LABEL}
                  value={filters.status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as Filters['status'], page: 1 }))}
                >
                  <MenuItem value="all">{strings.STATUS_ALL}</MenuItem>
                  <MenuItem value="active">{strings.STATUS_ACTIVE}</MenuItem>
                  <MenuItem value="blocked">{strings.STATUS_BLOCKED}</MenuItem>
                  <MenuItem value="follow_up">{strings.STATUS_FOLLOW_UP}</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Checkbox
                  checked={filters.aboveThreshold}
                  onChange={(event) => setFilters((prev) => ({ ...prev, aboveThreshold: event.target.checked, page: 1 }))}
                />
                <Typography variant="body2">{strings.ABOVE_THRESHOLD} ({formatCurrency(threshold)})</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={() => handleMonthChange(-1)} aria-label={strings.PREVIOUS_MONTH}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>{monthLabel} {filters.year}</Typography>
              <IconButton onClick={() => handleMonthChange(1)} aria-label={strings.NEXT_MONTH}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{strings.PAGE_SIZE_LABEL}</InputLabel>
              <Select
                label={strings.PAGE_SIZE_LABEL}
                value={filters.pageSize}
                onChange={(event) => setFilters((prev) => ({ ...prev, pageSize: Number.parseInt(event.target.value as string, 10), page: 1 }))}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">{strings.KPI_GROSS}</Typography>
                {loading && !summary ? <Skeleton height={36} width="60%" /> : <Typography variant="h5" fontWeight={700}>{formatCurrency(summary?.grossRevenue || 0)}</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">{strings.KPI_COMMISSION_DUE}</Typography>
                {loading && !summary ? <Skeleton height={36} width="60%" /> : <Typography variant="h5" fontWeight={700}>{formatCurrency(summary?.commissionDue || 0)}</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">{strings.KPI_COMMISSION_COLLECTED}</Typography>
                {loading && !summary ? <Skeleton height={36} width="60%" /> : <Typography variant="h5" fontWeight={700}>{formatCurrency(summary?.commissionCollected || 0)}</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">{strings.KPI_OVER_THRESHOLD}</Typography>
                {loading && !summary ? <Skeleton height={36} width="60%" /> : <Typography variant="h5" fontWeight={700}>{summary?.agenciesOverThreshold || 0}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{strings.TABLE_AGENCY}</TableCell>
                <TableCell align="right">{strings.TABLE_BOOKINGS}</TableCell>
                <TableCell align="right">{strings.TABLE_GROSS}</TableCell>
                <TableCell align="right">{strings.TABLE_COMMISSION_DUE}</TableCell>
                <TableCell align="right">{strings.TABLE_COMMISSION_PAID}</TableCell>
                <TableCell>{strings.TABLE_PAYMENT_STATUS}</TableCell>
                <TableCell>{strings.TABLE_AGENCY_STATUS}</TableCell>
                <TableCell align="center">{strings.TABLE_ACTIONS}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !response ? (
                Array.from({ length: filters.pageSize }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <TableCell key={`cell-${cellIndex}`}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : agencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {strings.EMPTY_STATE.replace('{month}', monthLabel).replace('{year}', String(filters.year))}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                agencies.map((agency) => (
                  <TableRow key={agency.stateId} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={600}>{agency.supplier.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">{agency.supplier._id}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{agency.bookingsCount}</TableCell>
                    <TableCell align="right">{formatCurrency(agency.grossTotal)}</TableCell>
                    <TableCell align="right">{formatCurrency(agency.commissionDue)}</TableCell>
                    <TableCell align="right">{formatCurrency(agency.commissionPaid)}</TableCell>
                    <TableCell>
                      <Chip
                        label={(strings.PAYMENT_STATUS_LABELS as Record<bookcarsTypes.AgencyCommissionPaymentStatus, string>)[agency.paymentStatus]}
                        color={PAYMENT_STATUS_COLOR[agency.paymentStatus]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={agency.blocked ? strings.AGENCY_STATUS_BLOCKED : strings.AGENCY_STATUS_ACTIVE}
                        color={agency.blocked ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title={strings.ACTION_VIEW_DETAILS}>
                          <IconButton onClick={() => handleOpenDrawer(agency)}>
                            <VisibilityOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={strings.ACTION_SEND_REMINDER}>
                          <IconButton onClick={() => handleReminderOpen(agency)}>
                            <CampaignOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={strings.ACTION_UPDATE_STATUS}>
                          <IconButton onClick={() => handleStatusOpen(agency)}>
                            <PaidOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={agency.blocked ? strings.ACTION_UNBLOCK : strings.ACTION_BLOCK}>
                          <span>
                            <IconButton
                              onClick={() => handleBlockToggle(agency, !agency.blocked)}
                              disabled={blockLoading}
                              color={agency.blocked ? 'success' : 'default'}
                            >
                              {agency.blocked ? <CheckCircleOutlineIcon /> : <BlockOutlinedIcon />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={response?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setFilters((prev) => ({ ...prev, page: newPage + 1 }))}
            onRowsPerPageChange={(event) => setFilters((prev) => ({ ...prev, pageSize: Number.parseInt(event.target.value, 10), page: 1 }))}
            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          />
        </Paper>
      </Box>

      <Drawer anchor="right" open={Boolean(selected)} onClose={handleCloseDrawer} PaperProps={{ sx: { width: { xs: '100%', md: 480 } } }}>
        {selected && (
          <Box height="100%" display="flex" flexDirection="column">
            <Stack direction="row" justifyContent="space-between" alignItems="center" padding={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>{strings.DRAWER_TITLE.replace('{month}', monthLabel).replace('{year}', String(filters.year))}</Typography>
                <Typography variant="subtitle2" color="text.secondary">{selected.supplier.fullName}</Typography>
              </Box>
              <IconButton onClick={handleCloseDrawer}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Divider />

            <Box padding={2} display="flex" flexDirection="column" gap={2} sx={{ overflowY: 'auto', flexGrow: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{strings.DRAWER_CONTACT}</Typography>
                <Stack spacing={0.5}>
                  {selected.supplier.email && (
                    <Typography variant="body2">{strings.DRAWER_CONTACT_EMAIL}: {selected.supplier.email}</Typography>
                  )}
                  {selected.supplier.phone && (
                    <Typography variant="body2">{strings.DRAWER_CONTACT_PHONE}: {selected.supplier.phone}</Typography>
                  )}
                </Stack>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">{strings.DRAWER_KPI_BOOKINGS}</Typography>
                      <Typography variant="h6" fontWeight={700}>{selected.bookingsCount}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">{strings.DRAWER_KPI_GROSS}</Typography>
                      <Typography variant="h6" fontWeight={700}>{formatCurrency(selected.grossTotal)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">{strings.DRAWER_KPI_DUE}</Typography>
                      <Typography variant="h6" fontWeight={700}>{formatCurrency(selected.commissionDue)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">{strings.DRAWER_KPI_STATUS}</Typography>
                      <Chip
                        label={(strings.PAYMENT_STATUS_LABELS as Record<bookcarsTypes.AgencyCommissionPaymentStatus, string>)[selected.paymentStatus]}
                        color={PAYMENT_STATUS_COLOR[selected.paymentStatus]}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<CampaignOutlinedIcon />} onClick={() => handleReminderOpen(selected)}>
                  {strings.DRAWER_ACTION_SEND_REMINDER}
                </Button>
                <Button variant="outlined" startIcon={<PaidOutlinedIcon />} onClick={() => handleStatusOpen(selected)}>
                  {strings.DRAWER_ACTION_MARK_PAYMENT}
                </Button>
                <Button
                  variant={selected.blocked ? 'contained' : 'outlined'}
                  color={selected.blocked ? 'success' : 'error'}
                  startIcon={selected.blocked ? <CheckCircleOutlineIcon /> : <BlockOutlinedIcon />}
                  onClick={() => handleBlockToggle(selected, !selected.blocked)}
                  disabled={blockLoading}
                >
                  {selected.blocked ? strings.DRAWER_BLOCK_BUTTON_UNBLOCK : strings.DRAWER_BLOCK_BUTTON_BLOCK}
                </Button>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{strings.DRAWER_NOTES_TITLE}</Typography>
                <Stack spacing={1}>
                  <TextField
                    value={noteValue}
                    onChange={(event) => setNoteValue(event.target.value)}
                    placeholder={strings.NOTE_PLACEHOLDER}
                    multiline
                    minRows={3}
                  />
                  <Button
                    variant="contained"
                    startIcon={<NoteAddOutlinedIcon />}
                    onClick={handleAddNote}
                    disabled={noteLoading || !noteValue.trim()}
                  >
                    {noteLoading ? '...' : strings.NOTE_SUBMIT}
                  </Button>
                  <Stack spacing={1}>
                    {(selected.notes || []).map((note) => (
                      <Box key={note._id} sx={{ backgroundColor: '#f5f7fb', borderRadius: 2, padding: 1.5 }}>
                        <Typography variant="body2">{note.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(note.createdAt).toLocaleString(locale)}
                          {note.createdBy?.fullName ? ` • ${note.createdBy.fullName}` : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{strings.DRAWER_LOGS_TITLE}</Typography>
                <Stack spacing={1}>
                  {(selected.logs || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary">{strings.DRAWER_LOG_EMPTY}</Typography>
                  )}
                  {(selected.logs || []).map((log) => (
                    <Box key={log._id} sx={{ borderLeft: '3px solid #0A66FF', paddingLeft: 1.5 }}>
                      <Typography variant="body2">{log.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.createdAt).toLocaleString(locale)}
                        {log.createdBy?.fullName ? ` • ${log.createdBy.fullName}` : ''}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{strings.DRAWER_BOOKINGS_TITLE}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{strings.BOOKING_ID}</TableCell>
                      <TableCell>{strings.BOOKING_FROM}</TableCell>
                      <TableCell>{strings.BOOKING_TO}</TableCell>
                      <TableCell align="right">{strings.BOOKING_TOTAL}</TableCell>
                      <TableCell align="right">{strings.BOOKING_COMMISSION}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selected.bookings.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell>{booking.bookingId}</TableCell>
                        <TableCell>{new Date(booking.from).toLocaleDateString(locale)}</TableCell>
                        <TableCell>{new Date(booking.to).toLocaleDateString(locale)}</TableCell>
                        <TableCell align="right">{formatCurrency(booking.totalClient)}</TableCell>
                        <TableCell align="right">{formatCurrency(booking.commission)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={reminderOpen} onClose={() => setReminderOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{strings.REMINDER_DIALOG_TITLE}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl>
              <Typography variant="subtitle2" gutterBottom>{strings.REMINDER_CHANNEL}</Typography>
              <ToggleButtonGroup
                exclusive
                value={reminderForm.channel}
                onChange={(_, value: ReminderChannel) => {
                  if (value) {
                    setReminderForm((prev) => ({ ...prev, channel: value }))
                  }
                }}
                size="small"
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <ToggleButton key={option.value} value={option.value}>{option.label}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </FormControl>
            <TextField
              label={strings.REMINDER_SUBJECT_LABEL}
              value={reminderForm.emailSubject}
              onChange={(event) => setReminderForm((prev) => ({ ...prev, emailSubject: event.target.value }))}
              fullWidth
            />
            <TextField
              label={strings.REMINDER_EMAIL_LABEL}
              value={reminderForm.emailBody}
              onChange={(event) => setReminderForm((prev) => ({ ...prev, emailBody: event.target.value }))}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label={strings.REMINDER_SMS_LABEL}
              value={reminderForm.smsBody}
              onChange={(event) => setReminderForm((prev) => ({ ...prev, smsBody: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderOpen(false)}>{strings.REMINDER_CANCEL}</Button>
          <Button variant="contained" onClick={handleReminderSubmit} disabled={reminderLoading}>
            {reminderLoading ? '...' : strings.REMINDER_SEND}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{strings.STATUS_DIALOG_TITLE}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>{strings.STATUS_SELECT_LABEL}</InputLabel>
              <Select
                label={strings.STATUS_SELECT_LABEL}
                value={statusForm.status}
                onChange={(event) => setStatusForm((prev) => ({ ...prev, status: event.target.value as bookcarsTypes.AgencyCommissionPaymentStatus }))}
              >
                <MenuItem value={bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid}>{strings.PAYMENT_STATUS_LABELS.unpaid}</MenuItem>
                <MenuItem value={bookcarsTypes.AgencyCommissionPaymentStatus.FollowUp}>{strings.PAYMENT_STATUS_LABELS.follow_up}</MenuItem>
                <MenuItem value={bookcarsTypes.AgencyCommissionPaymentStatus.Partial}>{strings.PAYMENT_STATUS_LABELS.partial}</MenuItem>
                <MenuItem value={bookcarsTypes.AgencyCommissionPaymentStatus.Paid}>{strings.PAYMENT_STATUS_LABELS.paid}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={strings.STATUS_AMOUNT_LABEL}
              value={statusForm.amountPaid}
              onChange={(event) => setStatusForm((prev) => ({ ...prev, amountPaid: event.target.value }))}
              type="number"
            />
            <TextField
              label={strings.STATUS_NOTE_LABEL}
              value={statusForm.note}
              onChange={(event) => setStatusForm((prev) => ({ ...prev, note: event.target.value }))}
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusOpen(false)}>{strings.STATUS_CANCEL}</Button>
          <Button variant="contained" onClick={handleStatusSubmit} disabled={statusLoading}>
            {statusLoading ? '...' : strings.STATUS_SAVE}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{strings.SETTINGS_TITLE}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label={strings.SETTINGS_EMAIL_SUBJECT}
              value={settings?.email_subject || ''}
              onChange={(event) => setSettings((prev) => (prev ? { ...prev, email_subject: event.target.value } : prev))}
            />
            <TextField
              label={strings.SETTINGS_EMAIL_BODY}
              value={settings?.email_body || ''}
              onChange={(event) => setSettings((prev) => (prev ? { ...prev, email_body: event.target.value } : prev))}
              multiline
              minRows={4}
            />
            <TextField
              label={strings.SETTINGS_SMS_BODY}
              value={settings?.sms_body || ''}
              onChange={(event) => setSettings((prev) => (prev ? { ...prev, sms_body: event.target.value } : prev))}
              multiline
              minRows={3}
            />
            <TextField
              label={strings.SETTINGS_FROM_EMAIL}
              value={settings?.from_email || ''}
              onChange={(event) => setSettings((prev) => (prev ? { ...prev, from_email: event.target.value } : prev))}
            />
            <TextField
              label={strings.SETTINGS_FROM_NAME}
              value={settings?.from_name || ''}
              onChange={(event) => setSettings((prev) => (prev ? { ...prev, from_name: event.target.value } : prev))}
            />
            <TextField
              label={strings.SETTINGS_SMS_SENDER}
              value={settings?.from_sms_sender || ''}
              onChange={(event) => setSettings((prev) => (prev ? { ...prev, from_sms_sender: event.target.value } : prev))}
            />
            {settings?.updated_at && (
              <Typography variant="caption" color="text.secondary">
                {strings.SETTINGS_UPDATED_AT.replace('{date}', new Date(settings.updated_at).toLocaleString(locale))}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>{strings.SETTINGS_CANCEL}</Button>
          <Button variant="contained" onClick={handleSettingsSave} disabled={settingsLoading}>
            {settingsLoading ? '...' : strings.SETTINGS_SAVE}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}

export default AdminCommissions
