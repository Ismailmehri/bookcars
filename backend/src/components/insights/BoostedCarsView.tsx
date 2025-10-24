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

type BoostedCarRow = Omit<bookcarsTypes.Car, 'supplier'> & {
  supplier?: bookcarsTypes.User | null
  supplierId?: string | null
}

interface DialogState {
  car: BoostedCarRow
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

const buildBoostForm = (car: BoostedCarRow): BoostFormState => {
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

const getBoostStatusLabel = (boost?: bookcarsTypes.CarBoost | null) => {
  if (!boost || !boost.active) {
    return strings.BOOSTED_STATUS_INACTIVE
  }

  if (boost.paused) {
    return strings.BOOSTED_STATUS_PAUSED
  }

  return strings.BOOSTED_STATUS_ACTIVE
}

const resolveSupplier = (car?: Partial<BoostedCarRow> | null) => {
  if (!car || typeof car !== 'object') {
    return null
  }

  const supplier = car.supplier as unknown
  if (!supplier || typeof supplier !== 'object') {
    return null
  }

  const maybeUser = supplier as Partial<bookcarsTypes.User>
  return maybeUser._id ? maybeUser as bookcarsTypes.User : null
}

const isBoostedCarRow = (value: unknown): value is BoostedCarRow => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<BoostedCarRow>
  return typeof candidate._id === 'string' && typeof candidate.name === 'string'
}

const BoostedCarsView: React.FC<BoostedCarsViewProps> = ({ agencyOptions, filtersVersion, defaultAgencyId }) => {
  const [cars, setCars] = useState<BoostedCarRow[]>([])
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
  const language = strings.getLanguage()

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

    try {
      setLoading(true)
      setError(null)

      const data = await CarService.getCars(keyword, payload, model.page + 1, model.pageSize)
      const pageData = Array.isArray(data) && data.length > 0 ? data[0] : undefined
      const totalRecords = Array.isArray(pageData?.pageInfo)
        ? pageData?.pageInfo?.[0]?.totalRecords ?? 0
        : pageData?.pageInfo?.totalRecords ?? 0

      const sanitizedCars = ((pageData?.resultData ?? []) as unknown[])
        .filter(isBoostedCarRow)
        .map((item) => {
          const supplier = resolveSupplier(item)
          const rawSupplier = (item as { supplier?: unknown }).supplier
          const supplierId = supplier?._id ?? (typeof rawSupplier === 'string' ? rawSupplier : null)

          return {
            ...item,
            supplier,
            supplierId,
          }
        })

      setCars(sanitizedCars)
      setRowCount(totalRecords)
      setLastUpdated(new Date())
    } catch (err) {
      helper.error(err, strings.BOOSTED_ERROR)
      setError(strings.BOOSTED_ERROR)
    } finally {
      setLoading(false)
    }
  }, [agencyFilter, agencyOptions, searchQuery, statusFilter])

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

  const handleOpenDialog = useCallback((car: BoostedCarRow) => {
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

  const persistBoostUpdate = (carId: string, boost: bookcarsTypes.CarBoost) => {
    setCars((prev) => prev.map((item) => (
      item._id === carId
        ? { ...item, boost }
        : item
    )))
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

      let boost: bookcarsTypes.CarBoost

      if (car.boost) {
        boost = await CarService.updateCarBoost(car._id, payload)
      } else {
        boost = await CarService.createCarBoost(car._id, payload)
      }

      persistBoostUpdate(car._id, boost)
      setDialog(null)
    } catch (err) {
      helper.error(err, strings.ERROR)
      setDialog((prev) => (prev ? { ...prev, error: strings.ERROR, saving: false } : prev))
    }
  }

  const columns: GridColDef<BoostedCarRow>[] = useMemo(() => [
    {
      field: 'name',
      headerName: strings.BOOSTED_TABLE_CAR,
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'supplier',
      headerName: strings.BOOSTED_TABLE_AGENCY,
      flex: 1,
      minWidth: 160,
      valueGetter: (params) => {
        const supplier = resolveSupplier(params?.row)
        return supplier?.fullName ?? '—'
      },
    },
    {
      field: 'status',
      headerName: strings.BOOSTED_TABLE_STATUS,
      flex: 0.8,
      minWidth: 140,
      valueGetter: (params) => getBoostStatusLabel(params?.row?.boost),
    },
    {
      field: 'purchasedViews',
      headerName: strings.BOOSTED_TABLE_PURCHASED,
      type: 'number',
      width: 150,
      valueGetter: (params) => params?.row?.boost?.purchasedViews ?? 0,
    },
    {
      field: 'consumedViews',
      headerName: strings.BOOSTED_TABLE_CONSUMED,
      type: 'number',
      width: 150,
      valueGetter: (params) => params?.row?.boost?.consumedViews ?? 0,
    },
    {
      field: 'startDate',
      headerName: strings.BOOSTED_TABLE_START,
      width: 140,
      valueGetter: (params) => formatDate(params?.row?.boost?.startDate ?? null),
    },
    {
      field: 'endDate',
      headerName: strings.BOOSTED_TABLE_END,
      width: 140,
      valueGetter: (params) => formatDate(params?.row?.boost?.endDate ?? null),
    },
    {
      field: 'actions',
      headerName: strings.BOOSTED_TABLE_ACTIONS,
      sortable: false,
      width: 140,
      renderCell: ({ row }) => (row ? (
        <LoadingButton
          variant="outlined"
          size="small"
          onClick={() => handleOpenDialog(row)}
        >
          {row.boost ? strings.BOOSTED_ACTION_MANAGE : strings.BOOSTED_ACTION_ACTIVATE}
        </LoadingButton>
      ) : null),
    },
  ], [handleOpenDialog, language])

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
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => {
            setPaginationModel(model)
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
