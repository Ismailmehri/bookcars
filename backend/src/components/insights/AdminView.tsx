import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/DownloadOutlined'
import { LoadingButton } from '@mui/lab'
import { formatCurrency, formatNumber, formatPercentage } from '@/common/format'
import * as helper from '@/common/helper'
import TableSimple, { TableColumn } from './TableSimple'
import KpiCard from './KpiCard'
import {
  RevenueLineChart,
  ViewsLineChart,
  StatusPieChart,
  StatusRevenuePieChart,
  AcceptCancelBarChart,
  AverageDurationBarChart,
  WeeklyTrendChart,
  ModelRevenueBarChart,
  ModelOccupancyBarChart,
} from './Charts'
import { strings } from '@/lang/insights'
import * as bookcarsTypes from ':bookcars-types'
import { type AdminMetricsViewModel } from '@/pages/insights.types'
import * as InsightsActionService from '@/services/InsightsActionService'
import BulkEmailDialog from './actions/BulkEmailDialog'
import BulkSmsDialog from './actions/BulkSmsDialog'
import BlockAgenciesDialog from './actions/BlockAgenciesDialog'
import UnblockAgenciesDialog from './actions/UnblockAgenciesDialog'
import AddNoteDialog from './actions/AddNoteDialog'

interface AdminViewProps {
  loading: boolean
  metrics: AdminMetricsViewModel
  onExport: () => void
  onRankingRefresh: () => Promise<void>
}

const AdminView: React.FC<AdminViewProps> = ({ loading, metrics, onExport, onRankingRefresh }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [smsDialogOpen, setSmsDialogOpen] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => metrics.ranking.some((item) => item.agencyId === id)))
  }, [metrics.ranking])

  const selectedAgencies = useMemo(
    () => metrics.ranking.filter((item) => selectedIds.includes(item.agencyId)),
    [metrics.ranking, selectedIds],
  )

  const hasBlockedSelection = useMemo(
    () => selectedAgencies.some((agency) => agency.blocked),
    [selectedAgencies],
  )

  const reasonLabels: Record<string, string> = {
    MISSING_EMAIL: strings.REASON_MISSING_EMAIL,
    EMAIL_SEND_FAILED: strings.REASON_EMAIL_FAILED,
    INVALID_PHONE: strings.REASON_INVALID_PHONE,
    SMS_SEND_FAILED: strings.REASON_SMS_FAILED,
    BLOCK_FAILED: strings.REASON_BLOCK_FAILED,
    UNBLOCK_FAILED: strings.REASON_UNBLOCK_FAILED,
    NOTE_SAVE_FAILED: strings.REASON_NOTE_FAILED,
    AGENCY_NOT_FOUND: strings.REASON_NOT_FOUND,
    INVALID_AGENCY_ID: strings.REASON_INVALID_ID,
    ALREADY_ACTIVE: strings.REASON_ALREADY_ACTIVE,
  }

  const formatFailures = (entries: bookcarsTypes.BulkActionFailureEntry[]) => {
    if (entries.length === 0) {
      return ''
    }
    const summary = entries
      .slice(0, 3)
      .map((entry) => `${entry.agencyName}: ${reasonLabels[entry.reason] ?? entry.reason}`)
      .join(', ')

    return entries.length > 3 ? `${summary}, …` : summary
  }

  const handleBulkOutcome = (result: bookcarsTypes.BulkActionResponse, successMessage: string) => {
    if (result.succeeded.length > 0) {
      helper.info(successMessage.replace('{count}', result.succeeded.length.toString()))
    }

    if (result.failed.length > 0) {
      helper.error(
        undefined,
        strings.BULK_ACTION_FAILURE
          .replace('{count}', result.failed.length.toString())
          .replace('{details}', formatFailures(result.failed) || '—'),
      )
    }

    if (result.warnings.length > 0) {
      helper.info(
        strings.BULK_ACTION_WARNINGS
          .replace('{count}', result.warnings.length.toString())
          .replace('{details}', formatFailures(result.warnings) || '—'),
      )
    }

    if (result.failed.length === 0 && result.warnings.length === 0) {
      setSelectedIds([])
    }
  }

  const handleEmailSubmit = async (payload: { subject: string; message: string }) => {
    try {
      setActionLoading(true)
      const result = await InsightsActionService.sendBulkEmail({
        agencyIds: selectedIds,
        ...payload,
      })
      handleBulkOutcome(result, strings.BULK_ACTION_SUCCESS)
      setEmailDialogOpen(false)
    } catch (err) {
      helper.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSmsSubmit = async (payload: { message: string }) => {
    try {
      setActionLoading(true)
      const result = await InsightsActionService.sendBulkSms({
        agencyIds: selectedIds,
        ...payload,
      })
      handleBulkOutcome(result, strings.BULK_ACTION_SUCCESS)
      setSmsDialogOpen(false)
    } catch (err) {
      helper.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBlockSubmit = async (
    payload: {
      reason: string
      notifyByEmail: boolean
      notifyBySms: boolean
      emailSubject?: string
      emailMessage?: string
      smsMessage?: string
    },
  ) => {
    try {
      setActionLoading(true)
      const result = await InsightsActionService.blockAgencies({
        agencyIds: selectedIds,
        ...payload,
      })
      if (result.succeeded.length > 0) {
        await onRankingRefresh()
      }
      handleBulkOutcome(result, strings.BULK_ACTION_SUCCESS)
      setBlockDialogOpen(false)
    } catch (err) {
      helper.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblockSubmit = async (payload: { reason: string }) => {
    try {
      setActionLoading(true)
      const result = await InsightsActionService.unblockAgencies({
        agencyIds: selectedIds,
        ...payload,
      })
      if (result.succeeded.length > 0) {
        await onRankingRefresh()
      }
      handleBulkOutcome(result, strings.BULK_ACTION_SUCCESS)
      setUnblockDialogOpen(false)
    } catch (err) {
      helper.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleNoteSubmit = async (payload: { note: string }) => {
    try {
      setActionLoading(true)
      const result = await InsightsActionService.addManualNote({
        agencyIds: selectedIds,
        note: payload.note,
      })
      handleBulkOutcome(result, strings.BULK_ACTION_SUCCESS)
      setNoteDialogOpen(false)
    } catch (err) {
      helper.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const rankingColumns: TableColumn<bookcarsTypes.AgencyRankingItem>[] = [
    {
      key: 'agencyId',
      label: '#',
      render: (_row, index) => index + 1,
      sortable: false,
    },
    {
      key: 'agencyName',
      label: strings.TABLE_AGENCY_RANKING,
      sortValue: (row) => row.agencyName.toLowerCase(),
      render: (row) => (
        <Link
          href={`/user?u=${row.agencyId}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="primary"
        >
          {row.agencyName}
        </Link>
      ),
    },
    {
      key: 'blocked',
      label: strings.TABLE_COL_AGENCY_STATUS,
      align: 'center',
      sortable: false,
      render: (row) => (
        <Chip
          size="small"
          color={row.blocked ? 'error' : 'success'}
          label={row.blocked ? strings.AGENCY_STATUS_BLOCKED : strings.AGENCY_STATUS_ACTIVE}
          variant={row.blocked ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      key: 'revenue',
      label: strings.TABLE_COL_REVENUE,
      align: 'right',
      render: (row) => formatCurrency(row.revenue),
    },
    {
      key: 'totalCars',
      label: strings.TABLE_COL_CARS,
      align: 'right',
      render: (row) => formatNumber(row.totalCars, { maximumFractionDigits: 0 }),
    },
    {
      key: 'totalBookings',
      label: strings.TABLE_COL_BOOKINGS,
      align: 'right',
      render: (row) => formatNumber(row.totalBookings, { maximumFractionDigits: 0 }),
    },
    {
      key: 'acceptanceRate',
      label: strings.TABLE_COL_ACCEPTANCE,
      align: 'right',
      render: (row) => formatPercentage(row.acceptanceRate),
    },
    {
      key: 'cancellationRate',
      label: strings.TABLE_COL_CANCELLATION,
      align: 'right',
      render: (row) => formatPercentage(row.cancellationRate),
    },
    {
      key: 'pendingUpdates',
      label: strings.TABLE_COL_PENDING,
      align: 'right',
      render: (row) => formatNumber(row.pendingUpdates, { maximumFractionDigits: 0 }),
    },
    {
      key: 'score',
      label: strings.TABLE_COL_SCORE,
      align: 'right',
      render: (row) => formatNumber(row.score, { maximumFractionDigits: 0 }),
    },
  ]

  const { summary } = metrics

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          {strings.ADMIN_TAB_INFO}
        </Typography>
        <Button variant="outlined" color="primary" startIcon={<DownloadIcon />} onClick={onExport}>
          {strings.EXPORT}
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_TOTAL_REVENUE}
            value={formatCurrency(summary.totalRevenue)}
            tooltip={strings.KPI_REVENUE_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_TOTAL_BOOKINGS}
            value={formatNumber(summary.totalBookings, { maximumFractionDigits: 0 })}
            tooltip={strings.KPI_BOOKINGS_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_AGENCIES} value={formatNumber(summary.activeAgencies, { maximumFractionDigits: 0 })} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_ACCEPTANCE}
            value={formatPercentage(summary.acceptanceRate)}
            tooltip={strings.KPI_ACCEPTANCE_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_CANCELLATION}
            value={formatPercentage(summary.cancellationRate)}
            tooltip={strings.KPI_CANCELLATION_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_RATING}
            value={metrics.averageRating ? metrics.averageRating.toFixed(1) : strings.RATING_PLACEHOLDER}
            tooltip={strings.KPI_RATING_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.GLOBAL_OCCUPANCY}
            value={formatPercentage(summary.occupancyRate * 100)}
            tooltip={strings.OCCUPANCY_TOOLTIP}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_REVENUE_CURRENT_YEAR}
            value={formatCurrency(summary.currentYearRevenue)}
            tooltip={strings.KPI_REVENUE_CURRENT_YEAR_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_REVENUE_PREVIOUS_YEAR}
            value={formatCurrency(summary.previousYearRevenue)}
            tooltip={strings.KPI_REVENUE_PREVIOUS_YEAR_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_VIEWS_TO_BOOKINGS}
            value={formatPercentage(summary.conversionRate * 100)}
            tooltip={strings.KPI_VIEWS_TO_BOOKINGS_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_REBOOKING_RATE}
            value={formatPercentage(summary.rebookingRate * 100)}
            tooltip={strings.KPI_REBOOKING_RATE_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_LEAD_TIME}
            value={formatNumber(summary.averageLeadTime, { maximumFractionDigits: 1 })}
            tooltip={strings.KPI_LEAD_TIME_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_REVENUE_PER_BOOKING}
            value={formatCurrency(summary.averageRevenuePerBooking)}
            tooltip={strings.KPI_AVG_REVENUE_PER_BOOKING_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_DURATION}
            value={formatNumber(summary.averageDuration, { maximumFractionDigits: 1 })}
            tooltip={strings.KPI_AVG_DURATION_HELPER}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <RevenueLineChart data={metrics.monthlyRevenue} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <WeeklyTrendChart data={metrics.weeklyTrend} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ViewsLineChart data={metrics.viewsOverTime} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusPieChart data={metrics.statusBreakdown} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusRevenuePieChart data={metrics.statusBreakdown} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ModelRevenueBarChart data={metrics.revenueByModel} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ModelOccupancyBarChart data={metrics.occupancyByModel} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AcceptCancelBarChart
            accepted={summary.acceptedBookings}
            cancelled={summary.cancelledBookings}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <AverageDurationBarChart data={metrics.averageDurationByAgency} loading={loading} />
        </Grid>
      </Grid>

      <Stack spacing={1.5}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {strings.TABLE_AGENCY_RANKING}
        </Typography>
        {selectedAgencies.length > 0 ? (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              backgroundColor: '#FAFCFF',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {strings.ACTIONS_BAR_TITLE}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {strings.ACTIONS_SELECTION_COUNT.replace(
                    '{count}',
                    selectedAgencies.length.toString(),
                  )}
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} width={{ xs: '100%', sm: 'auto' }}>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  onClick={() => setEmailDialogOpen(true)}
                  disabled={actionLoading}
                >
                  {strings.ACTION_EMAIL}
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  onClick={() => setSmsDialogOpen(true)}
                  disabled={actionLoading}
                >
                  {strings.ACTION_SMS}
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  color="error"
                  onClick={() => setBlockDialogOpen(true)}
                  disabled={actionLoading}
                >
                  {strings.ACTION_BLOCK}
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  color="success"
                  onClick={() => setUnblockDialogOpen(true)}
                  disabled={actionLoading || !hasBlockedSelection}
                >
                  {strings.ACTION_UNBLOCK}
                </LoadingButton>
                <LoadingButton
                  variant="outlined"
                  color="primary"
                  onClick={() => setNoteDialogOpen(true)}
                  disabled={actionLoading}
                >
                  {strings.ACTION_NOTE}
                </LoadingButton>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => setSelectedIds([])}
                  disabled={actionLoading}
                >
                  {strings.ACTION_CLEAR}
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : null}
        <TableSimple
          columns={rankingColumns}
          data={metrics.ranking}
          emptyLabel={strings.EMPTY}
          rowsPerPageOptions={[5, 10, 25, 50]}
          initialRowsPerPage={10}
          mobileSortLabel={strings.TABLE_SORT_LABEL}
          getRowId={(row) => row.agencyId}
          selectable
          selectedRows={selectedIds}
          onSelectionChange={(_rows, ids) => setSelectedIds(ids.map((id) => String(id)))}
          selectionLabel={strings.ACTION_SELECTION_LABEL}
        />
      </Stack>

      <BulkEmailDialog
        open={emailDialogOpen}
        agencies={selectedAgencies}
        loading={actionLoading}
        onClose={() => setEmailDialogOpen(false)}
        onSubmit={handleEmailSubmit}
      />
      <BulkSmsDialog
        open={smsDialogOpen}
        agencies={selectedAgencies}
        loading={actionLoading}
        onClose={() => setSmsDialogOpen(false)}
        onSubmit={handleSmsSubmit}
      />
      <BlockAgenciesDialog
        open={blockDialogOpen}
        agencies={selectedAgencies}
        loading={actionLoading}
        onClose={() => setBlockDialogOpen(false)}
        onSubmit={handleBlockSubmit}
      />
      <UnblockAgenciesDialog
        open={unblockDialogOpen}
        agencies={selectedAgencies}
        loading={actionLoading}
        onClose={() => setUnblockDialogOpen(false)}
        onSubmit={handleUnblockSubmit}
      />
      <AddNoteDialog
        open={noteDialogOpen}
        agencies={selectedAgencies}
        loading={actionLoading}
        onClose={() => setNoteDialogOpen(false)}
        onSubmit={handleNoteSubmit}
      />
    </Stack>
  )
}

export default AdminView
