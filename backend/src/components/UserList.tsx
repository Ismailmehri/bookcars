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
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/user-list'
import { strings as usersPageStrings } from '@/lang/users'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import { UsersFiltersState } from '@/pages/users.types'
import { mapSortModelToApiSort } from '@/common/users-sort.utils'

import '@/assets/css/user-list.css'
import {
  formatDateTime,
  getCreatedAtValue,
  getDateTimestamp,
  getLastLoginValue,
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
  const theme = useTheme()
  const navigate = useNavigate()
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

  const sortPayload = useMemo(() => mapSortModelToApiSort(sortModel), [sortModel])

  const fetchUsers = useCallback(async () => {
    if (!user) return

    const body: bookcarsTypes.GetUsersBody = {
      user: user._id || '',
      types,
      filters: Object.keys(filtersPayload).length > 0 ? filtersPayload : undefined,
    }

    if (sortPayload.length > 0) {
      body.sort = sortPayload
    }

    try {
      setLoading(true)
      setError(undefined)
      onLoadingChange?.(true)

      const response = await UserService.getUsers(body, keyword, paginationModel.page + 1, paginationModel.pageSize)
      const { rows: dataRows, totalRecords } = normalizeUsersResult(response)

      setRows(dataRows)
      setRowCount(totalRecords)
      onTotalChange?.(totalRecords)
      updateSummary(totalRecords, dataRows.length)

      if (selectionModel.length > 0) {
        setSelectedUsersMap((prev) => {
          const updated = { ...prev }
          dataRows.forEach((r) => {
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
    selectionModel,
    onTotalChange,
    onLoadingChange,
    updateSummary,
    sortPayload,
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
    setPaginationModel((prev) => (prev.page === 0 ? prev : { ...prev, page: 0 }))
  }, [sortPayload])

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
          updateSummary(nextTotal, updatedRows.length)
          return updatedRows
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

  const closeMenu = useCallback(() => {
    setMenuAnchor(null)
    setMenuRow(undefined)
  }, [])

  const navigateFromMenu = useCallback(
    (buildPath: (id: string) => string) => {
      if (!menuRow?._id) {
        helper.error(undefined, strings.MENU_ACTION_USER_MISSING)
        return
      }

      const target = buildPath(menuRow._id)
      closeMenu()
      navigate(target)
    },
    [closeMenu, menuRow, navigate]
  )

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
        className: row.verified ? 'us-flag-chip us-flag-chip--positive' : 'us-flag-chip us-flag-chip--neutral',
      },
      {
        key: 'active',
        label: row.active ? strings.ACTIVE_LABEL : strings.INACTIVE_LABEL,
        tooltip: row.active ? strings.ACCOUNT_ACTIVE : strings.ACCOUNT_INACTIVE,
        className: row.active ? 'us-flag-chip us-flag-chip--positive' : 'us-flag-chip us-flag-chip--danger',
      },
    ]

    if (row.blacklisted) {
      statusItems.push({
        key: 'blacklisted',
        label: strings.BLACKLISTED_LABEL,
        tooltip: strings.BLACKLISTED_STATUS,
        className: 'us-flag-chip us-flag-chip--warning',
      })
    }

    return (
      <Stack direction="row" spacing={2} alignItems="center" className="us-user-cell">
        {avatar}
        <Box>
          <Link href={`/user?u=${row._id}`} className="us-user-link">
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {params.value || '—'}
            </Typography>
          </Link>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center" className="us-user-statuses">
            {statusItems.map((status) => (
              <Tooltip key={status.key} title={status.tooltip} placement="top" arrow>
                <span className={status.className}>{status.label}</span>
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

    const fieldId = `${params.field}-${params.row._id}`
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
    let className = 'us-role-chip us-role-chip--client'
    if (params.value === bookcarsTypes.UserType.Admin) {
      label = commonStrings.ADMIN
      className = 'us-role-chip us-role-chip--admin'
    } else if (params.value === bookcarsTypes.UserType.Supplier) {
      label = commonStrings.SUPPLIER
      className = 'us-role-chip us-role-chip--supplier'
    }
    return (
      <Box className={className} component="span">
        <span className="us-role-chip__dot" />
        {label}
      </Box>
    )
  }, [])

  const computedVisibilityModel = useMemo<GridColumnVisibilityModel>(() => {
    const model: GridColumnVisibilityModel = { ...columnVisibilityModel }
    if (!admin) {
      model.type = false
      model.lastLoginAt = false
      model.createdAt = false
    }
    if (isTablet) {
      model.createdAt = false
    }
    if (isMobile) {
      model.lastLoginAt = false
    }
    return model
  }, [admin, columnVisibilityModel, isMobile, isTablet])

  const columns = useMemo<GridColDef<bookcarsTypes.User>[]>(() => {
    const baseColumns: GridColDef<bookcarsTypes.User>[] = [
      {
        field: 'fullName',
        headerName: strings.USER_COLUMN,
        flex: 1.4,
        minWidth: 260,
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
        field: 'phone',
        headerName: strings.PHONE_COLUMN,
        flex: 0.9,
        minWidth: 180,
        renderCell: (params) => renderCopyCell(params),
        sortable: false,
      },
      {
        field: 'type',
        headerName: commonStrings.TYPE,
        flex: 0.6,
        minWidth: 150,
        renderCell: renderRolePill,
        sortable: false,
      },
      {
        field: 'lastLoginAt',
        headerName: strings.LAST_LOGIN_COLUMN,
        flex: 0.8,
        minWidth: 170,
        valueGetter: (params: any) => {
          if (!params) {
            return null
          }
          // Si params est directement une date, la retourner
          if (params instanceof Date || typeof params === 'string' || typeof params === 'number') {
            return params
          }
          // Sinon, chercher dans params.row
          if (params.row) {
            return getLastLoginValue(params.row)
          }
          // Sinon, chercher directement dans params (au cas où c'est la valeur directement)
          return getLastLoginValue(params as bookcarsTypes.User)
        },
        valueFormatter: (params: { value?: Date | string | null }) => {
          if (!params) {
            return '—'
          }
          return formatDateTime(params as Date | string | null)
        },
        sortComparator: (a, b) =>
          getDateTimestamp(a as Date | string | null) - getDateTimestamp(b as Date | string | null),
        sortable: true,
      },
      {
        field: 'createdAt',
        headerName: strings.CREATED_AT_COLUMN,
        flex: 0.8,
        minWidth: 170,
        valueGetter: (params: any) => {
          if (!params) {
            return null
          }
          // Si params est directement une date, la retourner
          if (params instanceof Date || typeof params === 'string' || typeof params === 'number') {
            return params
          }
          // Sinon, chercher dans params.row
          if (params.row) {
            return getCreatedAtValue(params.row)
          }
          // Sinon, chercher directement dans params (au cas où c'est la valeur directement)
          return getCreatedAtValue(params as bookcarsTypes.User)
        },
        valueFormatter: (params: { value?: Date | string | null }) => {
          if (!params) {
            return '—'
          }
          return formatDateTime(params as Date | string | null)
        },
        sortComparator: (a, b) =>
          getDateTimestamp(a as Date | string | null) - getDateTimestamp(b as Date | string | null),
        sortable: true,
      },
      {
        field: 'reviewCount',
        headerName: strings.REVIEWS_COLUMN,
        flex: 0.5,
        minWidth: 110,
        renderCell: ({ row }) => {
          const count = row.reviewCount ?? (Array.isArray(row.reviews) ? row.reviews.length : 0)
          if (count > 0) {
            return (
              <Button
                size="small"
                onClick={(event) => {
                  event.stopPropagation()
                  onReviewsClick(row)
                }}
              >
                {count}
              </Button>
            )
          }
          return (
            <Typography variant="body2" color="text.secondary">
              0
            </Typography>
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

    if (!admin) {
      return baseColumns.filter((column) => !['type', 'lastLoginAt', 'createdAt', 'phone'].includes(column.field))
    }

    return baseColumns
  }, [admin, onReviewsClick, renderAvatarCell, renderCopyCell, renderRolePill])

  const handleSortModelChange = (model: GridSortModel) => {
    onSortModelChange(model)
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleVisibilityChange = (model: GridColumnVisibilityModel) => {
    onColumnVisibilityModelChange(model)
  }

  const handlePaginationChange = (model: { page: number; pageSize: number }) => {
    setPaginationModel(model)
    const nextDensity: GridDensity = model.pageSize > 50 ? 'compact' : 'comfortable'
    if (nextDensity !== density) {
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
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        columnVisibilityModel={computedVisibilityModel}
        onColumnVisibilityModelChange={handleVisibilityChange}
        density={density}
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
        <MenuItem
          onClick={() => navigateFromMenu((id) => `/user?u=${id}`)}
          component="button"
          type="button"
        >
          <Launch fontSize="small" sx={{ mr: 1 }} />
          {strings.VIEW_PROFILE}
        </MenuItem>
        {admin && (
          <MenuItem
            onClick={() => navigateFromMenu((id) => `/update-user?u=${id}`)}
            component="button"
            type="button"
          >
            <EditOutlined fontSize="small" sx={{ mr: 1 }} />
            {strings.EDIT_USER}
          </MenuItem>
        )}
        {admin && (
          <MenuItem
            onClick={() => navigateFromMenu((id) => `/reset-password?u=${id}`)}
            component="button"
            type="button"
          >
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
