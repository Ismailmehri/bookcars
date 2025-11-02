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
import {
  CheckCircleOutline,
  HighlightOff,
  Block,
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
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import { UsersFiltersState } from '@/pages/users.types'

import '@/assets/css/user-list.css'

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

export const formatLastLoginValue = (value?: string | Date | null | undefined) => {
  if (!value) {
    return strings.NEVER_LOGGED_IN
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return strings.NEVER_LOGGED_IN
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const sortRows = (rows: bookcarsTypes.User[], model: GridSortModel) => {
  if (!model || model.length === 0) {
    return rows
  }

  const [{ field, sort }] = model
  if (!sort) {
    return rows
  }

  const sorted = [...rows]

  sorted.sort((a, b) => {
    const direction = sort === 'asc' ? 1 : -1

    if (field === 'lastLoginAt') {
      const aDate = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0
      const bDate = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0
      return (aDate - bDate) * direction
    }

    if (field === 'fullName') {
      const aName = (a.fullName || '').toLowerCase()
      const bName = (b.fullName || '').toLowerCase()
      if (aName < bName) {
        return -1 * direction
      }
      if (aName > bName) {
        return 1 * direction
      }
      return 0
    }

    return 0
  })

  return sorted
}

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
}: UserListProps) => {
  const [rows, setRows] = useState<bookcarsTypes.User[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: env.PAGE_SIZE,
  })
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([])
  const [selectedUsersMap, setSelectedUsersMap] = useState<Record<string, bookcarsTypes.User>>({})
  const [deleteTarget, setDeleteTarget] = useState<bookcarsTypes.User>()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<bookcarsTypes.User>()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const copyTimeoutRef = useRef<number>()
  const [internalSortModel, setInternalSortModel] = useState<GridSortModel>(sortModel)
  const [internalVisibilityModel, setInternalVisibilityModel] = useState<GridColumnVisibilityModel>(
    columnVisibilityModel,
  )
  const [internalDensity, setInternalDensity] = useState<GridDensity>(density)

  useEffect(() => {
    setInternalSortModel(sortModel)
  }, [sortModel])

  useEffect(() => {
    setInternalVisibilityModel(columnVisibilityModel)
  }, [columnVisibilityModel])

  useEffect(() => {
    setInternalDensity(density)
  }, [density])

  useEffect(() => () => {
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const types = useMemo(() => {
    if (filters.roles.length > 0) {
      return filters.roles
    }
    return admin ? defaultAdminRoles : defaultAgencyRoles
  }, [admin, filters.roles])

  const filtersPayload = useMemo(() => {
    const payload: bookcarsTypes.UsersFiltersPayload = {}

    if (filters.verification.length > 0) {
      payload.verification = filters.verification.map((status) => status === 'verified')
    }

    if (filters.activity.length > 0) {
      payload.active = filters.activity.map((status) => status === 'active')
    }

    if (filters.blacklisted !== 'all') {
      payload.blacklisted = filters.blacklisted === 'blacklisted'
    }

    if (filters.agencyId) {
      payload.agencyId = filters.agencyId
    }

    if (filters.lastLoginFrom) {
      payload.lastLoginFrom = filters.lastLoginFrom
    }

    if (filters.lastLoginTo) {
      payload.lastLoginTo = filters.lastLoginTo
    }

    return payload
  }, [filters])

  const fetchUsers = useCallback(async () => {
    if (!user) {
      return
    }

    const payload: bookcarsTypes.GetUsersBody = {
      user: user._id || '',
      types,
      filters: Object.keys(filtersPayload).length > 0 ? filtersPayload : undefined,
    }

    try {
      setLoading(true)
      setError(undefined)
      onLoadingChange?.(true)

      const response = await UserService.getUsers(
        payload,
        keyword,
        paginationModel.page + 1,
        paginationModel.pageSize,
      )

      const fallback = { pageInfo: { totalRecords: 0 }, resultData: [] as bookcarsTypes.User[] }
      const result = response && response.length > 0 ? response[0] : fallback

      const totalRecords = Array.isArray(result.pageInfo)
        ? (result.pageInfo[0]?.totalRecords ?? 0)
        : (result.pageInfo?.totalRecords ?? 0)

      const dataRows = result.resultData ?? []
      const sortedRows = sortRows(dataRows, internalSortModel)

      setRows(sortedRows)
      setRowCount(totalRecords)
      onTotalChange?.(totalRecords)

      if (selectionModel.length > 0) {
        setSelectedUsersMap((previous) => {
          const updated = { ...previous }
          sortedRows.forEach((row) => {
            if (row._id && selectionModel.includes(row._id)) {
              updated[row._id] = row
            }
          })
          return updated
        })
      }
    } catch (err) {
      setError(strings.ERROR_LOADING_USERS)
      helper.error(err)
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
    selectionModel,
    onTotalChange,
    onLoadingChange,
  ])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, refreshToken])

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
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
        if (previous[id]) {
          updated[id] = previous[id]
        }
      })

      rows.forEach((row) => {
        if (row._id && ids.includes(row._id)) {
          updated[row._id] = row
        }
      })

      return updated
    })
  }

  useEffect(() => {
    const selectedRows = Object.values(selectedUsersMap)
    const ids = selectedRows.map((selected) => selected._id as string)
    onSelectionChange({ ids, rows: selectedRows })
  }, [selectedUsersMap, onSelectionChange])

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) {
      return
    }

    try {
      setLoading(true)
      const status = await UserService.deleteUsers([deleteTarget._id])

      if (status === 200) {
        helper.info(strings.USER_DELETED_SUCCESS)
        setRows((current) => current.filter((row) => row._id !== deleteTarget._id))
        setRowCount((current) => Math.max(current - 1, 0))
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
    }
  }

  const closeMenu = () => {
    setMenuAnchor(null)
    setMenuRow(undefined)
  }

  const copyToClipboard = async (value: string, fieldId: string) => {
    try {
      if (!navigator?.clipboard?.writeText) {
        helper.error(undefined, strings.COPY_ERROR)
        return
      }
      await navigator.clipboard.writeText(value)
      setCopiedField(fieldId)
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
      copyTimeoutRef.current = window.setTimeout(() => setCopiedField(null), 1500)
    } catch (err) {
      helper.error(err, strings.COPY_ERROR)
    }
  }

  const renderAvatarCell = (params: GridRenderCellParams<bookcarsTypes.User, string>) => {
    const row = params.row
    const avatarUrl = row.avatar
      ? (row.avatar.startsWith('http') ? row.avatar : bookcarsHelper.joinURL(env.CDN_USERS, row.avatar))
      : ''

    const avatar = row.avatar ? (
      <Avatar src={avatarUrl} className="us-avatar-small" alt={row.fullName} />
    ) : (
      <Avatar className="us-avatar-small">{row.fullName?.[0]?.toUpperCase()}</Avatar>
    )

    return (
      <Stack direction="row" spacing={2} alignItems="center" className="us-user-cell">
        {avatar}
        <Box>
          <Link href={`/user?u=${row._id}`} className="us-user-link">
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {params.value}
            </Typography>
          </Link>
          <Stack direction="row" spacing={1} alignItems="center" className="us-user-statuses">
            <Tooltip title={row.verified ? strings.ACCOUNT_VERIFIED : strings.ACCOUNT_UNVERIFIED}>
              <span className={`us-status-dot ${row.verified ? 'us-status-dot--success' : 'us-status-dot--warning'}`}>
                {row.verified ? <CheckCircleOutline fontSize="small" /> : <HighlightOff fontSize="small" />}
              </span>
            </Tooltip>
            <Tooltip title={row.active ? strings.ACCOUNT_ACTIVE : strings.ACCOUNT_INACTIVE}>
              <span className={`us-status-dot ${row.active ? 'us-status-dot--success' : 'us-status-dot--danger'}`}>
                {row.active ? <CheckCircleOutline fontSize="small" /> : <HighlightOff fontSize="small" />}
              </span>
            </Tooltip>
            {row.blacklisted && (
              <Tooltip title={strings.BLACKLISTED_STATUS}>
                <span className="us-status-dot us-status-dot--danger">
                  <Block fontSize="small" />
                </span>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Stack>
    )
  }

  const renderCopyCell = (
    params: GridRenderCellParams<bookcarsTypes.User, string>,
    field: 'email' | 'phone',
  ) => {
    const value = params.value || ''
    if (!value) {
      return <Typography variant="body2" color="text.secondary">—</Typography>
    }

    const fieldId = `${field}-${params.row._id}`
    const copied = copiedField === fieldId

    return (
      <Stack direction="row" spacing={1} alignItems="center" className="us-copy-cell">
        <Typography variant="body2" color="text.primary">
          {value}
        </Typography>
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
  }

  const renderRolePill = (params: GridRenderCellParams<bookcarsTypes.User, string>) => {
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
  }

  const renderStatusPill = (
    condition: boolean | undefined,
    truthyLabel: string,
    falsyLabel: string,
    truthyClass: string,
    falsyClass: string,
  ) => (
    <Box className={`${condition ? truthyClass : falsyClass} us-pill`} component="span">
      <span className="us-pill__dot" />
      {condition ? truthyLabel : falsyLabel}
    </Box>
  )

  const columns = useMemo<GridColDef<bookcarsTypes.User>[]>(() => {
    const baseColumns: GridColDef<bookcarsTypes.User>[] = [
      {
        field: 'fullName',
        headerName: strings.USER_COLUMN,
        flex: 1.2,
        minWidth: 260,
        renderCell: renderAvatarCell,
        sortable: true,
      },
      {
        field: 'email',
        headerName: commonStrings.EMAIL,
        flex: 1,
        minWidth: 220,
        renderCell: (params) => renderCopyCell(params, 'email'),
        sortable: false,
      },
      {
        field: 'phone',
        headerName: commonStrings.PHONE,
        flex: 0.8,
        minWidth: 180,
        renderCell: (params) => renderCopyCell(params, 'phone'),
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
        field: 'verified',
        headerName: strings.VERIFIED_COLUMN,
        flex: 0.6,
        minWidth: 140,
        renderCell: ({ value }) =>
          renderStatusPill(Boolean(value), strings.VERIFIED_SHORT, strings.UNVERIFIED_SHORT, 'us-pill--success', 'us-pill--neutral'),
        sortable: false,
      },
      {
        field: 'active',
        headerName: strings.ACTIVE_COLUMN,
        flex: 0.6,
        minWidth: 140,
        renderCell: ({ value }) =>
          renderStatusPill(Boolean(value), strings.ACTIVE_LABEL, strings.INACTIVE_LABEL, 'us-pill--success', 'us-pill--danger'),
        sortable: false,
      },
      {
        field: 'lastLoginAt',
        headerName: strings.LAST_LOGIN_COLUMN,
        flex: 0.7,
        minWidth: 180,
        valueFormatter: ({ value }) => formatLastLoginValue(value as string | Date | null | undefined),
        sortable: true,
      },
      {
        field: 'reviewCount',
        headerName: strings.REVIEWS_COLUMN,
        flex: 0.5,
        minWidth: 140,
        renderCell: ({ row }) => {
          const count = row.reviewCount ?? row.reviews?.length ?? 0
          if (count === 0) {
            return <Typography variant="body2">0</Typography>
          }
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

    if (admin) {
      baseColumns.splice(6, 0, {
        field: 'blacklisted',
        headerName: strings.BLACKLIST_COLUMN,
        flex: 0.6,
        minWidth: 140,
        renderCell: ({ value }) =>
          renderStatusPill(Boolean(value), strings.BLACKLISTED_LABEL, strings.NOT_BLACKLISTED_LABEL, 'us-pill--danger', 'us-pill--neutral'),
        sortable: false,
      })
    }

    return baseColumns
  }, [admin, onReviewsClick])

  const handleSortModelChange = (model: GridSortModel) => {
    const nextModel = model.length > 0 ? [model[0]] : []
    setInternalSortModel(nextModel)
    onSortModelChange(nextModel)
    setRows((current) => sortRows(current, nextModel))
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
        columnVisibilityModel={internalVisibilityModel}
        onColumnVisibilityModelChange={handleVisibilityChange}
        density={internalDensity}
        className="us-data-grid"
        disableColumnFilter
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#EFF3FA',
            borderBottom: '1px solid #E8EEF4',
            fontWeight: 600,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#F5F7FB',
          },
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
        }}
        slots={{
          noRowsOverlay: () => (
            <Stack alignItems="center" justifyContent="center" height="100%" spacing={1}>
              <Typography variant="h6" color="text.primary">
                {strings.EMPTY_STATE_TITLE}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" px={4}>
                {strings.EMPTY_STATE}
              </Typography>
            </Stack>
          ),
          loadingOverlay: () => (
            <Stack alignItems="center" justifyContent="center" height="100%" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {strings.LOADING_STATE}
              </Typography>
            </Stack>
          ),
        }}
      />

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
