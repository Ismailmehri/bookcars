import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/insights'
import * as helper from '@/common/helper'
import * as CarService from '@/services/CarService'
import { type AgencyOption } from '@/pages/insights.helpers'

interface BoostedCarsViewProps {
  agencyOptions: AgencyOption[]
  filtersVersion: number
  defaultAgencyId?: string
}

interface BoostFormState {
  active: boolean
  paused: boolean
  purchasedViews: number
  consumedViews: number
  startDate: string
  endDate: string
}

type BoostStatusKey = 'active' | 'paused' | 'inactive'

type BoostedCarRow = Omit<bookcarsTypes.Car, 'supplier'> & {
  supplier?: bookcarsTypes.User | null
  supplierId?: string | null
}

interface BoostedCarGridRow extends BoostedCarRow {
  supplierName: string
  boostStatusKey: BoostStatusKey
  purchasedViewsValue: number
  consumedViewsValue: number
  startDateLabel: string
  endDateLabel: string
}

type AnyRecord = Record<string, unknown>

const GRID_SORT_FIELD_MAP: Record<string, bookcarsTypes.CarSortField> = {
  name: 'name',
  supplierName: 'supplierName',
  boostStatusKey: 'boostStatus',
  purchasedViewsValue: 'boostPurchasedViews',
  consumedViewsValue: 'boostConsumedViews',
  startDateLabel: 'boostStartDate',
  endDateLabel: 'boostEndDate',
}

const resolveSortFromModel = (model: GridSortModel): bookcarsTypes.CarSortOptions | undefined => {
  if (!model || model.length === 0) {
    return undefined
  }

  const [{ field, sort }] = model

  if (!sort) {
    return undefined
  }

  const mappedField = GRID_SORT_FIELD_MAP[field]

  if (!mappedField) {
    return undefined
  }

  return {
    field: mappedField,
    order: sort === 'desc' ? 'desc' : 'asc',
  }
}

const toPlainObject = (value: unknown): AnyRecord | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  if (value instanceof Map) {
    return Object.fromEntries(value.entries())
  }

  if ('toObject' in value && typeof (value as { toObject?: () => unknown }).toObject === 'function') {
    const plain = (value as { toObject: () => unknown }).toObject()
    return plain && typeof plain === 'object' ? plain as AnyRecord : null
  }

  return value as AnyRecord
}

const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false
    }
  }

  return false
}

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return fallback
}

const parseDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return undefined
}

const normalizeBoost = (value: unknown): bookcarsTypes.CarBoost | null => {
  const plain = toPlainObject(value)

  if (!plain) {
    return null
  }

  const boost: bookcarsTypes.CarBoost = {
    active: parseBoolean(plain.active),
    paused: parseBoolean(plain.paused),
    purchasedViews: parseNumber(plain.purchasedViews),
    consumedViews: parseNumber(plain.consumedViews),
  }

  const startDate = parseDate(plain.startDate)
  const endDate = parseDate(plain.endDate)
  const createdAt = parseDate(plain.createdAt)
  const lastViewAt = parseDate(plain.lastViewAt)

  if (startDate) {
    boost.startDate = startDate
  }
  if (endDate) {
    boost.endDate = endDate
  }
  if (createdAt) {
    boost.createdAt = createdAt
  }
  if (lastViewAt) {
    boost.lastViewAt = lastViewAt
  }

  return boost
}

interface DialogState {
  car: BoostedCarGridRow
  form: BoostFormState
  error: string | null
  saving: boolean
}

const DEFAULT_PAGE_SIZE = 20

const formatDate = (value?: Date | string | null) => {
  if (!value) {
    return '—'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString()
}

const formatInputDate = (value?: Date | string | null) => {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().split('T')[0]
}

const buildBoostForm = (car: BoostedCarGridRow): BoostFormState => {
  const now = new Date()
  const defaultEnd = new Date(now)
  defaultEnd.setMonth(defaultEnd.getMonth() + 1)

  if (car.boost) {
    return {
      active: car.boost.active,
      paused: car.boost.paused,
      purchasedViews: car.boost.purchasedViews,
      consumedViews: car.boost.consumedViews,
      startDate: formatInputDate(car.boost.startDate),
      endDate: formatInputDate(car.boost.endDate),
    }
  }

  return {
    active: true,
    paused: false,
    purchasedViews: 2500,
    consumedViews: 0,
    startDate: formatInputDate(now),
    endDate: formatInputDate(defaultEnd),
  }
}

const parseBoostStatusKey = (value: unknown): BoostStatusKey | null => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (['active', 'actif', 'enabled', 'enable'].includes(normalized)) {
      return 'active'
    }

    if (['paused', 'pause', 'en pause'].includes(normalized)) {
      return 'paused'
    }

    if (['inactive', 'inactif', 'disabled', 'disable', 'off'].includes(normalized)) {
      return 'inactive'
    }
  }

  if (typeof value === 'number') {
    if (value === 0) {
      return 'active'
    }
    if (value === 1) {
      return 'paused'
    }
    if (value === 2) {
      return 'inactive'
    }
  }

  return null
}

const getBoostStatusKey = (
  boost?: bookcarsTypes.CarBoost | null,
  explicitStatus?: BoostStatusKey | null,
): BoostStatusKey => {
  if (explicitStatus) {
    return explicitStatus
  }

  if (!boost) {
    return 'inactive'
  }

  if (boost.paused) {
    return 'paused'
  }

  if (boost.active) {
    return 'active'
  }

  return 'inactive'
}

const parseIdentifier = (value: unknown): string | null => {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof value === 'object' && 'toString' in value) {
    const toStringFn = (value as { toString?: () => string }).toString
    if (typeof toStringFn !== 'function') {
      return null
    }

    const stringified = toStringFn.call(value)
    if (stringified && stringified !== '[object Object]') {
      return stringified
    }
  }

  return null
}

const resolveSupplier = (car?: Partial<BoostedCarRow> | null) => {
  if (!car || typeof car !== 'object') {
    return null
  }

  const supplierValue = (car as { supplier?: unknown }).supplier
  const plainSupplier = toPlainObject(supplierValue)

  if (!plainSupplier) {
    return null
  }

  const supplierCandidate = plainSupplier as Partial<bookcarsTypes.User>
  const supplierId = parseIdentifier(supplierCandidate._id)
  const fullName = typeof supplierCandidate.fullName === 'string' ? supplierCandidate.fullName : ''

  if (!supplierId && !fullName.trim()) {
    return null
  }

  const supplier: bookcarsTypes.User = {
    ...supplierCandidate,
    _id: supplierId ?? undefined,
    fullName,
  }

  return supplier
}

const isBoostedCarRow = (value: unknown): value is BoostedCarRow => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<BoostedCarRow> & { _id?: unknown; name?: unknown }
  const identifier = parseIdentifier(candidate._id)

  return Boolean(identifier) && typeof candidate.name === 'string'
}

const BoostedCarsView: React.FC<BoostedCarsViewProps> = ({ agencyOptions, filtersVersion, defaultAgencyId }) => {
  const [cars, setCars] = useState<BoostedCarGridRow[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'inactive'>('all')
  const [agencyFilter, setAgencyFilter] = useState('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: DEFAULT_PAGE_SIZE })
  const [sortModel, setSortModel] = useState<GridSortModel>([])

  const agencyNameMap = useMemo(() => {
    const map = new Map<string, string>()
    agencyOptions.forEach((option) => {
      map.set(option.id, option.name)
    })
    return map
  }, [agencyOptions])

  const decorateBoostedRow = useCallback((car: BoostedCarRow): BoostedCarGridRow => {
    const supplier = resolveSupplier(car)
    const rawSupplierId = (car as { supplierId?: unknown }).supplierId
    const supplierId = parseIdentifier(rawSupplierId)
      ?? (supplier?._id ? parseIdentifier(supplier._id) : null)

    const rawSupplierName = typeof (car as { supplierName?: unknown }).supplierName === 'string'
      ? (car as { supplierName: string }).supplierName
      : ''

    const rawStatusCandidate = (car as { boostStatus?: unknown }).boostStatus
      ?? (car as { boostStatusKey?: unknown }).boostStatusKey
      ?? (car as { status?: unknown }).status
    const explicitStatus = parseBoostStatusKey(rawStatusCandidate)
    const boost = normalizeBoost((car as { boost?: unknown }).boost) ?? undefined
    const boostStatusKey = getBoostStatusKey(boost, explicitStatus)

    const supplierNameCandidates = [
      supplier?.fullName,
      rawSupplierName,
      supplierId ? agencyNameMap.get(supplierId) : undefined,
    ]

    const supplierName = supplierNameCandidates
      .map((name) => (typeof name === 'string' ? name.trim() : ''))
      .find((name) => name.length > 0) ?? '—'

    return {
      ...car,
      supplier,
      supplierId: supplierId ?? null,
      boost,
      supplierName,
      boostStatusKey,
      purchasedViewsValue: boost?.purchasedViews ?? 0,
      consumedViewsValue: boost?.consumedViews ?? 0,
      startDateLabel: formatDate(boost?.startDate ?? null),
      endDateLabel: formatDate(boost?.endDate ?? null),
    }
  }, [agencyNameMap])

  const loadCars = useCallback(async (model: GridPaginationModel) => {
    if (agencyOptions.length === 0) {
      setCars([])
      setRowCount(0)
      return
    }

    const keyword = searchQuery
    const supplierIds = agencyFilter
      ? [agencyFilter]
      : agencyOptions.map((option) => option.id)
    const payload: bookcarsTypes.GetCarsPayload = {
      suppliers: supplierIds,
      boostStatus: statusFilter === 'all' ? undefined : statusFilter,
    }

    const sortOptions = resolveSortFromModel(sortModel)

    if (sortOptions) {
      payload.sort = sortOptions
    }

    try {
      setLoading(true)
      setError(null)

      const data = await CarService.getCars(keyword, payload, model.page + 1, model.pageSize)
      const pageData = Array.isArray(data) && data.length > 0 ? data[0] : undefined
      const totalRecords = Array.isArray(pageData?.pageInfo)
        ? pageData?.pageInfo?.[0]?.totalRecords ?? 0
        : pageData?.pageInfo?.totalRecords ?? 0

      const sanitizedCars = ((pageData?.resultData ?? []) as unknown[])
        .map((item) => toPlainObject(item) ?? item)
        .reduce<BoostedCarGridRow[]>((rows, plainCar) => {
          if (!isBoostedCarRow(plainCar)) {
            return rows
          }

          const normalizedId = parseIdentifier((plainCar as { _id?: unknown })._id)
          if (!normalizedId) {
            return rows
          }

          const normalizedCar: BoostedCarRow = {
            ...(plainCar as BoostedCarRow),
            _id: normalizedId,
          }

          rows.push(decorateBoostedRow(normalizedCar))
          return rows
        }, [])

      setCars(sanitizedCars)
      setRowCount(totalRecords)
      setLastUpdated(new Date())
    } catch (err) {
      helper.error(err, strings.BOOSTED_ERROR)
      setError(strings.BOOSTED_ERROR)
    } finally {
      setLoading(false)
    }
  }, [agencyFilter, agencyOptions, decorateBoostedRow, searchQuery, sortModel, statusFilter])

  useEffect(() => {
    if (agencyOptions.length === 0) {
      return
    }

    loadCars(paginationModel).catch((err) => {
      helper.error(err, strings.BOOSTED_ERROR)
    })
  }, [agencyOptions, filtersVersion, loadCars, paginationModel])

  useEffect(() => {
    setAgencyFilter(defaultAgencyId ?? '')
  }, [defaultAgencyId, filtersVersion])

  useEffect(() => {
    setPaginationModel((prev) => (prev.page === 0
      ? prev
      : { ...prev, page: 0 }))
  }, [agencyFilter, searchQuery, statusFilter])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearchQuery(searchInput.trim())
    }, 300)

    return () => {
      window.clearTimeout(handle)
    }
  }, [searchInput])

  const handleOpenDialog = useCallback((car: BoostedCarGridRow) => {
    setDialog({
      car,
      form: buildBoostForm(car),
      error: null,
      saving: false,
    })
  }, [])

  const handleCloseDialog = () => {
    setDialog(null)
  }

  const handleDialogChange = <K extends keyof BoostFormState>(key: K, value: BoostFormState[K]) => {
    setDialog((prev) => {
      if (!prev) {
        return prev
      }
      return {
        ...prev,
        form: {
          ...prev.form,
          [key]: value,
        },
        error: null,
      }
    })
  }

  const persistBoostUpdate = (carId: string, boost: bookcarsTypes.CarBoost | null) => {
    setCars((prev) => prev.map((item) => {
      if (item._id !== carId) {
        return item
      }

      return decorateBoostedRow({
        ...item,
        boost: boost ?? undefined,
      })
    }))
  }

  const handleDialogSave = async () => {
    if (!dialog) {
      return
    }

    const { car, form } = dialog

    if (!form.startDate || !form.endDate) {
      setDialog((prev) => (prev ? { ...prev, error: strings.BOOSTED_DIALOG_ERROR_RANGE } : prev))
      return
    }

    const startDate = new Date(form.startDate)
    const endDate = new Date(form.endDate)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate.getTime() < startDate.getTime()) {
      setDialog((prev) => (prev ? { ...prev, error: strings.BOOSTED_DIALOG_ERROR_RANGE } : prev))
      return
    }

    if (form.consumedViews > form.purchasedViews) {
      setDialog((prev) => (prev ? { ...prev, error: strings.BOOSTED_DIALOG_ERROR_CONSUMED } : prev))
      return
    }

    try {
      setDialog((prev) => (prev ? { ...prev, saving: true, error: null } : prev))

      const payload = {
        active: form.active,
        paused: form.active ? form.paused : false,
        purchasedViews: form.purchasedViews,
        consumedViews: form.consumedViews,
        startDate,
        endDate,
      }

      let boost: bookcarsTypes.CarBoost | null

      if (car.boost) {
        boost = normalizeBoost(await CarService.updateCarBoost(car._id, payload))
      } else {
        boost = normalizeBoost(await CarService.createCarBoost(car._id, payload))
      }

      persistBoostUpdate(car._id, boost)
      setDialog(null)
    } catch (err) {
      helper.error(err, strings.ERROR)
      setDialog((prev) => (prev ? { ...prev, error: strings.ERROR, saving: false } : prev))
    }
  }

  const statusLabels = useMemo(() => ({
    active: strings.BOOSTED_STATUS_ACTIVE,
    paused: strings.BOOSTED_STATUS_PAUSED,
    inactive: strings.BOOSTED_STATUS_INACTIVE,
  }), [])

  const columns: GridColDef<BoostedCarGridRow>[] = useMemo(() => [
    {
      field: 'name',
      headerName: strings.BOOSTED_TABLE_CAR,
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'supplierName',
      headerName: strings.BOOSTED_TABLE_AGENCY,
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'boostStatusKey',
      headerName: strings.BOOSTED_TABLE_STATUS,
      flex: 0.8,
      minWidth: 140,
      valueFormatter: (params) => {
        // Assume 'params.value' contains the BoostStatusKey
        const key = (params ?? 'inactive') as BoostStatusKey
        return statusLabels[key]
      },
    },
    {
      field: 'purchasedViewsValue',
      headerName: strings.BOOSTED_TABLE_PURCHASED,
      type: 'number',
      width: 150,
    },
    {
      field: 'consumedViewsValue',
      headerName: strings.BOOSTED_TABLE_CONSUMED,
      type: 'number',
      width: 150,
    },
    {
      field: 'startDateLabel',
      headerName: strings.BOOSTED_TABLE_START,
      width: 140,
    },
    {
      field: 'endDateLabel',
      headerName: strings.BOOSTED_TABLE_END,
      width: 140,
    },
    {
      field: 'actions',
      headerName: strings.BOOSTED_TABLE_ACTIONS,
      sortable: false,
      width: 140,
      renderCell: (params) => {
        const row = params?.row as BoostedCarGridRow | undefined
        if (!row) {
          return null
        }

        return (
          <LoadingButton
            variant="outlined"
            size="small"
            onClick={() => handleOpenDialog(row)}
          >
            {row.boost ? strings.BOOSTED_ACTION_MANAGE : strings.BOOSTED_ACTION_ACTIVATE}
          </LoadingButton>
        )
      },
    },
  ], [
    handleOpenDialog,
    statusLabels,
  ])

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1E88E5' }}>
            {strings.BOOSTED_TITLE}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {strings.BOOSTED_DESCRIPTION}
          </Typography>
          {lastUpdated ? (
            <Typography variant="caption" color="text.secondary">
              {`${strings.DATA_REFRESHED} : ${lastUpdated.toLocaleString()}`}
            </Typography>
          ) : null}
        </Box>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={() => loadCars(paginationModel).catch((err) => helper.error(err, strings.BOOSTED_ERROR))}
          loading={loading}
        >
          {strings.BOOSTED_REFRESH}
        </LoadingButton>
      </Stack>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label={strings.BOOSTED_SEARCH_PLACEHOLDER}
            placeholder={strings.BOOSTED_SEARCH_PLACEHOLDER}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            inputProps={{ 'aria-label': strings.BOOSTED_SEARCH_PLACEHOLDER }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Autocomplete
            options={[{ id: '', name: strings.BOOSTED_AGENCY_ALL }, ...agencyOptions]}
            value={[{ id: '', name: strings.BOOSTED_AGENCY_ALL }, ...agencyOptions]
              .find((option) => option.id === agencyFilter) ?? { id: '', name: strings.BOOSTED_AGENCY_ALL }}
            onChange={(_event, option) => setAgencyFilter(option?.id ?? '')}
            fullWidth
            disableClearable
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={strings.AGENCY_SEARCH_PLACEHOLDER}
              />
            )}
            ListboxProps={{ style: { maxHeight: 320 } }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label={strings.BOOSTED_STATUS_LABEL}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          >
            <MenuItem value="all">{strings.BOOSTED_STATUS_ALL}</MenuItem>
            <MenuItem value="active">{strings.BOOSTED_STATUS_ACTIVE}</MenuItem>
            <MenuItem value="paused">{strings.BOOSTED_STATUS_PAUSED}</MenuItem>
            <MenuItem value="inactive">{strings.BOOSTED_STATUS_INACTIVE}</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box sx={{ height: 520, width: '100%', background: '#fff', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <DataGrid
          disableColumnMenu
          autoHeight={false}
          getRowId={(row) => row._id}
          rows={cars}
          columns={columns}
          loading={loading}
          paginationMode="server"
          sortingMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          sortModel={sortModel}
          onPaginationModelChange={(model) => {
            setPaginationModel(model)
          }}
          onSortModelChange={(model) => {
            setSortModel(model)
            setPaginationModel((prev) => (prev.page === 0 ? prev : { ...prev, page: 0 }))
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          sx={{
            '&.MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#F5F9FF',
              color: '#1E88E5',
              fontWeight: 600,
            },
          }}
          localeText={{
            noRowsLabel: loading ? strings.LOADING : strings.BOOSTED_EMPTY,
          }}
        />
      </Box>

      <Dialog open={Boolean(dialog)} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialog?.car.boost ? strings.BOOSTED_DIALOG_TITLE_EDIT : strings.BOOSTED_DIALOG_TITLE_CREATE}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {dialog?.error ? <Alert severity="error">{dialog.error}</Alert> : null}
          <FormControlLabel
            control={(
              <Switch
                checked={dialog?.form.active ?? false}
                onChange={(event) => handleDialogChange('active', event.target.checked)}
              />
            )}
            label={strings.BOOSTED_DIALOG_ACTIVE}
          />
          <FormControlLabel
            control={(
              <Switch
                checked={dialog?.form.paused ?? false}
                onChange={(event) => handleDialogChange('paused', event.target.checked)}
                disabled={!(dialog?.form.active ?? false)}
              />
            )}
            label={strings.BOOSTED_DIALOG_PAUSED}
          />
          <TextField
            type="number"
            label={strings.BOOSTED_DIALOG_PURCHASED}
            value={dialog?.form.purchasedViews ?? 0}
            onChange={(event) => handleDialogChange('purchasedViews', Number.parseInt(event.target.value, 10) || 0)}
            inputProps={{ min: 0 }}
          />
          <TextField
            type="number"
            label={strings.BOOSTED_DIALOG_CONSUMED}
            value={dialog?.form.consumedViews ?? 0}
            onChange={(event) => handleDialogChange('consumedViews', Number.parseInt(event.target.value, 10) || 0)}
            inputProps={{ min: 0 }}
          />
          <TextField
            type="date"
            label={strings.BOOSTED_DIALOG_START}
            InputLabelProps={{ shrink: true }}
            value={dialog?.form.startDate ?? ''}
            onChange={(event) => handleDialogChange('startDate', event.target.value)}
          />
          <TextField
            type="date"
            label={strings.BOOSTED_DIALOG_END}
            InputLabelProps={{ shrink: true }}
            value={dialog?.form.endDate ?? ''}
            onChange={(event) => handleDialogChange('endDate', event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={handleCloseDialog} color="inherit">
            {strings.BOOSTED_DIALOG_CANCEL}
          </LoadingButton>
          <LoadingButton onClick={handleDialogSave} loading={dialog?.saving ?? false} variant="contained">
            {strings.BOOSTED_DIALOG_SAVE}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default BoostedCarsView
