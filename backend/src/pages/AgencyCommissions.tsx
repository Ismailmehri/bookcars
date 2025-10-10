import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Avatar,
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Link,
  Menu,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { SelectChangeEvent } from '@mui/material/Select'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Paid as PaidIcon,
  Payment as PaymentIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Settings as SettingsIcon,
  NoteAdd as NoteAddIcon,
  PictureAsPdf as PictureAsPdfIcon,
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Fingerprint as FingerprintIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  QrCode2 as QrCode2Icon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material'
import validator from 'validator'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import Layout from '@/components/Layout'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import { strings } from '@/lang/agency-commissions'
import { strings as commonStrings } from '@/lang/common'
import * as CommissionService from '@/services/CommissionService'

import '@/assets/css/agency-commissions.css'

/** ---------- FIX ESLint: move nested component out ---------- */
type ContactInfoRowProps = {
  icon: React.ReactNode
  label: string
  value?: string
  href?: string
  /** Texte affiché quand value est vide */
  emptyText?: string
}

const ContactInfoRow: React.FC<ContactInfoRowProps> = ({
  icon,
  label,
  value,
  href,
  emptyText = strings.DRAWER_CONTACT_NONE,
}) => (
  <Box className="ac-contact-row">
    <Box>{icon}</Box>
    <Box className="ac-contact-value">
      <Typography variant="caption" className="ac-contact-label">
        {label}
      </Typography>
      {value ? (
        href ? (
          <a className="ac-contact-link" href={href} target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          <Typography variant="body2">{value}</Typography>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      )}
    </Box>
  </Box>
)
/** ----------------------------------------------------------- */

type RibField = 'accountHolder' | 'bankName' | 'bankAddress' | 'iban' | 'bic' | 'accountNumber'

const EMPTY_RIB_DETAILS: Record<RibField, string> = {
  accountHolder: '',
  bankName: '',
  bankAddress: '',
  iban: '',
  bic: '',
  accountNumber: '',
}

const RIB_BIC_REGEX = /^[A-Za-z]{4}[A-Za-z]{2}[0-9A-Za-z]{2}([0-9A-Za-z]{3})?$/

const EMPTY_RIB_ERRORS: Record<RibField, boolean> = {
  accountHolder: false,
  bankName: false,
  bankAddress: false,
  iban: false,
  bic: false,
  accountNumber: false,
}

const hasRibDetails = (details?: bookcarsTypes.CommissionRibDetails | null) => {
  if (!details) {
    return false
  }

  return Boolean(
    details.accountHolder
    || details.bankName
    || details.bankAddress
    || details.iban
    || details.bic
    || details.accountNumber,
  )
}

const buildMonthLabel = (month: number, year: number, language: string) => {
  const date = new Date(Date.UTC(year, month - 1, 1))
  const label = date.toLocaleString(language, { month: 'long' })
  return bookcarsHelper.capitalize(label)
}

const formatNumber = (value: number, language: string) => bookcarsHelper.formatNumber(Math.round(value), language)

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
  const [withCarryOver, setWithCarryOver] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [data, setData] = useState<bookcarsTypes.AgencyCommissionListResponse>()
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<bookcarsTypes.AgencyCommissionRow | null>(null)
  const [detail, setDetail] = useState<bookcarsTypes.AgencyCommissionDetail>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [settings, setSettings] = useState<bookcarsTypes.CommissionSettings>()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [ribErrors, setRibErrors] = useState<Record<RibField, boolean>>({ ...EMPTY_RIB_ERRORS })
  const ribHasDetails = useMemo(
    () => hasRibDetails(settings?.bankTransferRibDetails),
    [settings],
  )
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
  const [paymentMenuAnchorEl, setPaymentMenuAnchorEl] = useState<null | HTMLElement>(null)
  const paymentMenuOpen = Boolean(paymentMenuAnchorEl)
  const [bankTransferDialogOpen, setBankTransferDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [note, setNote] = useState('')
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)

  const detailRequestRef = useRef(0)

  const language = user?.language || env.DEFAULT_LANGUAGE

  const monthOptions = useMemo(() => Array.from({ length: 12 }).map((_, index) => ({
    value: index + 1,
    label: buildMonthLabel(index + 1, year, language),
  })), [language, year])

  const activeAgency = useMemo<bookcarsTypes.AgencyCommissionDetail['agency'] | undefined>(() => {
    if (detail?.agency) {
      return detail.agency
    }

    if (selectedAgency) {
      return {
        ...selectedAgency.agency,
        status: selectedAgency.status,
        blocked: selectedAgency.status === bookcarsTypes.AgencyCommissionStatus.Blocked,
      }
    }

    return undefined
  }, [detail, selectedAgency])

  const summary = useMemo<bookcarsTypes.AgencyCommissionDetailSummary | undefined>(() => {
    if (detail?.summary) {
      return detail.summary
    }

    if (selectedAgency && data?.summary) {
      const { threshold } = data.summary

      return {
        // champs provenant de selectedAgency
        reservations: selectedAgency.reservations,
        grossTurnover: selectedAgency.grossTurnover,
        commissionDue: selectedAgency.commissionDue,
        commissionCollected: selectedAgency.commissionCollected,
        balance: selectedAgency.balance,
        aboveThreshold: selectedAgency.aboveThreshold,
        carryOver: selectedAgency.carryOver,
        totalToPay: selectedAgency.totalToPay,
        payable: selectedAgency.payable,
        periodClosed: selectedAgency.periodClosed,
        threshold
      }
    }

    return undefined
  }, [data?.summary, detail, selectedAgency])

  const logs = detail?.logs || []
  const bookings = detail?.bookings || []
  const currentStatus = activeAgency?.status
    ?? selectedAgency?.status
    ?? bookcarsTypes.AgencyCommissionStatus.Active
  const isAwaitingDetail = detailLoading && !detail
  const showDetailError = detailError && !detail
  const isBlocked = currentStatus === bookcarsTypes.AgencyCommissionStatus.Blocked

  const getStatusChipColor = (status: bookcarsTypes.AgencyCommissionStatus) => {
    if (status === bookcarsTypes.AgencyCommissionStatus.Blocked) {
      return 'error'
    }

    if (status === bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp) {
      return 'warning'
    }

    return 'success'
  }

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
    withCarryOver,
  }), [month, year, search, statusFilter, aboveThreshold, withCarryOver])

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

  const handleWithCarryOverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWithCarryOver(event.target.checked)
    resetPagination()
  }

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value))
    resetPagination()
  }

  const fetchDetail = useCallback(async (agencyId: string) => {
    const requestId = detailRequestRef.current + 1
    detailRequestRef.current = requestId
    setDetailError(false)
    setDetailLoading(true)
    try {
      const response = await CommissionService.getAgencyCommissionDetails(agencyId, year, month)
      if (detailRequestRef.current === requestId) {
        setDetail(response)
      }
    } catch (err) {
      if (detailRequestRef.current === requestId) {
        setDetail(undefined)
        setDetailError(true)
      }
      helper.error(err)
    } finally {
      if (detailRequestRef.current === requestId) {
        setDetailLoading(false)
      }
    }
  }, [month, year])

  const openDrawer = (agency: bookcarsTypes.AgencyCommissionRow) => {
    setSelectedAgency(agency)
    setDetail(undefined)
    setDetailError(false)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedAgency(null)
    setDetail(undefined)
    setDetailError(false)
    detailRequestRef.current += 1
  }

  const refreshDetail = useCallback(async () => {
    if (selectedAgency) {
      await fetchDetail(selectedAgency.agency.id)
    }
  }, [fetchDetail, selectedAgency])

  const normalizeSettings = useCallback((value: bookcarsTypes.CommissionSettings): bookcarsTypes.CommissionSettings => {
    const ribDetails = value.bankTransferRibDetails
    return {
      ...value,
      bankTransferEnabled: value.bankTransferEnabled !== false,
      cardPaymentEnabled: value.cardPaymentEnabled === true,
      d17PaymentEnabled: value.d17PaymentEnabled === true,
      bankTransferRibInformation: value.bankTransferRibInformation || '',
      bankTransferRibDetails: {
        ...EMPTY_RIB_DETAILS,
        ...(ribDetails
          ? {
            accountHolder: ribDetails.accountHolder || '',
            bankName: ribDetails.bankName || '',
            bankAddress: ribDetails.bankAddress || '',
            iban: ribDetails.iban || '',
            bic: ribDetails.bic || '',
            accountNumber: ribDetails.accountNumber || '',
          }
          : undefined),
      },
    }
  }, [])

  const sanitizeRibDetails = useCallback((details?: bookcarsTypes.CommissionRibDetails | null): Record<RibField, string> => {
    const merged: Record<RibField, string> = {
      ...EMPTY_RIB_DETAILS,
      ...(details || {}),
    }

    return {
      accountHolder: (merged.accountHolder || '').trim(),
      bankName: (merged.bankName || '').trim(),
      bankAddress: (merged.bankAddress || '').trim(),
      iban: (merged.iban || '').replace(/\s+/g, '').toUpperCase(),
      bic: (merged.bic || '').replace(/\s+/g, '').toUpperCase(),
      accountNumber: (merged.accountNumber || '').replace(/\s+/g, ''),
    }
  }, [])

  useEffect(() => {
    if (!drawerOpen || !selectedAgency) {
      return
    }

    fetchDetail(selectedAgency.agency.id)
  }, [drawerOpen, selectedAgency, fetchDetail])

  const ensureSettings = useCallback(async (): Promise<bookcarsTypes.CommissionSettings> => {
    if (settings) {
      return settings
    }

    setLoadingSettings(true)
    try {
      const response = await CommissionService.getCommissionSettings()
      const normalized = normalizeSettings(response)
      setSettings(normalized)
      return normalized
    } catch (err) {
      helper.error(err)
      throw err
    } finally {
      setLoadingSettings(false)
    }
  }, [normalizeSettings, settings])

  const buildTemplateMessage = useCallback((
    template: string,
    agency: bookcarsTypes.AgencyCommissionRow,
    summaryAgency?: bookcarsTypes.AgencyCommissionDetailSummary,
  ) => {
    if (!template) {
      return ''
    }

    const amount = summaryAgency ? summaryAgency.balance : agency.balance
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
      const summaryAgency = detail && detail.agency.id === agency.agency.id ? detail.summary : undefined
      const message = buildTemplateMessage(template, agency, summaryAgency)
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
      const summaryAgency = detail && detail.agency.id === selectedAgency.agency.id ? detail.summary : undefined
      const message = buildTemplateMessage(template, selectedAgency, summaryAgency)
      setReminderMessage(message)
    }
  }

  const handleOpenPaymentMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPaymentMenuAnchorEl(event.currentTarget)
  }

  const handleClosePaymentMenu = () => {
    setPaymentMenuAnchorEl(null)
  }

  const handleSelectBankTransfer = async () => {
    handleClosePaymentMenu()
    try {
      const currentSettings = await ensureSettings()
      if (!currentSettings.bankTransferEnabled) {
        helper.error(undefined, strings.PAYMENT_BANK_TRANSFER_DISABLED)
        return
      }
      if (!hasRibDetails(currentSettings.bankTransferRibDetails)) {
        helper.error(undefined, strings.PAYMENT_BANK_TRANSFER_NO_DETAILS)
        return
      }
      setBankTransferDialogOpen(true)
    } catch {
      // already handled in ensureSettings
    }
  }

  const handleSelectCardPayment = () => {
    handleClosePaymentMenu()
    helper.info(strings.PAYMENT_METHOD_UNAVAILABLE)
  }

  const handleSelectD17Payment = () => {
    handleClosePaymentMenu()
    helper.info(strings.PAYMENT_METHOD_UNAVAILABLE)
  }

  const handleCloseBankTransferDialog = () => {
    setBankTransferDialogOpen(false)
  }

  const handleDownloadRib = async () => {
    try {
      const blob = await CommissionService.downloadCommissionRib()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = strings.BANK_TRANSFER_DIALOG_FILENAME
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      helper.error(err, strings.PAYMENT_BANK_TRANSFER_DOWNLOAD_ERROR)
    }
  }

  const handleCopyRibValue = async (value?: string) => {
    if (!value) {
      return
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      helper.info(strings.BANK_TRANSFER_DIALOG_COPY_SUCCESS)
    } catch (err) {
      helper.error(err)
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

    const agencyCurrentStatus = detail?.agency.status ?? selectedAgency.status
    const block = agencyCurrentStatus !== bookcarsTypes.AgencyCommissionStatus.Blocked

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

    const sanitizedRib = sanitizeRibDetails(settings.bankTransferRibDetails)
    const hasDetails = hasRibDetails(sanitizedRib as bookcarsTypes.CommissionRibDetails)
    const requireRib = settings.bankTransferEnabled || hasDetails
    const nextErrors: Record<RibField, boolean> = { ...EMPTY_RIB_ERRORS }
    let valid = true

    if (requireRib) {
      if (!sanitizedRib.accountHolder) {
        nextErrors.accountHolder = true
        valid = false
      }
      if (!sanitizedRib.bankName) {
        nextErrors.bankName = true
        valid = false
      }
      if (!sanitizedRib.iban || !validator.isIBAN(sanitizedRib.iban)) {
        nextErrors.iban = true
        valid = false
      }
      if (!sanitizedRib.bic || !RIB_BIC_REGEX.test(sanitizedRib.bic)) {
        nextErrors.bic = true
        valid = false
      }
      if (!sanitizedRib.accountNumber || sanitizedRib.accountNumber.length < 6) {
        nextErrors.accountNumber = true
        valid = false
      }
    }

    if (!valid) {
      setRibErrors(nextErrors)
      helper.error(undefined, commonStrings.FIX_ERRORS)
      return
    }

    setRibErrors({ ...EMPTY_RIB_ERRORS })

    const ribPayload = requireRib
      ? {
        accountHolder: sanitizedRib.accountHolder,
        bankName: sanitizedRib.bankName,
        iban: sanitizedRib.iban,
        bic: sanitizedRib.bic,
        accountNumber: sanitizedRib.accountNumber,
        ...(sanitizedRib.bankAddress ? { bankAddress: sanitizedRib.bankAddress } : {}),
      }
      : null

    try {
      const payload: bookcarsTypes.CommissionSettingsPayload = {
        reminderChannel: settings.reminderChannel,
        emailTemplate: settings.emailTemplate,
        smsTemplate: settings.smsTemplate,
        bankTransferEnabled: settings.bankTransferEnabled,
        cardPaymentEnabled: settings.cardPaymentEnabled,
        d17PaymentEnabled: settings.d17PaymentEnabled,
        bankTransferRibInformation: settings.bankTransferRibInformation,
        bankTransferRibDetails: ribPayload,
      }
      const updated = await CommissionService.updateCommissionSettings(payload)
      const normalized = normalizeSettings(updated)
      setSettings(normalized)
      helper.info(strings.SETTINGS_SUCCESS)
      setSettingsOpen(false)
    } catch (err) {
      helper.error(err, strings.SETTINGS_ERROR)
    }
  }

  const updateSettingsField = <K extends keyof bookcarsTypes.CommissionSettingsPayload>(
    field: K,
    value: bookcarsTypes.CommissionSettingsPayload[K],
  ) => {
    setSettings((prev) => {
      if (!prev) {
        return prev
      }
      return { ...prev, [field]: value }
    })
  }

  const updateRibDetailsField = (field: RibField, value: string) => {
    setSettings((prev) => {
      if (!prev) return prev

      // On normalise pour forcer des strings (pas de string | undefined)
      const safePrev = sanitizeRibDetails(prev.bankTransferRibDetails)

      // On recompose l'objet RIB avec des valeurs sûres,
      // puis on applique la mise à jour du champ ciblé.
      const nextDetails: bookcarsTypes.CommissionRibDetails = {
        ...safePrev,
        [field]: value,
      }

      return {
        ...prev,
        bankTransferRibDetails: nextDetails,
      }
    })
  }

  const rows = data?.agencies || []

  const rowCount = data?.total || 0
  const summaryData = data?.summary
  const thresholdValue = summaryData?.threshold ?? 50
  const summaryThreshold = summary?.threshold ?? thresholdValue
  const summaryTotal = summary?.totalToPay ?? summary?.balance ?? 0
  const summaryPeriodClosed = summary?.periodClosed !== false
  const summaryMeetsThreshold = summaryTotal >= summaryThreshold
  const emptyStateMessage = withCarryOver
    ? strings.EMPTY_CARRY_OVER_STATE
    : aboveThreshold
      ? strings.EMPTY_THRESHOLD_STATE
      : strings.EMPTY_STATE

  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))

  const paginationFrom = rows.length === 0 ? 0 : page * pageSize + 1
  const paginationTo = rows.length === 0
    ? 0
    : Math.min(rowCount, page * pageSize + rows.length)
  const isPreviousDisabled = page === 0 || loading
  const isNextDisabled = paginationTo >= rowCount || loading

  const handlePreviousPage = () => {
    if (page > 0 && !loading) {
      setPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (!loading && (page + 1) * pageSize < rowCount) {
      setPage((prev) => prev + 1)
    }
  }

  const formatCurrency = (value: number) => `${formatNumber(value, language)} TND`

  const agencyInitials = activeAgency?.name
    ? activeAgency.name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase()
    : '?'

  return (
    <Layout strict admin onLoad={onLoad}>
      {!admin && !loading && (
        <Typography variant="body1" color="text.secondary" sx={{ p: 3 }}>
          {strings.ACCESS_RESTRICTED}
        </Typography>
      )}
      {admin && (
        <Box className="agency-commissions">
          <Stack spacing={3}>
            <Box className="ac-header">
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h5">{strings.TITLE}</Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${strings.THRESHOLD_LABEL}: ${summaryData ? formatCurrency(summaryData.threshold) : '—'}`}
                />
              </Stack>
              <Stack direction="row" spacing={1} className="ac-header-actions">
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

            <Paper elevation={0} className="ac-filters-card">
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={2}
                alignItems={{ lg: 'center' }}
                className="ac-filters"
              >
                <TextField
                  className="ac-search-field"
                  placeholder={strings.SEARCH_PLACEHOLDER}
                  size="small"
                  value={searchTerm}
                  fullWidth
                  sx={{ width: { xs: '100%', lg: 320 } }}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleSearch}>
                          <SearchIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl
                  size="small"
                  fullWidth
                  sx={{ width: { xs: '100%', lg: 180 } }}
                >
                  <InputLabel>{strings.STATUS_FILTER_LABEL}</InputLabel>
                  <Select value={statusFilter} label={strings.STATUS_FILTER_LABEL} onChange={handleStatusChange}>
                    <MenuItem value="all">{strings.STATUS_ALL}</MenuItem>
                    <MenuItem value={bookcarsTypes.AgencyCommissionStatus.Active}>{strings.STATUS_ACTIVE}</MenuItem>
                    <MenuItem value={bookcarsTypes.AgencyCommissionStatus.Blocked}>{strings.STATUS_BLOCKED}</MenuItem>
                    <MenuItem value={bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp}>{strings.STATUS_NEEDS_FOLLOW_UP}</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  sx={{ m: 0, width: { xs: '100%', lg: 'auto' } }}
                  control={<Switch checked={aboveThreshold} onChange={handleAboveThresholdChange} />}
                  label={strings.FILTER_ABOVE_THRESHOLD}
                />
                <FormControlLabel
                  sx={{ m: 0, width: { xs: '100%', lg: 'auto' } }}
                  control={<Switch checked={withCarryOver} onChange={handleWithCarryOverChange} />}
                  label={strings.FILTER_WITH_CARRY_OVER}
                />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{ ml: { lg: 'auto' }, width: { xs: '100%', lg: 'auto' } }}
                >
                  <Tooltip title={strings.PREVIOUS_MONTH}>
                    <span>
                      <IconButton
                        onClick={handlePreviousMonth}
                        disabled={loading}
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                      >
                        <ChevronLeftIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <FormControl
                    size="small"
                    fullWidth
                    sx={{ width: { xs: '100%', sm: 200, lg: 160 } }}
                  >
                    <InputLabel>{strings.MONTH_LABEL}</InputLabel>
                    <Select value={month} label={strings.MONTH_LABEL} onChange={handleMonthChange}>
                      {monthOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    size="small"
                    fullWidth
                    sx={{ width: { xs: '100%', sm: 160, lg: 120 } }}
                  >
                    <InputLabel>{strings.YEAR_LABEL}</InputLabel>
                    <Select value={year} label={strings.YEAR_LABEL} onChange={handleYearChange}>
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = now.getFullYear() - 2 + index
                        return <MenuItem key={value} value={value}>{value}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                  <Tooltip title={strings.NEXT_MONTH}>
                    <span>
                      <IconButton
                        onClick={handleNextMonth}
                        disabled={loading}
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>

            <Box className="ac-kpis">
              {[{
                title: strings.GROSS_TURNOVER,
                value: summaryData ? formatCurrency(summaryData.grossTurnover) : '—',
              }, {
                title: strings.COMMISSION_DUE,
                value: summaryData ? formatCurrency(summaryData.commissionDue) : '—',
              }, {
                title: strings.CARRY_OVER_TOTAL,
                value: summaryData ? formatCurrency(summaryData.carryOverTotal || 0) : '—',
              }, {
                title: strings.PAYABLE_TOTAL,
                value: summaryData ? formatCurrency(summaryData.payableTotal || 0) : '—',
              }, {
                title: strings.UNDER_THRESHOLD_COUNT,
                value: summaryData ? formatNumber(summaryData.agenciesUnderThreshold || 0, language) : '—',
              }].map((item) => (
                <Paper key={item.title} elevation={0} className="ac-kpi-card">
                  <Typography variant="caption" color="text.secondary">{item.title}</Typography>
                  <Typography variant="h6">{item.value}</Typography>
                </Paper>
              ))}
            </Box>

            <Typography variant="subtitle2" color="text.secondary">
              {strings.AGENCIES_SECTION_TITLE}
            </Typography>

            <Paper
              elevation={0}
              className={`ac-table${isMobileView ? ' ac-table-mobile' : ''}`}
            >
              {loading && <LinearProgress color="primary" />}
              {isMobileView ? (
                <Stack spacing={2} className="ac-mobile-list">
                  {loading && rows.length === 0 ? (
                    <Box className="ac-mobile-placeholder">
                      <CircularProgress size={24} />
                    </Box>
                  ) : rows.length === 0 ? (
                    <Box className="ac-mobile-placeholder">
                      <Typography variant="body2" color="text.secondary">
                        {emptyStateMessage}
                      </Typography>
                    </Box>
                  ) : (
                    rows.map((row) => {
                      const { agency } = row
                      const meetsThreshold = row.totalToPay >= thresholdValue
                      const isPeriodOpen = !row.periodClosed
                      const statusChip = (
                        <Chip size="small" color={getStatusChipColor(row.status)} label={mapStatusToLabel(row.status)} />
                      )
                      const totalColor = row.payable
                        ? 'success.main'
                        : isPeriodOpen && meetsThreshold
                          ? 'info.main'
                          : 'warning.main'
                      const paymentTooltip = strings.ACTION_MARK_PAID
                      const canSendReminder = meetsThreshold
                      const reminderTooltip = canSendReminder
                        ? strings.ACTION_REMIND
                        : strings.REMINDER_DISABLED_THRESHOLD
                      const carryOverChip = row.carryOver > 0
                        ? (
                          <Chip size="small" color="warning" variant="outlined" label={strings.BADGE_CARRY_OVER} />
                        )
                        : undefined
                      const totalChip = row.payable
                        ? <Chip size="small" color="success" variant="filled" label={strings.BADGE_PAYABLE} />
                        : isPeriodOpen && meetsThreshold
                          ? <Chip size="small" color="info" variant="outlined" label={strings.BADGE_PERIOD_OPEN} />
                          : <Chip size="small" color="warning" variant="outlined" label={strings.BADGE_BELOW_THRESHOLD} />
                      const blockLabel = row.status === bookcarsTypes.AgencyCommissionStatus.Blocked
                        ? strings.ACTION_UNBLOCK
                        : strings.ACTION_BLOCK
                      const blockIcon = row.status === bookcarsTypes.AgencyCommissionStatus.Blocked
                        ? <LockOpenIcon fontSize="small" />
                        : <BlockIcon fontSize="small" />

                      const mobileStats: {
                        label: string
                        value: string
                        chip?: React.ReactNode
                        color?: string
                      }[] = [
                        {
                          label: strings.COLUMN_RESERVATIONS,
                          value: formatNumber(row.reservations, language),
                        },
                        {
                          label: strings.COLUMN_DUE,
                          value: formatCurrency(row.commissionDue),
                        },
                        {
                          label: strings.COLUMN_CARRY_OVER,
                          value: formatCurrency(row.carryOver),
                          chip: carryOverChip,
                        },
                        {
                          label: strings.COLUMN_TOTAL_TO_PAY,
                          value: formatCurrency(row.totalToPay),
                          chip: totalChip,
                          color: totalColor,
                        },
                      ]

                      return (
                        <Box key={agency.id} className="ac-mobile-card">
                          <Stack spacing={1.5}>
                            <Box className="ac-mobile-card-header">
                              <Box className="ac-mobile-card-identity">
                                <Typography
                                  component={Link}
                                  href={`/supplier?c=${agency.id}`}
                                  variant="subtitle1"
                                  fontWeight={600}
                                  color="primary"
                                  sx={{
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                    },
                                  }}
                                >
                                  {agency.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {[agency.city, agency.email, agency.phone].filter(Boolean).join(' • ')}
                                </Typography>
                              </Box>
                              {statusChip}
                            </Box>
                            <Divider />
                            <Box className="ac-mobile-card-metrics">
                              {mobileStats.map((item) => (
                                <Box key={item.label} className="ac-mobile-card-metric">
                                  <Typography variant="caption" color="text.secondary">
                                    {item.label}
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    className="ac-mobile-meta-value"
                                    color={item.color}
                                  >
                                    {item.value}
                                  </Typography>
                                  {item.chip}
                                </Box>
                              ))}
                            </Box>
                            <Box className="ac-mobile-actions">
                              {canSendReminder ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  fullWidth
                                  startIcon={<SendIcon fontSize="small" />}
                                  onClick={() => handleOpenReminder(row)}
                                >
                                  {strings.ACTION_REMIND}
                                </Button>
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  fullWidth
                                  startIcon={<SendIcon fontSize="small" />}
                                  disabled
                                  title={reminderTooltip}
                                >
                                  {strings.ACTION_REMIND}
                                </Button>
                              )}
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                startIcon={<PaidIcon fontSize="small" />}
                                onClick={() => handleOpenPaymentDialog(row)}
                                title={paymentTooltip}
                              >
                                {strings.ACTION_MARK_PAID}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                color={row.status === bookcarsTypes.AgencyCommissionStatus.Blocked ? 'success' : 'error'}
                                startIcon={blockIcon}
                                onClick={() => handleToggleBlock(row)}
                              >
                                {blockLabel}
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                fullWidth
                                startIcon={<VisibilityIcon fontSize="small" />}
                                onClick={() => openDrawer(row)}
                              >
                                {strings.ACTION_DETAILS}
                              </Button>
                            </Box>
                            {!canSendReminder && (
                              <Typography variant="caption" color="text.secondary">
                                {strings.REMINDER_DISABLED_THRESHOLD}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      )
                    })
                  )}
                </Stack>
              ) : (
                <TableContainer className="ac-table-container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{strings.COLUMN_AGENCY}</TableCell>
                        <TableCell align="right">{strings.COLUMN_RESERVATIONS}</TableCell>
                        <TableCell align="right">{strings.COLUMN_DUE}</TableCell>
                        <TableCell align="right">
                          <Tooltip title={strings.TOOLTIP_CARRY_OVER} placement="top">
                            <span>{strings.COLUMN_CARRY_OVER}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={strings.TOOLTIP_PAYABLE} placement="top">
                            <span>{strings.COLUMN_TOTAL_TO_PAY}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">{strings.COLUMN_STATUS}</TableCell>
                        <TableCell align="center">{strings.COLUMN_ACTIONS}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading && rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <CircularProgress size={24} />
                          </TableCell>
                        </TableRow>
                      ) : rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary">
                              {emptyStateMessage}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row) => {
                          const { agency } = row
                          const meetsThreshold = row.totalToPay >= thresholdValue
                          const isPeriodOpen = !row.periodClosed
                          const statusChip = (
                            <Chip size="small" color={getStatusChipColor(row.status)} label={mapStatusToLabel(row.status)} />
                          )
                          const totalColor = row.payable
                            ? 'success.main'
                            : isPeriodOpen && meetsThreshold
                              ? 'info.main'
                              : 'warning.main'
                          const paymentTooltip = strings.ACTION_MARK_PAID
                          const canSendReminder = meetsThreshold
                          const reminderTooltip = canSendReminder
                            ? strings.ACTION_REMIND
                            : strings.REMINDER_DISABLED_THRESHOLD

                          return (
                            <TableRow key={agency.id} hover>
                              <TableCell>
                                <Typography
                                  component={Link}
                                  href={`/supplier?c=${agency.id}`}
                                  variant="body2"
                                  fontWeight={600}
                                  color="primary"
                                  sx={{
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                    },
                                  }}
                                >
                                  {agency.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{formatNumber(row.reservations, language)}</TableCell>
                              <TableCell align="right">{formatCurrency(row.commissionDue)}</TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                  <Typography variant="body2">{formatCurrency(row.carryOver)}</Typography>
                                  {row.carryOver > 0 && (
                                    <Chip
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                      label={strings.BADGE_CARRY_OVER}
                                    />
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={totalColor}
                                  >
                                    {formatCurrency(row.totalToPay)}
                                  </Typography>
                                  {row.payable ? (
                                    <Chip size="small" color="success" variant="filled" label={strings.BADGE_PAYABLE} />
                                  ) : isPeriodOpen && meetsThreshold ? (
                                    <Chip size="small" color="info" variant="outlined" label={strings.BADGE_PERIOD_OPEN} />
                                  ) : (
                                    <Chip size="small" color="warning" variant="outlined" label={strings.BADGE_BELOW_THRESHOLD} />
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell align="center">
                                {statusChip}
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  {canSendReminder && (
                                    <Tooltip title={reminderTooltip}>
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleOpenReminder(row)}
                                        >
                                          <SendIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  )}
                                  <Tooltip title={paymentTooltip}>
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenPaymentDialog(row)}
                                      >
                                        <PaidIcon fontSize="small" />
                                      </IconButton>
                                    </span>
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
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            <Box className="ac-table-footer">
              <Typography variant="body2" color="text.secondary" className="ac-table-count">
                {rowCount === 0
                  ? `0 ${commonStrings.OF} 0`
                  : `${paginationFrom}–${paginationTo} ${commonStrings.OF} ${rowCount}`}
              </Typography>
              <FormControl size="small" className="ac-page-size" variant="outlined">
                <InputLabel>{strings.ROWS_PER_PAGE}</InputLabel>
                <Select value={pageSize} label={strings.ROWS_PER_PAGE} onChange={handlePageSizeChange}>
                  {[10, 25, 50].map((sizeOption) => (
                    <MenuItem key={sizeOption} value={sizeOption}>{sizeOption}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction="row" spacing={1} className="ac-table-pagination">
                <Button size="small" variant="outlined" onClick={handlePreviousPage} disabled={isPreviousDisabled}>
                  {strings.TABLE_PREVIOUS}
                </Button>
                <Button size="small" variant="outlined" onClick={handleNextPage} disabled={isNextDisabled}>
                  {strings.TABLE_NEXT}
                </Button>
              </Stack>
            </Box>
          </Stack>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={handleDrawerClose}
            PaperProps={{
              sx: {
                width: { xs: '100%', sm: 520, md: 980 },
              },
            }}
          >
            <Box className="ac-drawer-content">
              {detailLoading && <LinearProgress className="ac-drawer-progress" />}
              {selectedAgency && activeAgency ? (
                <>
                  <Box className="ac-drawer-header">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>{agencyInitials}</Avatar>
                      <Box className="ac-drawer-identity">
                        <Typography variant="h6" fontWeight={700}>{activeAgency.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {[activeAgency.city, activeAgency.email, activeAgency.phone].filter(Boolean).join(' • ') || strings.DRAWER_CONTACT_NONE}
                        </Typography>
                        <Box className="ac-drawer-meta">
                          <Chip size="small" color={getStatusChipColor(currentStatus)} label={mapStatusToLabel(currentStatus)} />
                          {summary?.carryOver ? (
                            <Chip size="small" color="warning" variant="outlined" label={strings.BADGE_CARRY_OVER} />
                          ) : null}
                          {summary && (
                            <Chip
                              size="small"
                              color={summary.payable
                                ? 'success'
                                : !summaryPeriodClosed && summaryMeetsThreshold
                                  ? 'info'
                                  : 'warning'}
                              variant={summary.payable ? 'filled' : 'outlined'}
                              label={summary.payable
                                ? strings.BADGE_PAYABLE
                                : !summaryPeriodClosed && summaryMeetsThreshold
                                  ? strings.BADGE_PERIOD_OPEN
                                  : strings.BADGE_BELOW_THRESHOLD}
                            />
                          )}
                        </Box>
                      </Box>
                    </Stack>
                    <Tooltip title={isBlocked ? strings.ACTION_UNBLOCK : strings.ACTION_BLOCK}>
                      <span>
                        <Button
                          variant="outlined"
                          color={isBlocked ? 'success' : 'error'}
                          startIcon={isBlocked ? <LockOpenIcon /> : <BlockIcon />}
                          onClick={() => selectedAgency && handleToggleBlock(selectedAgency)}
                        >
                          {isBlocked ? strings.ACTION_UNBLOCK : strings.ACTION_BLOCK}
                        </Button>
                      </span>
                    </Tooltip>
                  </Box>

                  <Divider />

                  <Box className="ac-section">
                    <Typography variant="subtitle1">{strings.DRAWER_CONTACT_TITLE}</Typography>
                    <Paper elevation={0} className="ac-contact-card">
                      <ContactInfoRow icon={<FingerprintIcon fontSize="small" />} label={strings.DRAWER_CONTACT_ID} value={activeAgency.id} />
                      <ContactInfoRow icon={<LocationOnIcon fontSize="small" />} label={strings.DRAWER_CONTACT_CITY} value={activeAgency.city} />
                      <ContactInfoRow icon={<EmailIcon fontSize="small" />} label={strings.DRAWER_CONTACT_EMAIL} value={activeAgency.email} href={activeAgency.email ? `mailto:${activeAgency.email}` : undefined} />
                      <ContactInfoRow icon={<PhoneIcon fontSize="small" />} label={strings.DRAWER_CONTACT_PHONE} value={activeAgency.phone} href={activeAgency.phone ? `tel:${activeAgency.phone}` : undefined} />
                    </Paper>
                  </Box>

                  {summary && (
                    <>
                      <Divider />
                      <Box className="ac-section">
                        <Typography variant="subtitle1">{strings.DRAWER_TITLE_SUMMARY}</Typography>
                        <Box className="ac-summary-grid">
                          <Paper elevation={0} className="ac-summary-card">
                            <Typography variant="caption" color="text.secondary">
                              {strings.DRAWER_SUMMARY_RESERVATIONS}
                            </Typography>
                            <Typography variant="h6">{formatNumber(summary.reservations, language)}</Typography>
                          </Paper>
                          <Paper elevation={0} className="ac-summary-card">
                            <Typography variant="caption" color="text.secondary">
                              {strings.DRAWER_SUMMARY_GROSS}
                            </Typography>
                            <Typography variant="h6">{formatCurrency(summary.grossTurnover)}</Typography>
                          </Paper>
                          <Paper elevation={0} className="ac-summary-card">
                            <Typography variant="caption" color="text.secondary">
                              {strings.DRAWER_SUMMARY_DUE}
                            </Typography>
                            <Typography variant="h6">{formatCurrency(summary.commissionDue)}</Typography>
                          </Paper>
                          <Paper elevation={0} className="ac-summary-card">
                            <Typography variant="caption" color="text.secondary">
                              {strings.DRAWER_SUMMARY_COLLECTED}
                            </Typography>
                            <Typography variant="h6">{formatCurrency(summary.commissionCollected)}</Typography>
                          </Paper>
                          <Paper elevation={0} className="ac-summary-card">
                            <Typography variant="caption" color="text.secondary">
                              {strings.DRAWER_SUMMARY_CARRY_OVER}
                            </Typography>
                            <Typography variant="h6">{formatCurrency(summary.carryOver || 0)}</Typography>
                          </Paper>
                          <Paper elevation={0} className="ac-summary-card">
                            <Typography variant="caption" color="text.secondary">
                              {strings.DRAWER_SUMMARY_TOTAL_TO_PAY}
                            </Typography>
                            <Typography
                              variant="h6"
                              color={summary.payable
                                ? 'success.main'
                                : !summaryPeriodClosed && summaryMeetsThreshold
                                  ? 'info.main'
                                  : 'warning.main'}
                            >
                              {formatCurrency(summary.totalToPay || summary.balance)}
                            </Typography>
                          </Paper>
                          <Paper elevation={0} className="ac-summary-card">
                            <Typography variant="caption" color="text.secondary">
                              {strings.DRAWER_SUMMARY_THRESHOLD}
                            </Typography>
                            <Typography variant="h6">{formatCurrency(summary.threshold)}</Typography>
                            <Chip
                              size="small"
                              color={summary.payable
                                ? 'success'
                                : !summaryPeriodClosed && summaryMeetsThreshold
                                  ? 'info'
                                  : 'warning'}
                              className="ac-summary-chip"
                              variant={summary.payable ? 'filled' : 'outlined'}
                              label={summary.payable
                                ? strings.BADGE_PAYABLE
                                : !summaryPeriodClosed && summaryMeetsThreshold
                                  ? strings.BADGE_PERIOD_OPEN
                                  : strings.BADGE_BELOW_THRESHOLD}
                            />
                          </Paper>
                        </Box>
                      </Box>
                    </>
                  )}

                  <Divider />

                  <Box className="ac-section">
                    <Typography variant="subtitle1">{strings.DRAWER_ACTIONS}</Typography>
                    <Box className="ac-actions">
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<PaymentIcon />}
                        onClick={handleOpenPaymentMenu}
                        disabled={!summaryMeetsThreshold}
                      >
                        {strings.DRAWER_ACTION_PAY}
                      </Button>
                      <Button variant="contained" startIcon={<SendIcon />} onClick={() => selectedAgency && handleOpenReminder(selectedAgency)}>
                        {strings.DRAWER_ACTION_REMIND}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PaidIcon />}
                        onClick={() => selectedAgency && handleOpenPaymentDialog(selectedAgency)}
                        disabled={!selectedAgency}
                      >
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
                    <Menu anchorEl={paymentMenuAnchorEl} open={paymentMenuOpen} onClose={handleClosePaymentMenu}>
                      <MenuItem onClick={handleSelectBankTransfer}>
                        <ListItemIcon>
                          <AccountBalanceIcon
                            fontSize="small"
                            color={settings?.bankTransferEnabled === false ? 'disabled' : 'primary'}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={strings.PAYMENT_METHOD_BANK_TRANSFER}
                          secondary={strings.PAYMENT_METHOD_BANK_TRANSFER_DESCRIPTION}
                        />
                      </MenuItem>
                      <MenuItem onClick={handleSelectCardPayment} disabled={!settings?.cardPaymentEnabled}>
                        <ListItemIcon>
                          <CreditCardIcon
                            fontSize="small"
                            color={settings?.cardPaymentEnabled ? 'primary' : 'disabled'}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={strings.PAYMENT_METHOD_CARD}
                          secondary={strings.PAYMENT_METHOD_UNAVAILABLE}
                        />
                      </MenuItem>
                      <MenuItem onClick={handleSelectD17Payment} disabled={!settings?.d17PaymentEnabled}>
                        <ListItemIcon>
                          <QrCode2Icon
                            fontSize="small"
                            color={settings?.d17PaymentEnabled ? 'primary' : 'disabled'}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={strings.PAYMENT_METHOD_D17}
                          secondary={strings.PAYMENT_METHOD_UNAVAILABLE}
                        />
                      </MenuItem>
                    </Menu>
                  </Box>

                  <Divider />

                  <Box className="ac-section">
                    <Typography variant="subtitle1">{strings.DRAWER_OPERATIONS}</Typography>
                    {showDetailError ? (
                      <Typography variant="body2" color="error">{strings.DRAWER_ERROR_STATE}</Typography>
                    ) : (
                      <Box className="ac-logs">
                        {isAwaitingDetail ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={20} />
                          </Box>
                        ) : logs.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">{strings.DRAWER_OPERATIONS_EMPTY}</Typography>
                        ) : (
                          logs.map((log) => (
                            <Box key={log.id} className="ac-log-entry">
                              <Typography variant="subtitle2">{`${mapLogTypeToLabel(log.type)} • ${new Date(log.date).toLocaleString(language)}`}</Typography>
                              {log.admin && (
                                <Typography variant="caption" color="text.secondary">{`${strings.LOG_ADMIN_LABEL} ${log.admin.name}`}</Typography>
                              )}
                              {log.channel && (
                                <Typography variant="caption" color="text.secondary">{`${strings.LOG_CHANNEL_LABEL} ${getReminderChannelLabel(log.channel)}`}</Typography>
                              )}
                              {typeof log.amount === 'number' && (
                                <Typography variant="caption" color="text.secondary">{`${strings.LOG_AMOUNT_LABEL} ${formatCurrency(log.amount)}`}</Typography>
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
                          ))
                        )}
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  <Box className="ac-section">
                    <Typography variant="subtitle1">{strings.DRAWER_BOOKINGS}</Typography>
                    {showDetailError ? (
                      <Typography variant="body2" color="error">{strings.DRAWER_ERROR_STATE}</Typography>
                    ) : (
                      <Paper variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>{strings.BOOKING_COLUMN_ID}</TableCell>
                              <TableCell>{strings.BOOKING_COLUMN_FROM}</TableCell>
                              <TableCell>{strings.BOOKING_COLUMN_TO}</TableCell>
                              <TableCell align="right">{strings.BOOKING_COLUMN_TOTAL}</TableCell>
                              <TableCell align="right">{strings.BOOKING_COLUMN_COMMISSION}</TableCell>
                              <TableCell align="center">{strings.BOOKING_COLUMN_PAYMENT_STATUS}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {isAwaitingDetail ? (
                              <TableRow>
                                <TableCell colSpan={6} align="center">
                                  <CircularProgress size={20} />
                                </TableCell>
                              </TableRow>
                            ) : bookings.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} align="center">
                                  <Typography variant="body2" color="text.secondary">{strings.EMPTY_STATE}</Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                  <TableCell>{booking.id}</TableCell>
                                  <TableCell>{new Date(booking.from).toLocaleDateString(language)}</TableCell>
                                  <TableCell>{new Date(booking.to).toLocaleDateString(language)}</TableCell>
                                  <TableCell align="right">{formatCurrency(booking.totalPrice)}</TableCell>
                                  <TableCell align="right">{formatCurrency(booking.commission)}</TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      size="small"
                                      color={booking.paymentStatus === bookcarsTypes.CommissionPaymentStatus.Unpaid ? 'error' : booking.paymentStatus === bookcarsTypes.CommissionPaymentStatus.Partial ? 'warning' : 'success'}
                                      variant={booking.paymentStatus === bookcarsTypes.CommissionPaymentStatus.Paid ? 'filled' : 'outlined'}
                                      label={mapPaymentStatusToLabel(booking.paymentStatus)}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </Paper>
                    )}
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                  <Typography variant="body2" color="text.secondary">{strings.EMPTY_STATE}</Typography>
                </Box>
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

          <Dialog open={bankTransferDialogOpen} onClose={handleCloseBankTransferDialog} fullWidth maxWidth="sm">
            <DialogTitle>{strings.BANK_TRANSFER_DIALOG_TITLE}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {settings?.bankTransferRibInformation ? (
                <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {settings.bankTransferRibInformation}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {strings.BANK_TRANSFER_DIALOG_NO_INFORMATION}
                </Typography>
              )}
              {ribHasDetails ? (
                <Stack spacing={1.5}>
                  {[{
                    label: strings.SETTINGS_RIB_ACCOUNT_HOLDER,
                    value: settings?.bankTransferRibDetails?.accountHolder,
                  }, {
                    label: strings.SETTINGS_RIB_BANK_NAME,
                    value: settings?.bankTransferRibDetails?.bankName,
                  }, {
                    label: strings.SETTINGS_RIB_BANK_ADDRESS,
                    value: settings?.bankTransferRibDetails?.bankAddress,
                  }, {
                    label: strings.SETTINGS_RIB_IBAN,
                    value: settings?.bankTransferRibDetails?.iban,
                  }, {
                    label: strings.SETTINGS_RIB_BIC,
                    value: settings?.bankTransferRibDetails?.bic,
                  }, {
                    label: strings.SETTINGS_RIB_ACCOUNT_NUMBER,
                    value: settings?.bankTransferRibDetails?.accountNumber,
                  }]
                    .filter((entry) => entry.value)
                    .map((entry) => (
                      <Stack key={entry.label} direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                            {entry.label}
                          </Typography>
                          <Typography variant="body1" fontWeight={700} sx={{ wordBreak: 'break-all' }}>
                            {entry.value}
                          </Typography>
                        </Box>
                        <Tooltip title={strings.BANK_TRANSFER_DIALOG_COPY}>
                          <span>
                            <IconButton
                              color="primary"
                              onClick={() => handleCopyRibValue(entry.value)}
                              disabled={!entry.value}
                              size="small"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    ))}
                  <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadRib}>
                    {strings.BANK_TRANSFER_DIALOG_DOWNLOAD}
                  </Button>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {strings.BANK_TRANSFER_DIALOG_NO_DETAILS}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseBankTransferDialog}>{strings.CLOSE}</Button>
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
            <DialogTitle>{isBlocked ? strings.UNBLOCK_CONFIRM_TITLE : strings.BLOCK_CONFIRM_TITLE}</DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                {isBlocked ? strings.UNBLOCK_CONFIRM_MESSAGE : strings.BLOCK_CONFIRM_MESSAGE}
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
              <FormControlLabel
                control={(
                  <Switch
                    checked={Boolean(settings?.bankTransferEnabled)}
                    onChange={(_, checked) => updateSettingsField('bankTransferEnabled', checked)}
                  />
                )}
                label={strings.SETTINGS_BANK_TRANSFER_ENABLED}
              />
              <FormControlLabel
                control={(
                  <Switch
                    checked={Boolean(settings?.cardPaymentEnabled)}
                    onChange={(_, checked) => updateSettingsField('cardPaymentEnabled', checked)}
                  />
                )}
                label={strings.SETTINGS_CARD_ENABLED}
              />
              <FormControlLabel
                control={(
                  <Switch
                    checked={Boolean(settings?.d17PaymentEnabled)}
                    onChange={(_, checked) => updateSettingsField('d17PaymentEnabled', checked)}
                  />
                )}
                label={strings.SETTINGS_D17_ENABLED}
              />
              <TextField
                label={strings.SETTINGS_RIB_INFORMATION}
                multiline
                minRows={3}
                value={settings?.bankTransferRibInformation || ''}
                onChange={(event) => updateSettingsField('bankTransferRibInformation', event.target.value)}
                fullWidth
              />
              <TextField
                label={strings.SETTINGS_RIB_ACCOUNT_HOLDER}
                value={settings?.bankTransferRibDetails?.accountHolder || ''}
                onChange={(event) => updateRibDetailsField('accountHolder', event.target.value)}
                error={ribErrors.accountHolder}
                helperText={ribErrors.accountHolder ? strings.SETTINGS_RIB_ACCOUNT_HOLDER_ERROR : ' '}
                fullWidth
              />
              <TextField
                label={strings.SETTINGS_RIB_BANK_NAME}
                value={settings?.bankTransferRibDetails?.bankName || ''}
                onChange={(event) => updateRibDetailsField('bankName', event.target.value)}
                error={ribErrors.bankName}
                helperText={ribErrors.bankName ? strings.SETTINGS_RIB_BANK_NAME_ERROR : ' '}
                fullWidth
              />
              <TextField
                label={strings.SETTINGS_RIB_BANK_ADDRESS}
                value={settings?.bankTransferRibDetails?.bankAddress || ''}
                onChange={(event) => updateRibDetailsField('bankAddress', event.target.value)}
                helperText=" "
                fullWidth
              />
              <TextField
                label={strings.SETTINGS_RIB_IBAN}
                value={settings?.bankTransferRibDetails?.iban || ''}
                onChange={(event) => updateRibDetailsField('iban', event.target.value)}
                error={ribErrors.iban}
                helperText={ribErrors.iban ? strings.SETTINGS_RIB_IBAN_ERROR : ' '}
                fullWidth
              />
              <TextField
                label={strings.SETTINGS_RIB_BIC}
                value={settings?.bankTransferRibDetails?.bic || ''}
                onChange={(event) => updateRibDetailsField('bic', event.target.value)}
                error={ribErrors.bic}
                helperText={ribErrors.bic ? strings.SETTINGS_RIB_BIC_ERROR : ' '}
                fullWidth
              />
              <TextField
                label={strings.SETTINGS_RIB_ACCOUNT_NUMBER}
                value={settings?.bankTransferRibDetails?.accountNumber || ''}
                onChange={(event) => updateRibDetailsField('accountNumber', event.target.value)}
                error={ribErrors.accountNumber}
                helperText={ribErrors.accountNumber ? strings.SETTINGS_RIB_ACCOUNT_NUMBER_ERROR : ' '}
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
