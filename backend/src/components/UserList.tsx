import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridDensity,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid'
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  MoreVert,
  Launch,
  EditOutlined,
  LockReset,
  DeleteOutline,
  ContentCopy,
  Reviews,
} from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/user-list'
import { strings as usersPageStrings } from '@/lang/users'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import { UsersFiltersState } from '@/pages/users.types'

import '@/assets/css/user-list.css'
import {
  formatDateTime,
  getCreatedAtValue,
  getDateTimestamp,
  getLastLoginValue,
  applyListIndex,
  normalizeUsersResult,
} from '@/common/user-list.utils'

interface UserListProps {
  user?: bookcarsTypes.User
  keyword: string
  filters: UsersFiltersState
  admin: boolean
  refreshToken: number
  selectionResetKey: number
  sortModel: GridSortModel
  onSortModelChange: (model: GridSortModel) => void
  columnVisibilityModel: GridColumnVisibilityModel
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void
  density: GridDensity
  onDensityChange?: (density: GridDensity) => void
  onSelectionChange: (selection: { ids: string[]; rows: bookcarsTypes.User[] }) => void
  onReviewsClick: (user: bookcarsTypes.User) => void
  onTotalChange?: (total: number) => void
  onLoadingChange?: (loading: boolean) => void
  onPageSummaryChange?: (summary: { from: number; to: number; total: number; pageSize: number }) => void
}

const defaultAdminRoles = [
  bookcarsTypes.UserType.Admin,
  bookcarsTypes.UserType.Supplier,
  bookcarsTypes.UserType.User,
]

const defaultAgencyRoles = [
  bookcarsTypes.UserType.Supplier,
  bookcarsTypes.UserType.User,
]

const ensureSortModelWithFallback = (model: GridSortModel): GridSortModel => {
  const filtered = model.filter((item) => Boolean(item.sort))
  if (filtered.length === 0) {
    return filtered
  }

  if (filtered[0].field === 'lastLoginAt' && !filtered.some((item) => item.field === 'fullName')) {
    return [...filtered, { field: 'fullName', sort: 'asc' }]
  }

  return filtered
}

const compareStrings = (a?: string | null, b?: string | null) => {
  const safeA = (a || '').toLowerCase()
  const safeB = (b || '').toLowerCase()
  if (safeA < safeB) return -1
  if (safeA > safeB) return 1
  return 0
}

const sortRows = (rows: bookcarsTypes.User[], model: GridSortModel) => {
  const effectiveModel = ensureSortModelWithFallback(model)
  if (!effectiveModel || effectiveModel.length === 0) {
    return [...rows]
  }

  const sorted = [...rows]
  sorted.sort((a, b) => {
    for (const sortItem of effectiveModel) {
      const { field, sort } = sortItem
      if (!sort) {
        continue
      }

      let comparison = 0

      if (field === 'lastLoginAt') {
        comparison = getDateTimestamp(getLastLoginValue(a)) - getDateTimestamp(getLastLoginValue(b))
      } else if (field === 'createdAt') {
        comparison = getDateTimestamp(getCreatedAtValue(a)) - getDateTimestamp(getCreatedAtValue(b))
      } else if (field === 'fullName') {
        comparison = compareStrings(a.fullName, b.fullName)
      }

      if (comparison !== 0) {
        return sort === 'asc' ? comparison : -comparison
      }
    }

    return 0
  })

  return sorted
}

// --- Overlays stables ---
const NoRowsOverlay: React.FC = () => (
  <Stack alignItems="center" justifyContent="center" height="100%" spacing={1}>
    <Typography variant="h6" color="text.primary">
      {strings.EMPTY_STATE_TITLE}
    </Typography>
    <Typography variant="body2" color="text.secondary" align="center" px={4}>
      {strings.EMPTY_STATE}
    </Typography>
  </Stack>
)

const LoadingOverlay: React.FC = () => (
  <Stack alignItems="center" justifyContent="center" height="100%" spacing={2}>
    <CircularProgress size={28} thickness={5} />
    <Typography variant="body2" color="text.secondary">
      {strings.LOADING_STATE}
    </Typography>
  </Stack>
)

const UserList = ({
  user,
  keyword,
  filters,
  admin,
  refreshToken,
  selectionResetKey,
  sortModel,
  onSortModelChange,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  density,
  onDensityChange,
  onSelectionChange,
  onReviewsClick,
  onTotalChange,
  onLoadingChange,
  onPageSummaryChange,
}: UserListProps) => {
  const [rows, setRows] = useState<bookcarsTypes.User[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: env.PAGE_SIZE })
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([])
  const [selectedUsersMap, setSelectedUsersMap] = useState<Record<string, bookcarsTypes.User>>({})
  const [deleteTarget, setDeleteTarget] = useState<bookcarsTypes.User>()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<bookcarsTypes.User>()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const copyTimeoutRef = useRef<number>()
  const [internalSortModel, setInternalSortModel] = useState<GridSortModel>(() => ensureSortModelWithFallback(sortModel))
  const [internalVisibilityModel, setInternalVisibilityModel] = useState<GridColumnVisibilityModel>(columnVisibilityModel)
  const [internalDensity, setInternalDensity] = useState<GridDensity>(density)
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { page, pageSize } = paginationModel

  // === Résumé de page: dépend uniquement de page/pageSize/prop callback ===
  const updateSummary = useCallback(
    (totalRecords: number, rowsLength: number) => {
      if (!onPageSummaryChange) return
      if (totalRecords === 0 || rowsLength === 0) {
        onPageSummaryChange({ from: 0, to: 0, total: totalRecords, pageSize })
        return
      }
      const from = page * pageSize + 1
      const to = Math.min(totalRecords, from + rowsLength - 1)
      onPageSummaryChange({ from, to, total: totalRecords, pageSize })
    },
    [onPageSummaryChange, page, pageSize]
  )

  const applySortAndIndex = useCallback(
    (sourceRows: bookcarsTypes.User[], model: GridSortModel) => {
      const sorted = sortRows(sourceRows, model)
      return applyListIndex(sorted, paginationModel.page, paginationModel.pageSize)
    },
    [paginationModel.page, paginationModel.pageSize],
  )

  useEffect(() => {
    const normalized = ensureSortModelWithFallback(sortModel)
    setInternalSortModel(normalized)
    setRows((current) => applySortAndIndex(current, normalized))
  }, [sortModel, applySortAndIndex])
  useEffect(() => setInternalVisibilityModel(columnVisibilityModel), [columnVisibilityModel])
  useEffect(() => setInternalDensity(density), [density])

  useEffect(
    () => () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current)
    },
    []
  )

  const types = useMemo(() => {
    if (filters.roles.length > 0) return filters.roles
    return admin ? defaultAdminRoles : defaultAgencyRoles
  }, [admin, filters.roles])

  const filtersPayload = useMemo(() => {
    const payload: bookcarsTypes.UsersFiltersPayload = {}
    if (filters.verification.length > 0) payload.verification = filters.verification.map((s) => s === 'verified')
    if (filters.activity.length > 0) payload.active = filters.activity.map((s) => s === 'active')
    if (filters.blacklisted !== 'all') payload.blacklisted = filters.blacklisted === 'blacklisted'
    if (filters.agencyId) payload.agencyId = filters.agencyId
    if (filters.lastLoginFrom) payload.lastLoginFrom = filters.lastLoginFrom
    if (filters.lastLoginTo) payload.lastLoginTo = filters.lastLoginTo
    return payload
  }, [filters])

  const fetchUsers = useCallback(async () => {
    if (!user) return

    const body: bookcarsTypes.GetUsersBody = {
      user: user._id || '',
      types,
      filters: Object.keys(filtersPayload).length > 0 ? filtersPayload : undefined,
    }

    try {
      setLoading(true)
      setError(undefined)
      onLoadingChange?.(true)

      const response = await UserService.getUsers(body, keyword, paginationModel.page + 1, paginationModel.pageSize)
      const { rows: dataRows, totalRecords } = normalizeUsersResult(response)
      const sortedRows = applySortAndIndex(dataRows, internalSortModel)

      setRows(sortedRows)
      setRowCount(totalRecords)
      onTotalChange?.(totalRecords)
      updateSummary(totalRecords, sortedRows.length)

      if (selectionModel.length > 0) {
        setSelectedUsersMap((prev) => {
          const updated = { ...prev }
          sortedRows.forEach((r) => {
            if (r._id && selectionModel.includes(r._id)) updated[r._id] = r
          })
          return updated
        })
      }
    } catch (err) {
      setError(strings.ERROR_LOADING_USERS)
      helper.error(err)
      updateSummary(0, 0)
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
    }
  }, [
    user,
    types,
    filtersPayload,
    keyword,
    paginationModel.page,
    paginationModel.pageSize,
    internalSortModel,
    applySortAndIndex,
    selectionModel,
    onTotalChange,
    onLoadingChange,
    updateSummary,
  ])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, refreshToken])

  useEffect(() => {
    updateSummary(rowCount, rows.length)
  }, [rowCount, rows.length, paginationModel.page, paginationModel.pageSize, updateSummary])

  useEffect(() => {
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [keyword, filtersPayload])

  useEffect(() => {
    setSelectionModel([])
    setSelectedUsersMap({})
    onSelectionChange({ ids: [], rows: [] })
  }, [selectionResetKey, onSelectionChange])

  useEffect(() => {
    if (!admin) {
      setSelectionModel([])
      setSelectedUsersMap({})
      onSelectionChange({ ids: [], rows: [] })
    }
  }, [admin, onSelectionChange])

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    const ids = newSelection.map((id) => id.toString())
    setSelectionModel(ids)

    setSelectedUsersMap((previous) => {
      const updated: Record<string, bookcarsTypes.User> = {}
      ids.forEach((id) => {
        if (previous[id]) updated[id] = previous[id]
      })
      rows.forEach((row) => {
        if (row._id && ids.includes(row._id)) updated[row._id] = row
      })
      return updated
    })
  }

  useEffect(() => {
    const selectedRows = Object.values(selectedUsersMap)
    const ids = selectedRows.map((s) => s._id as string)
    onSelectionChange({ ids, rows: selectedRows })
  }, [selectedUsersMap, onSelectionChange])

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return
    try {
      setLoading(true)
      onLoadingChange?.(true)
      const status = await UserService.deleteUsers([deleteTarget._id])
      if (status === 200) {
        helper.info(strings.USER_DELETED_SUCCESS)
        const nextTotal = Math.max(rowCount - 1, 0)
        setRows((current) => {
          const updatedRows = current.filter((r) => r._id !== deleteTarget._id)
          const reindexed = applySortAndIndex(updatedRows, internalSortModel)
          updateSummary(nextTotal, reindexed.length)
          return reindexed
        })
        setRowCount(nextTotal)
        setSelectionModel((current) => current.filter((id) => id !== deleteTarget._id))
        setSelectedUsersMap((current) => {
          const updated = { ...current }
          delete updated[deleteTarget._id as string]
          return updated
        })
      } else {
        helper.error(undefined, strings.USER_DELETE_ERROR)
      }
    } catch (err) {
      helper.error(err, strings.USER_DELETE_ERROR)
    } finally {
      setDeleteTarget(undefined)
      setLoading(false)
      onLoadingChange?.(false)
    }
  }

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuRow(undefined)
  }

  // === Stabilisation des renderers ===
  // 1) ref pour suivre copiedField sans dépendance
  const copiedFieldRef = useRef<string | null>(null)
  useEffect(() => {
    copiedFieldRef.current = copiedField
  }, [copiedField])

  // 2) copyToClipboard stable
  const copyToClipboard = useCallback(async (value: string, fieldId: string) => {
    try {
      if (!navigator?.clipboard?.writeText) {
        helper.error(undefined, strings.COPY_ERROR)
        return
      }
      await navigator.clipboard.writeText(value)
      helper.info(strings.COPIED_TO_CLIPBOARD)
      setCopiedField(fieldId)
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = window.setTimeout(() => setCopiedField(null), 1500)
    } catch (err) {
      helper.error(err, strings.COPY_ERROR)
    }
  }, [])

  const renderIndexCell = useCallback((params: GridRenderCellParams<bookcarsTypes.User, number>) => {
    const position = params.value ?? params.row.listIndex ?? 0
    if (!position) {
      return <Typography variant="body2">—</Typography>
    }

    const label = strings.formatString(strings.INDEX_BADGE_LABEL, position.toLocaleString()) as string

    return (
      <Tooltip title={label} placement="top" arrow>
        <Box component="span" className="us-index-badge" aria-label={label}>
          {position.toLocaleString()}
        </Box>
      </Tooltip>
    )
  }, [])

  const renderAvatarCell = useCallback((params: GridRenderCellParams<bookcarsTypes.User, string>) => {
    const { row } = params
    const avatarUrl = row.avatar
      ? (row.avatar.startsWith('http') ? row.avatar : bookcarsHelper.joinURL(env.CDN_USERS, row.avatar))
      : ''

    const avatar = row.avatar
      ? <Avatar src={avatarUrl} className="us-avatar-small" alt={row.fullName} />
      : <Avatar className="us-avatar-small">{row.fullName?.[0]?.toUpperCase()}</Avatar>

    const statusItems = [
      {
        key: 'verified',
        label: row.verified ? strings.VERIFIED_SHORT : strings.UNVERIFIED_SHORT,
        tooltip: row.verified ? strings.ACCOUNT_VERIFIED : strings.ACCOUNT_UNVERIFIED,
        className: row.verified ? 'us-status-pill--positive' : 'us-status-pill--neutral',
      },
      {
        key: 'active',
        label: row.active ? strings.ACTIVE_LABEL : strings.INACTIVE_LABEL,
        tooltip: row.active ? strings.ACCOUNT_ACTIVE : strings.ACCOUNT_INACTIVE,
        className: row.active ? 'us-status-pill--positive' : 'us-status-pill--danger',
      },
    ]

    if (row.blacklisted) {
      statusItems.push({
        key: 'blacklisted',
        label: strings.BLACKLISTED_LABEL,
        tooltip: strings.BLACKLISTED_STATUS,
        className: 'us-status-pill--warning',
      })
    }

    return (
      <Stack direction="row" spacing={2} alignItems="center" className="us-user-cell">
        {avatar}
        <Box>
          <Link href={`/user?u=${row._id}`} className="us-user-link">
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {params.value}
            </Typography>
          </Link>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center" className="us-user-statuses">
            {statusItems.map((status) => (
              <Tooltip key={status.key} title={status.tooltip} placement="top" arrow>
                <span className={`us-status-pill ${status.className}`}>
                  {status.label}
                </span>
              </Tooltip>
            ))}
          </Stack>
        </Box>
      </Stack>
    )
  }, [])

  const renderCopyCell = useCallback((params: GridRenderCellParams<bookcarsTypes.User, string>) => {
    const value = params.value || ''
    if (!value) return <Typography variant="body2" color="text.secondary">—</Typography>

    const fieldId = `email-${params.row._id}`
    const copied = copiedFieldRef.current === fieldId

    const handleCopy = (event: React.MouseEvent | React.KeyboardEvent) => {
      event.stopPropagation()
      copyToClipboard(value, fieldId)
    }

    return (
      <Stack direction="row" spacing={1} alignItems="center" className="us-copy-cell">
        <Tooltip title={copied ? strings.COPIED_TO_CLIPBOARD : strings.COPY_TO_CLIPBOARD}>
          <ButtonBase
            component="span"
            className="us-copy-trigger"
            onClick={handleCopy}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleCopy(event)
              }
            }}
            focusRipple
            aria-label={strings.COPY_ACTION_LABEL}
          >
            <Typography variant="body2" color="text.primary">
              {value}
            </Typography>
          </ButtonBase>
        </Tooltip>
        <Tooltip title={copied ? strings.COPIED_TO_CLIPBOARD : strings.COPY_TO_CLIPBOARD}>
          <span>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation()
                copyToClipboard(value, fieldId)
              }}
              aria-label={strings.COPY_ACTION_LABEL}
            >
              <ContentCopy fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    )
  }, [copyToClipboard])

  const renderRolePill = useCallback((params: GridRenderCellParams<bookcarsTypes.User, string>) => {
    let label = strings.CLIENT_LABEL
    let className = 'us-pill us-pill--role-client'
    if (params.value === bookcarsTypes.UserType.Admin) {
      label = commonStrings.ADMIN
      className = 'us-pill us-pill--role-admin'
    } else if (params.value === bookcarsTypes.UserType.Supplier) {
      label = commonStrings.SUPPLIER
      className = 'us-pill us-pill--role-supplier'
    }
    return (
      <Box className={className} component="span">
        <span className="us-pill__dot" />
        {label}
      </Box>
    )
  }, [])


  const computedVisibilityModel = useMemo<GridColumnVisibilityModel>(() => {
    const model: GridColumnVisibilityModel = { ...internalVisibilityModel }
    if (isTablet) {
      model.createdAt = false
    }
    if (isMobile) {
      model.lastLoginAt = false
    }
    return model
  }, [internalVisibilityModel, isMobile, isTablet])

  const columns = useMemo<GridColDef<bookcarsTypes.User>[]>(() => {
    const baseColumns: GridColDef<bookcarsTypes.User>[] = [
      {
        field: 'listIndex',
        headerName: strings.INDEX_COLUMN,
        width: 84,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: renderIndexCell,
      },
      {
        field: 'fullName',
        headerName: strings.USER_COLUMN,
        flex: 1.3,
        minWidth: 280,
        renderCell: renderAvatarCell,
        sortable: true,
      },
      {
        field: 'email',
        headerName: commonStrings.EMAIL,
        flex: 1,
        minWidth: 220,
        renderCell: (params) => renderCopyCell(params),
        sortable: false,
      },
      {
        field: 'type',
        headerName: commonStrings.TYPE,
        flex: 0.5,
        minWidth: 140,
        renderCell: renderRolePill,
        sortable: false,
      },
      {
        field: 'lastLoginAt',
        headerName: strings.LAST_LOGIN_COLUMN,
        flex: 0.8,
        minWidth: 180,
        valueGetter: ({ row }) => getLastLoginValue(row),
        valueFormatter: ({ value }) => formatDateTime(value as Date | string | null),
        sortComparator: (a, b) =>
          getDateTimestamp(a as Date | string | null) - getDateTimestamp(b as Date | string | null),
        sortable: true,
      },
      {
        field: 'createdAt',
        headerName: strings.CREATED_AT_COLUMN,
        flex: 0.8,
        minWidth: 180,
        valueGetter: ({ row }) => getCreatedAtValue(row),
        valueFormatter: ({ value }) => formatDateTime(value as Date | string | null),
        sortComparator: (a, b) =>
          getDateTimestamp(a as Date | string | null) - getDateTimestamp(b as Date | string | null),
        sortable: true,
      },
      {
        field: 'reviewCount',
        headerName: strings.REVIEWS_COLUMN,
        flex: 0.5,
        minWidth: 140,
        renderCell: ({ row }) => {
          const count = row.reviewCount ?? row.reviews?.length ?? 0
          if (count === 0) return <Typography variant="body2">0</Typography>
          return (
            <Button
              size="small"
              startIcon={<Reviews fontSize="small" />}
              onClick={(event) => {
                event.stopPropagation()
                onReviewsClick(row)
              }}
            >
              {count}
            </Button>
          )
        },
        sortable: false,
      },
      {
        field: 'actions',
        headerName: strings.ACTIONS_COLUMN,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        minWidth: 80,
        align: 'right',
        renderCell: ({ row }) => (
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation()
              setMenuAnchor(event.currentTarget)
              setMenuRow(row)
            }}
            aria-label={strings.ACTIONS_COLUMN}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        ),
      },
    ]

    return baseColumns
  }, [onReviewsClick, renderAvatarCell, renderCopyCell, renderRolePill, renderIndexCell])

  const handleSortModelChange = (model: GridSortModel) => {
    const nextModel = ensureSortModelWithFallback(model)
    setInternalSortModel(nextModel)
    onSortModelChange(nextModel)
    setRows((current) => applySortAndIndex(current, nextModel))
  }

  const handleVisibilityChange = (model: GridColumnVisibilityModel) => {
    setInternalVisibilityModel(model)
    onColumnVisibilityModelChange(model)
  }

  const handlePaginationChange = (model: { page: number; pageSize: number }) => {
    setPaginationModel(model)
    const nextDensity: GridDensity = model.pageSize > 50 ? 'compact' : 'comfortable'
    if (nextDensity !== internalDensity) {
      setInternalDensity(nextDensity)
      onDensityChange?.(nextDensity)
    }
  }

  const displayedCount = rows.length
  const totalPages = Math.max(1, Math.ceil(rowCount / paginationModel.pageSize))
  const summaryLabel = useMemo(
    () =>
      usersPageStrings.formatString(
        usersPageStrings.RESULTS_PAGE_SUMMARY,
        displayedCount.toLocaleString(),
        rowCount.toLocaleString(),
      ) as string,
    [displayedCount, rowCount],
  )

  const isFirstPage = paginationModel.page === 0
  const isLastPage = paginationModel.page >= totalPages - 1

  const handlePrevPageClick = () => {
    if (isFirstPage) return
    setPaginationModel((prev) => ({ ...prev, page: Math.max(prev.page - 1, 0) }))
  }

  const handleNextPageClick = () => {
    if (isLastPage) return
    setPaginationModel((prev) => ({ ...prev, page: prev.page + 1 }))
  }

  return (
    <Box className="us-list">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        getRowId={(row) => row._id as string}
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        checkboxSelection={admin}
        disableRowSelectionOnClick
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[env.PAGE_SIZE, 25, 50, 100]}
        loading={loading}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionChange}
        keepNonExistentRowsSelected
        sortModel={internalSortModel}
        onSortModelChange={handleSortModelChange}
        columnVisibilityModel={computedVisibilityModel}
        onColumnVisibilityModelChange={handleVisibilityChange}
        density={internalDensity}
        className="us-data-grid"
        disableColumnFilter
        hideFooter
        hideFooterSelectedRowCount
        sx={{
          flex: 1,
          minHeight: 0,
          '& .MuiDataGrid-main': {
            flex: 1,
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: '#fff',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F5F7FB',
            borderBottom: '1px solid #E0E6ED',
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#F5F7FB',
          },
          '& .MuiDataGrid-withBorderColor': {
            borderColor: 'rgba(226, 232, 240, 0.9)',
          },
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
        }}
        slots={{ noRowsOverlay: NoRowsOverlay, loadingOverlay: LoadingOverlay }}
      />

      <Box className="us-pagination">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {summaryLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {strings.formatString(
                strings.PAGINATION_LABEL,
                (paginationModel.page + 1).toLocaleString(),
                totalPages.toLocaleString(),
              ) as string}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" ml={{ xs: 0, sm: 'auto' }}>
            <Button variant="outlined" size="small" onClick={handlePrevPageClick} disabled={isFirstPage || loading}>
              {usersPageStrings.PAGINATION_PREVIOUS}
            </Button>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={handleNextPageClick}
              disabled={isLastPage || loading}
            >
              {usersPageStrings.PAGINATION_NEXT}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MenuItem component={Link} href={`/user?u=${menuRow?._id}`} onClick={closeMenu}>
          <Launch fontSize="small" sx={{ mr: 1 }} />
          {strings.VIEW_PROFILE}
        </MenuItem>
        {admin && (
          <MenuItem component={Link} href={`/update-user?u=${menuRow?._id}`} onClick={closeMenu}>
            <EditOutlined fontSize="small" sx={{ mr: 1 }} />
            {strings.EDIT_USER}
          </MenuItem>
        )}
        {admin && (
          <MenuItem component={Link} href={`/reset-password?u=${menuRow?._id}`} onClick={closeMenu}>
            <LockReset fontSize="small" sx={{ mr: 1 }} />
            {strings.RESET_PASSWORD}
          </MenuItem>
        )}
        {admin && (
          <MenuItem
            onClick={() => {
              closeMenu()
              setDeleteTarget(menuRow)
            }}
          >
            <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
            {strings.DELETE_USER_SHORT}
          </MenuItem>
        )}
      </Menu>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(undefined)} maxWidth="xs" fullWidth>
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent className="dialog-content">{strings.DELETE_USER}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setDeleteTarget(undefined)} variant="contained" className="btn-secondary">
            {commonStrings.CANCEL}
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            {commonStrings.DELETE}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserList
