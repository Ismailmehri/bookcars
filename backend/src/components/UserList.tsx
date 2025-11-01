import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from '@mui/x-data-grid'
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
  Button,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Launch as ViewIcon,
  LockReset as ResetPasswordIcon,
  Reviews as ReviewsIcon,
  Verified as VerifiedIcon,
  HourglassEmpty as PendingIcon,
  Block as BlockIcon,
  DoDisturb as InactiveIcon,
  PlayArrow as ActiveIcon,
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

const UserList = ({
  user,
  keyword,
  filters,
  admin,
  refreshToken,
  selectionResetKey,
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
      if (onLoadingChange) {
        onLoadingChange(true)
      }

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

      setRows(dataRows)
      setRowCount(totalRecords)
      onTotalChange?.(totalRecords)

      // refresh selected map with latest row data
      if (selectionModel.length > 0) {
        setSelectedUsersMap((previous) => {
          const updated = { ...previous }
          dataRows.forEach((row) => {
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
      if (onLoadingChange) {
        onLoadingChange(false)
      }
    }
  }, [
    user,
    types,
    filtersPayload,
    keyword,
    paginationModel.page,
    paginationModel.pageSize,
    onTotalChange,
    selectionModel,
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
  }, [selectionResetKey])

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
      <Stack direction="row" spacing={1.5} alignItems="center">
        {avatar}
        <Box>
          <Link href={`/user?u=${row._id}`} className="us-user-link">
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {params.value}
            </Typography>
          </Link>
          <Stack direction="row" spacing={1} alignItems="center">
            {row.verified ? (
              <Tooltip title={commonStrings.VERIFIED}>
                <VerifiedIcon className="us-status-icon us-status-icon--verified" />
              </Tooltip>
            ) : (
              <Tooltip title={commonStrings.UNVERIFIED}>
                <PendingIcon className="us-status-icon us-status-icon--pending" />
              </Tooltip>
            )}
            {row.active ? (
              <Tooltip title={strings.ACCOUNT_ACTIVE}>
                <ActiveIcon className="us-status-icon us-status-icon--active" />
              </Tooltip>
            ) : (
              <Tooltip title={strings.ACCOUNT_INACTIVE}>
                <InactiveIcon className="us-status-icon us-status-icon--inactive" />
              </Tooltip>
            )}
            {row.blacklisted && (
              <Tooltip title={strings.BLACKLISTED_STATUS}>
                <BlockIcon className="us-status-icon us-status-icon--blacklisted" />
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Stack>
    )
  }

  const renderRoleChip = (params: GridRenderCellParams<bookcarsTypes.User, string>) => {
    switch (params.value) {
      case bookcarsTypes.UserType.Admin:
        return <Chip label={commonStrings.ADMIN} size="small" className="us-role-chip us-role-chip--admin" />
      case bookcarsTypes.UserType.Supplier:
        return <Chip label={commonStrings.SUPPLIER} size="small" className="us-role-chip us-role-chip--supplier" />
      case bookcarsTypes.UserType.User:
      default:
        return <Chip label={strings.CLIENT_LABEL} size="small" className="us-role-chip us-role-chip--client" />
    }
  }

  const renderBooleanBadge = (
    condition: boolean | undefined,
    truthyLabel: string,
    falsyLabel: string,
    truthyClass: string,
    falsyClass: string,
  ) => (
    <Chip
      label={condition ? truthyLabel : falsyLabel}
      size="small"
      className={condition ? truthyClass : falsyClass}
    />
  )

  const columns = useMemo<GridColDef<bookcarsTypes.User>[]>(() => {
    const baseColumns: GridColDef<bookcarsTypes.User>[] = [
      {
        field: 'fullName',
        headerName: commonStrings.USER,
        flex: 1.2,
        minWidth: 220,
        renderCell: renderAvatarCell,
      },
      {
        field: 'email',
        headerName: commonStrings.EMAIL,
        flex: 1,
        minWidth: 180,
      },
      {
        field: 'phone',
        headerName: commonStrings.PHONE,
        flex: 0.8,
        minWidth: 150,
      },
      {
        field: 'type',
        headerName: commonStrings.TYPE,
        flex: 0.6,
        minWidth: 150,
        renderCell: renderRoleChip,
      },
      {
        field: 'verified',
        headerName: strings.VERIFIED_COLUMN,
        flex: 0.5,
        minWidth: 150,
        renderCell: ({ value }) => renderBooleanBadge(Boolean(value), strings.VERIFIED_SHORT, strings.UNVERIFIED_SHORT, 'us-flag-chip us-flag-chip--verified', 'us-flag-chip us-flag-chip--unverified'),
        sortable: false,
      },
      {
        field: 'active',
        headerName: strings.ACTIVE_COLUMN,
        flex: 0.5,
        minWidth: 150,
        renderCell: ({ value }) => renderBooleanBadge(Boolean(value), strings.ACTIVE_LABEL, strings.INACTIVE_LABEL, 'us-flag-chip us-flag-chip--active', 'us-flag-chip us-flag-chip--inactive'),
        sortable: false,
      },
      {
        field: 'lastLoginAt',
        headerName: strings.LAST_LOGIN_COLUMN,
        flex: 0.7,
        minWidth: 180,
        valueFormatter: ({ value }) => (value ? new Date(value).toLocaleString() : strings.NEVER_LOGGED_IN),
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
              startIcon={<ReviewsIcon fontSize="small" />}
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
        minWidth: 220,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={strings.VIEW_PROFILE}>
              <IconButton href={`/user?u=${row._id}`} size="small">
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {admin && (
              <Tooltip title={strings.EDIT_USER}>
                <IconButton href={`/update-user?u=${row._id}`} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {admin && (
              <Tooltip title={strings.RESET_PASSWORD}>
                <IconButton href={`/reset-password?u=${row._id}`} size="small">
                  <ResetPasswordIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {admin && (
              <Tooltip title={strings.DELETE_USER_SHORT}>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation()
                    setDeleteTarget(row)
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ]

    if (admin) {
      baseColumns.splice(6, 0, {
        field: 'blacklisted',
        headerName: strings.BLACKLIST_COLUMN,
        flex: 0.5,
        minWidth: 150,
        renderCell: ({ value }) => renderBooleanBadge(Boolean(value), strings.BLACKLISTED_LABEL, strings.NOT_BLACKLISTED_LABEL, 'us-flag-chip us-flag-chip--blacklisted', 'us-flag-chip us-flag-chip--neutral'),
        sortable: false,
      })
    }

    return baseColumns
  }, [admin, onReviewsClick])

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
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[env.PAGE_SIZE, 25, 50, 100]}
        loading={loading}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={handleSelectionChange}
        keepNonExistentRowsSelected
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f7fb',
            fontWeight: 600,
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: '#fff',
          },
        }}
        slots={{
          noRowsOverlay: () => (
            <Stack alignItems="center" justifyContent="center" height="100%">
              <Typography variant="body2" color="text.secondary">
                {strings.EMPTY_STATE}
              </Typography>
            </Stack>
          ),
          loadingOverlay: () => (
            <Stack alignItems="center" justifyContent="center" height="100%">
              <Typography variant="body2" color="text.secondary">
                {strings.LOADING_STATE}
              </Typography>
            </Stack>
          ),
        }}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(undefined)} maxWidth="xs" fullWidth>
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent className="dialog-content">
          {strings.DELETE_USER}
        </DialogContent>
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
