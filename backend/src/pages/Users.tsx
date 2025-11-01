import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
} from '@mui/x-data-grid'
import { Visibility as VisibilityIcon } from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import env from '@/config/env.config'
import { strings as usersStrings } from '@/lang/users'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import * as SupplierService from '@/services/SupplierService'
import useUsersState, { UsersViewMode } from '@/hooks/useUsersState'
import UsersToolbar from '@/components/users/UsersToolbar'
import UsersActionsCell from '@/components/users/UsersActionsCell'
import UserReviewsDrawer from '@/components/users/UserReviewsDrawer'
import UsersError from '@/components/users/UsersError'
import GroupByAgencyView from '@/components/users/GroupByAgencyView'
import { formatDateTime } from '@/common/format'

import '@/assets/css/users.css'

export const formatLastLoginValue = (value: unknown) => {
  if (!value) {
    return usersStrings.UNKNOWN
  }

  if (value instanceof Date || typeof value === 'string') {
    return formatDateTime(value)
  }

  return usersStrings.UNKNOWN
}

const Users = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<bookcarsTypes.User>()
  const [kpiScope, setKpiScope] = useState<'platform' | 'agency'>('platform')
  const [reviewUser, setReviewUser] = useState<bookcarsTypes.User>()
  const [agencies, setAgencies] = useState<bookcarsTypes.Option[]>([])
  const [usersError, setUsersError] = useState<string>()
  const [kpiError, setKpiError] = useState<string>()
  const { state, actions } = useUsersState()

  const isAdmin = useMemo(() => helper.admin(currentUser), [currentUser])

  const fetchAgencies = useCallback(async () => {
    if (!isAdmin) {
      return
    }
    try {
      const data = await SupplierService.getSuppliers('', 1, 100)
      const result = data && data.length > 0 ? data[0] : undefined
      if (result) {
        const options = result.resultData.map((supplier) => ({
          _id: supplier._id as string,
          name: supplier.fullName,
        }))
        setAgencies(options)
      }
    } catch (err) {
      helper.error(err)
    }
  }, [isAdmin])

  const loadUsers = useCallback(async () => {
    if (!currentUser || state.types.length === 0) {
      return
    }
    try {
      actions.setLoading(true)
      setUsersError(undefined)
      const payload: bookcarsTypes.GetUsersBody = {
        user: currentUser._id || '',
        types: state.types,
        status: state.status,
        verified: state.verified,
        agencyId: state.agencyId,
        withReviews: state.withReviews,
        dateLastLogin: state.lastLoginRange,
        sort: state.sort,
      }
      const response = await UserService.getUsers(payload, state.keyword, state.page + 1, state.pageSize)
      const data = response && response.length > 0 ? response[0] : undefined
      const rows = data?.resultData ?? []
      const totalRecords = data?.pageInfo?.totalRecords ?? rows.length
      actions.setUsersData(rows, totalRecords)
    } catch (err) {
      const message = err instanceof Error ? err.message : usersStrings.USERS_ERROR
      setUsersError(message)
      helper.error(err)
    } finally {
      actions.setLoading(false)
    }
  }, [currentUser, state.types, state.status, state.verified, state.agencyId, state.withReviews, state.lastLoginRange, state.sort, state.keyword, state.page, state.pageSize, actions])

  const loadKpi = useCallback(async () => {
    if (!currentUser) {
      return
    }
    try {
      actions.setKpiLoading(true)
      setKpiError(undefined)
      const request: bookcarsTypes.UsersKpiRequest = {
        scope: kpiScope,
        agencyId: state.agencyId,
      }
      const data = await UserService.getUsersKpi(request)
      actions.setKpi(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : usersStrings.KPI_ERROR
      setKpiError(message)
      helper.error(err)
    } finally {
      actions.setKpiLoading(false)
    }
  }, [currentUser, kpiScope, state.agencyId, actions])

  useEffect(() => {
    if (currentUser) {
      loadUsers()
    }
  }, [currentUser, loadUsers])

  useEffect(() => {
    if (currentUser) {
      loadKpi()
    }
  }, [currentUser, loadKpi])

  useEffect(() => {
    fetchAgencies()
  }, [fetchAgencies])

  const onLoad = (_user?: bookcarsTypes.User) => {
    if (!_user || (_user.type !== bookcarsTypes.RecordType.Admin && _user.type !== bookcarsTypes.RecordType.Supplier)) {
      navigate('/sign-in', { replace: true })
      return
    }
    setCurrentUser(_user)
    const defaultTypes = _user.type === bookcarsTypes.RecordType.Admin
      ? [bookcarsTypes.UserType.Admin, bookcarsTypes.UserType.Supplier, bookcarsTypes.UserType.User]
      : [bookcarsTypes.UserType.Supplier, bookcarsTypes.UserType.User]
    actions.setTypes(defaultTypes)
    if (_user.type === bookcarsTypes.RecordType.Supplier && _user._id) {
      actions.setAgencyId(_user._id)
      setKpiScope('agency')
    } else {
      setKpiScope('platform')
    }
  }

  const handleSortModelChange = (model: GridSortModel) => {
    if (model.length > 0) {
      const item = model[0]
      const sortFieldMap: Record<string, bookcarsTypes.UsersSortField> = {
        lastLoginAt: 'lastLoginAt',
        reviewsCount: 'reviewsCount',
        fullName: 'fullName',
        name: 'name',
      }
      const field = sortFieldMap[item.field]
      if (field) {
        actions.setSort({
          field,
          direction: item.sort || 'asc',
        })
      }
    } else {
      actions.setSort(undefined)
    }
  }

  const handleDeleteUser = useCallback(async (userToDelete: bookcarsTypes.User) => {
    if (!userToDelete._id) {
      return
    }
    try {
      await UserService.deleteUsers([userToDelete._id])
      loadUsers()
    } catch (err) {
      helper.error(err)
    }
  }, [loadUsers])

  const handleToggleActive = useCallback(async (userToUpdate: bookcarsTypes.User, active: boolean) => {
    if (!userToUpdate._id) {
      return
    }
    try {
      await UserService.bulkActivateUsers([userToUpdate._id], active)
      loadUsers()
    } catch (err) {
      helper.error(err)
    }
  }, [loadUsers])

  const handleChangeRole = useCallback(async (userToUpdate: bookcarsTypes.User, role: bookcarsTypes.UserType) => {
    if (!userToUpdate._id) {
      return
    }
    try {
      await UserService.bulkChangeRole([userToUpdate._id], role)
      loadUsers()
    } catch (err) {
      helper.error(err)
    }
  }, [loadUsers])

  const handleBulkActivate = useCallback(async (active: boolean) => {
    if (!state.selection.length) {
      return
    }
    try {
      await UserService.bulkActivateUsers(state.selection, active)
      actions.setSelection([])
      loadUsers()
    } catch (err) {
      helper.error(err)
    }
  }, [state.selection, loadUsers, actions])

  const handleBulkDelete = useCallback(async () => {
    if (!state.selection.length) {
      return
    }
    try {
      await UserService.deleteUsers(state.selection)
      actions.setSelection([])
      loadUsers()
    } catch (err) {
      helper.error(err)
    }
  }, [state.selection, loadUsers, actions])

  const handleBulkChangeRole = useCallback(async (role: bookcarsTypes.UserType) => {
    if (!state.selection.length) {
      return
    }
    try {
      await UserService.bulkChangeRole(state.selection, role)
      actions.setSelection([])
      loadUsers()
    } catch (err) {
      helper.error(err)
    }
  }, [state.selection, loadUsers, actions])

  const handleBulkAssignAgency = useCallback(async (agencyId: string) => {
    if (!state.selection.length || !agencyId) {
      return
    }
    try {
      await UserService.bulkAssignAgency(state.selection, agencyId)
      actions.setSelection([])
      loadUsers()
    } catch (err) {
      helper.error(err)
    }
  }, [state.selection, loadUsers, actions])

  const columns = useMemo((): GridColDef<bookcarsTypes.User>[] => {
    const avatarColumn: GridColDef<bookcarsTypes.User> = {
      field: 'fullName',
      headerName: usersStrings.NAME_COLUMN,
      flex: 1.4,
      minWidth: 200,
      renderCell: ({ row, value }: GridRenderCellParams<bookcarsTypes.User, string>) => {
        const avatarUrl = row.avatar
          ? (row.avatar.startsWith('http') ? row.avatar : `${env.CDN_USERS}/${row.avatar}`)
          : undefined
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {avatarUrl ? <Avatar src={avatarUrl} alt={value || ''} /> : <Avatar>{value?.charAt(0) || '?'}</Avatar>}
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" component="span">{value}</Typography>
              <Typography variant="caption" color="text.secondary">{row.email}</Typography>
            </Stack>
          </Stack>
        )
      },
    }

    const baseColumns: GridColDef<bookcarsTypes.User>[] = [
      avatarColumn,
      {
        field: 'email',
        headerName: usersStrings.EMAIL_COLUMN,
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'phone',
        headerName: usersStrings.PHONE_COLUMN,
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'type',
        headerName: usersStrings.ROLE_COLUMN,
        flex: 0.8,
        minWidth: 120,
        renderCell: ({ value }) => (
          <Chip label={helper.getUserType(value)} size="small" color="default" />
        ),
      },
    ]

    if (isAdmin) {
      baseColumns.push({
        field: 'agencyName',
        headerName: usersStrings.AGENCY_COLUMN,
        flex: 1,
        minWidth: 160,
      })
    }

    baseColumns.push(
      {
        field: 'lastLoginAt',
        headerName: usersStrings.LAST_LOGIN_COLUMN,
        flex: 0.9,
        minWidth: 160,
        valueFormatter: ({ value }) => formatLastLoginValue(value),
      },
      {
        field: 'reviewsCount',
        headerName: usersStrings.REVIEWS_COLUMN,
        flex: 0.6,
        minWidth: 140,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{row.reviewsCount || 0}</Typography>
            <Tooltip title={usersStrings.SHOW_REVIEWS}>
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    setReviewUser(row)
                    actions.setShowReviewsForUser(row._id)
                  }}
                  disabled={!row.reviewsCount}
                  aria-label={usersStrings.SHOW_REVIEWS}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
      {
        field: 'actions',
        headerName: usersStrings.ACTIONS_COLUMN,
        sortable: false,
        flex: 1,
        minWidth: 200,
        renderCell: ({ row }) => {
          const currentId = currentUser?._id
          const belongsToCurrentAgency = currentId
            ? (typeof row.supplier === 'string' ? row.supplier === currentId : row.supplier?._id === currentId)
            : false
          return (
            <UsersActionsCell
              user={row}
              isAdmin={isAdmin}
              canEdit={isAdmin || belongsToCurrentAgency}
              canDelete={isAdmin || belongsToCurrentAgency}
              onEdit={(userToEdit) => navigate(`/update-user?u=${userToEdit._id}`)}
              onDelete={handleDeleteUser}
              onToggleActive={handleToggleActive}
              onChangeRole={handleChangeRole}
              availableRoles={[bookcarsTypes.UserType.Admin, bookcarsTypes.UserType.Supplier, bookcarsTypes.UserType.User]}
            />
          )
        },
      }
    )

    return baseColumns
  }, [isAdmin, currentUser, navigate, actions, handleChangeRole, handleDeleteUser, handleToggleActive])

  const kpiCards = useMemo(() => {
    if (!state.kpi) {
      return []
    }
    return [
      { label: usersStrings.KPI_TOTAL_USERS, value: state.kpi.totalUsers },
      { label: usersStrings.KPI_ADMINS, value: state.kpi.admins },
      { label: usersStrings.KPI_AGENCIES, value: state.kpi.agencies },
      { label: usersStrings.KPI_DRIVERS, value: state.kpi.drivers },
      { label: usersStrings.KPI_INACTIVE, value: state.kpi.inactive },
      { label: usersStrings.KPI_WITHOUT_REVIEWS, value: state.kpi.withNoReviews },
      { label: usersStrings.KPI_NEW7, value: state.kpi.newUsers7d },
      { label: usersStrings.KPI_NEW30, value: state.kpi.newUsers30d },
    ]
  }, [state.kpi])

  const canBulkManage = state.selection.length > 0

  const renderContent = () => {
    if (state.viewMode === 'groupByAgency' && isAdmin) {
      return (
        <GroupByAgencyView
          users={state.users}
          onViewReviews={(user) => {
            setReviewUser(user)
            actions.setShowReviewsForUser(user._id)
          }}
          onToggleActive={handleToggleActive}
          isAdmin={isAdmin}
        />
      )
    }

    return (
      <Box sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          autoHeight
          disableRowSelectionOnClick
          checkboxSelection={!env.isMobile() && (isAdmin || currentUser?.type === bookcarsTypes.RecordType.Supplier)}
          getRowId={(row) => row._id as string}
          rows={state.users}
          columns={columns}
          rowCount={state.total}
          paginationMode="server"
          paginationModel={{ pageSize: state.pageSize, page: state.page }}
          onPaginationModelChange={({ pageSize, page }) => {
            actions.setPage(page)
            actions.setPageSize(pageSize)
          }}
          loading={state.loading}
          pageSizeOptions={[10, 25, 50]}
          onSortModelChange={handleSortModelChange}
          onRowSelectionModelChange={(selection) => {
            const ids = selection.map((id) => id.toString())
            actions.setSelection(ids)
          }}
        />
      </Box>
    )
  }

  return (
    <Layout onLoad={onLoad} strict>
      {currentUser && (
        <Stack spacing={3} sx={{ p: { xs: 1, md: 3 } }}>
          <UsersToolbar
            state={state}
            isAdmin={isAdmin}
            canBulkManage={canBulkManage}
            onCreateUser={() => navigate('/create-user')}
            onBulkActivate={handleBulkActivate}
            onBulkDelete={handleBulkDelete}
            onBulkChangeRole={handleBulkChangeRole}
            onBulkAssignAgency={handleBulkAssignAgency}
            agencies={agencies}
            onViewModeChange={(mode: UsersViewMode) => actions.setViewMode(mode)}
            onKeywordChange={(keyword) => {
              actions.setKeyword(keyword)
              actions.setPage(0)
            }}
            onTypesChange={(types) => {
              actions.setTypes(types)
              actions.setPage(0)
            }}
            onStatusChange={(status) => {
              actions.setStatus(status)
              actions.setPage(0)
            }}
            onVerifiedChange={(verified) => {
              actions.setVerified(verified)
              actions.setPage(0)
            }}
            onAgencyChange={(agencyId) => {
              actions.setAgencyId(agencyId)
              actions.setPage(0)
            }}
            onWithReviewsChange={(withReviews) => {
              actions.setWithReviews(withReviews)
              actions.setPage(0)
            }}
            onLastLoginChange={(range) => {
              actions.setLastLoginRange(range)
              actions.setPage(0)
            }}
          />

          <Box>
            <Typography variant="h6" gutterBottom>{usersStrings.KPI_SCOPE_LABEL}</Typography>
            <Typography variant="body2" color="text.secondary">
              {isAdmin ? usersStrings.KPI_SCOPE_PLATFORM : usersStrings.KPI_SCOPE_AGENCY}
            </Typography>
          </Box>

          {state.kpiLoading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {kpiCards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.label}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">{card.label}</Typography>
                      <Typography variant="h5">{card.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          {kpiError && <UsersError message={kpiError} onRetry={loadKpi} />}

          {usersError && <UsersError message={usersError} onRetry={loadUsers} />}

          {renderContent()}
        </Stack>
      )}

      <UserReviewsDrawer
        open={Boolean(state.showReviewsForUserId)}
        user={reviewUser}
        onClose={() => {
          actions.setShowReviewsForUser(undefined)
          setReviewUser(undefined)
        }}
        canExport={isAdmin}
      />
    </Layout>
  )
}

export default Users
