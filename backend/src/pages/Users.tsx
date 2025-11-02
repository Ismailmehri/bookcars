import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link as MuiLink,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import { GridColumnVisibilityModel, GridDensity, GridSortModel } from '@mui/x-data-grid'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import Search from '@/components/Search'
import UsersFilters from '@/components/UsersFilters'
import UsersStatsCards from '@/components/UsersStatsCards'
import UserList from '@/components/UserList'
import UserReviewsDialog from '@/components/UserReviewsDialog'
import { strings } from '@/lang/users'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import * as SupplierService from '@/services/SupplierService'
import {
  UsersFiltersState,
  UsersPersistedState,
  defaultUsersFiltersState,
} from './users.types'

import '@/assets/css/users.css'

const STORAGE_KEY = 'bc-users-filters'

interface ConfirmState {
  message: string
  onConfirm: () => Promise<void>
}

const adminDefaultRoles = [
  bookcarsTypes.UserType.Admin,
  bookcarsTypes.UserType.Supplier,
  bookcarsTypes.UserType.User,
]

const agencyDefaultRoles = [
  bookcarsTypes.UserType.Supplier,
  bookcarsTypes.UserType.User,
]

const defaultSortModel: GridSortModel = [{ field: 'lastLoginAt', sort: 'desc' }]
const defaultVisibilityModel: GridColumnVisibilityModel = {}
const defaultDensity: GridDensity = 'comfortable'

const sanitizeRoles = (roles: bookcarsTypes.UserType[], isAdmin: boolean) => {
  const allowed = isAdmin ? adminDefaultRoles : agencyDefaultRoles
  const sanitized = roles.filter((role) => allowed.includes(role))
  return sanitized.length > 0 ? sanitized : allowed
}

const countActiveFilters = (filters: UsersFiltersState, isAdmin: boolean) => {
  let count = 0
  const defaultRoles = isAdmin ? adminDefaultRoles : agencyDefaultRoles
  const rolesDiff =
    filters.roles.length > 0 &&
    (filters.roles.length !== defaultRoles.length || filters.roles.some((role) => !defaultRoles.includes(role)))

  if (rolesDiff) {
    count += 1
  }

  if (filters.verification.length > 0) {
    count += 1
  }

  if (filters.activity.length > 0) {
    count += 1
  }

  if (isAdmin) {
    if (filters.blacklisted !== 'all') {
      count += 1
    }

    if (filters.agencyId) {
      count += 1
    }

    if (filters.lastLoginFrom || filters.lastLoginTo) {
      count += 1
    }
  }

  return count
}

const Users = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [admin, setAdmin] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<UsersFiltersState>(defaultUsersFiltersState)
  const [agencies, setAgencies] = useState<bookcarsTypes.User[]>([])
  const [stats, setStats] = useState<bookcarsTypes.UsersStatsResponse>()
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string>()
  const [selection, setSelection] = useState<{ ids: string[]; rows: bookcarsTypes.User[] }>({ ids: [], rows: [] })
  const [refreshToken, setRefreshToken] = useState(0)
  const [selectionResetKey, setSelectionResetKey] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [reviewsUser, setReviewsUser] = useState<bookcarsTypes.User>()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortModel, setSortModel] = useState<GridSortModel>(defaultSortModel)
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(defaultVisibilityModel)
  const [density, setDensity] = useState<GridDensity>(defaultDensity)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  useEffect(() => {
    try {
      const persistedRaw = localStorage.getItem(STORAGE_KEY)
      if (persistedRaw) {
        const persisted = JSON.parse(persistedRaw) as UsersPersistedState
        setKeyword(persisted.keyword || '')
        if (persisted.filters) {
          setFilters(persisted.filters)
        }
        if (persisted.sortModel) {
          setSortModel(persisted.sortModel)
        }
        if (persisted.columnVisibilityModel) {
          setColumnVisibilityModel(persisted.columnVisibilityModel)
        }
        if (persisted.density) {
          setDensity(persisted.density)
        }
      }
    } catch (err) {
      helper.error(err)
    }
  }, [])

  useEffect(() => {
    if (user) {
      const isAdmin = helper.admin(user)
      setAdmin(isAdmin)
      setFilters((prev) => ({
        ...prev,
        roles: sanitizeRoles(prev.roles, isAdmin),
      }))
    }
  }, [admin, user])

  useEffect(() => {
    if (!admin) {
      setFilters((prev) => ({
        ...prev,
        blacklisted: 'all',
        agencyId: null,
        lastLoginFrom: null,
        lastLoginTo: null,
      }))
    }
  }, [admin])

  const reloadStats = useCallback(async () => {
    if (!admin) {
      return
    }

    try {
      setStatsLoading(true)
      setStatsError(undefined)
      const data = await UserService.getUsersStats()
      setStats(data)
    } catch (err) {
      setStatsError(strings.STATS_ERROR)
      helper.error(err)
    } finally {
      setStatsLoading(false)
    }
  }, [admin])

  useEffect(() => {
    reloadStats()
  }, [reloadStats])

  useEffect(() => {
    const loadAgencies = async () => {
      if (!admin) {
        return
      }
      try {
        const list = await SupplierService.getAllSuppliers()
        setAgencies(list)
      } catch (err) {
        helper.error(err)
      }
    }

    loadAgencies()
  }, [admin])

  const onLoad = (_user?: bookcarsTypes.User) => {
    if (_user) {
      const isAdmin = helper.admin(_user)
      setUser(_user)
      setAdmin(isAdmin)
      setFilters((prev) => ({
        ...prev,
        roles: sanitizeRoles(prev.roles, isAdmin),
      }))
    }
  }

  const handleSearch = (value: string) => {
    setKeyword(value)
    setSelectionResetKey((prev) => prev + 1)
    setUnsavedChanges(true)
  }

  const handleFiltersApply = (nextFilters: UsersFiltersState) => {
    setFilters({
      ...nextFilters,
      roles: sanitizeRoles(nextFilters.roles, admin),
    })
    setSelectionResetKey((prev) => prev + 1)
    setFiltersOpen(false)
    setUnsavedChanges(true)
  }

  const handleResetFilters = () => {
    setFilters({
      ...defaultUsersFiltersState,
      roles: admin ? adminDefaultRoles : agencyDefaultRoles,
    })
    setSelectionResetKey((prev) => prev + 1)
    setUnsavedChanges(true)
  }

  const handleSelectionChange = (nextSelection: { ids: string[]; rows: bookcarsTypes.User[] }) => {
    setSelection(nextSelection)
  }

  const handleReviewsClick = (selectedUser: bookcarsTypes.User) => {
    setReviewsUser(selectedUser)
    setReviewsOpen(true)
  }

  const closeReviewsDialog = () => {
    setReviewsOpen(false)
    setReviewsUser(undefined)
  }

  const buildUpdatePayload = (source: bookcarsTypes.User, patch: Partial<bookcarsTypes.UpdateUserPayload>): bookcarsTypes.UpdateUserPayload => ({
    _id: source._id as string,
    fullName: source.fullName,
    phone: source.phone || '',
    bio: source.bio || '',
    location: source.location || '',
    language: source.language || UserService.getLanguage(),
    type: (patch.type as string) || (source.type as string),
    avatar: source.avatar,
    birthDate: source.birthDate ? new Date(source.birthDate).getTime() : undefined,
    active: typeof patch.active !== 'undefined' ? patch.active : source.active,
    blacklisted: typeof patch.blacklisted !== 'undefined' ? patch.blacklisted : source.blacklisted,
    payLater: source.payLater,
  })

  const performBulkUpdate = async (patch: (item: bookcarsTypes.User) => Partial<bookcarsTypes.UpdateUserPayload>) => {
    if (selection.rows.length === 0) {
      return
    }

    try {
      setActionLoading(true)
      const responses = await Promise.all(selection.rows.map(async (item) => {
        const payload = buildUpdatePayload(item, patch(item))
        return UserService.updateUser(payload)
      }))

      if (responses.every((status) => status === 200)) {
        helper.info(strings.USERS_UPDATED_SUCCESS)
        setRefreshToken((prev) => prev + 1)
        setSelectionResetKey((prev) => prev + 1)
      } else {
        helper.error(undefined, strings.USERS_UPDATE_ERROR)
      }
    } catch (err) {
      helper.error(err, strings.USERS_UPDATE_ERROR)
    } finally {
      setActionLoading(false)
    }
  }

  const performBulkDelete = async () => {
    if (selection.ids.length === 0) {
      return
    }

    try {
      setActionLoading(true)
      const status = await UserService.deleteUsers(selection.ids)
      if (status === 200) {
        helper.info(strings.USERS_DELETED_SUCCESS)
        setRefreshToken((prev) => prev + 1)
        setSelectionResetKey((prev) => prev + 1)
      } else {
        helper.error(undefined, strings.USERS_DELETE_ERROR)
      }
    } catch (err) {
      helper.error(err, strings.USERS_DELETE_ERROR)
    } finally {
      setActionLoading(false)
    }
  }

  const openConfirm = (message: string, onConfirm: () => Promise<void>) => {
    setConfirmState({ message, onConfirm })
  }

  const handleConfirm = async () => {
    if (!confirmState) {
      return
    }

    try {
      setActionLoading(true)
      await confirmState.onConfirm()
      setConfirmState(null)
    } finally {
      setActionLoading(false)
    }
  }

  const handleActivate = () => openConfirm(strings.CONFIRM_ACTIVATE, () => performBulkUpdate(() => ({ active: true })))
  const handleDeactivate = () => openConfirm(strings.CONFIRM_DEACTIVATE, () => performBulkUpdate(() => ({ active: false })))
  const handleBlacklist = () => openConfirm(strings.CONFIRM_BLACKLIST, () => performBulkUpdate(() => ({ blacklisted: true })))
  const handleToSupplier = () => openConfirm(strings.CONFIRM_TO_SUPPLIER, () => performBulkUpdate(() => ({ type: bookcarsTypes.UserType.Supplier })))
  const handleToClient = () => openConfirm(strings.CONFIRM_TO_CLIENT, () => performBulkUpdate(() => ({ type: bookcarsTypes.UserType.User })))
  const handleDelete = () => openConfirm(strings.CONFIRM_DELETE, performBulkDelete)

  const canBulk = selection.ids.length > 0 && !actionLoading

  const resultsLabel = useMemo(() => strings.formatString(strings.RESULTS_COUNT, totalUsers.toLocaleString()) as string, [totalUsers])

  const filtersCount = useMemo(() => countActiveFilters(filters, admin), [filters, admin])

  const handleSaveView = () => {
    const state: UsersPersistedState = {
      keyword,
      filters,
      sortModel,
      columnVisibilityModel,
      density,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    helper.info(strings.SAVE_VIEW_SUCCESS)
    setUnsavedChanges(false)
  }

  const handleResetView = () => {
    setKeyword('')
    setFilters({
      ...defaultUsersFiltersState,
      roles: admin ? adminDefaultRoles : agencyDefaultRoles,
    })
    setSortModel(defaultSortModel)
    setColumnVisibilityModel(defaultVisibilityModel)
    setDensity(defaultDensity)
    setSelectionResetKey((prev) => prev + 1)
    setRefreshToken((prev) => prev + 1)
    setUnsavedChanges(false)
    localStorage.removeItem(STORAGE_KEY)
    helper.info(strings.RESET_VIEW_SUCCESS)
  }

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model)
    setUnsavedChanges(true)
  }

  const handleVisibilityChange = (model: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(model)
    setUnsavedChanges(true)
  }

  const handleDensityChange = (value: GridDensity) => {
    setDensity(value)
    setUnsavedChanges(true)
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <Box className="users-page-wrapper">
          <Container maxWidth="xl" className="users-page">
            <Box className="users-header">
              <Breadcrumbs className="users-breadcrumbs">
                <MuiLink color="inherit" href="/">
                  {strings.BREADCRUMB_HOME}
                </MuiLink>
                <Typography color="text.secondary">{strings.BREADCRUMB_ADMIN}</Typography>
                <Typography color="text.primary">{strings.BREADCRUMB_USERS}</Typography>
              </Breadcrumbs>
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {strings.PAGE_TITLE}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {strings.PAGE_SUBTITLE}
                </Typography>
              </Box>
            </Box>

            {admin && (
              <Box className="users-stats-section">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" fontWeight={700} color="text.primary">
                    {strings.STATS_TITLE}
                  </Typography>
                  {statsLoading && <CircularProgress size={20} />}
                </Stack>
                {statsError && (
                  <Alert
                    severity="error"
                    action={(
                      <Button color="inherit" size="small" onClick={reloadStats}>
                        {strings.RETRY}
                      </Button>
                    )}
                  >
                    {statsError}
                  </Alert>
                )}
                <UsersStatsCards stats={stats} loading={statsLoading} />
              </Box>
            )}

            <Box className="users-toolbar-container">
              <Box className="users-toolbar">
                <Box className="users-toolbar__search">
                  <Search onSubmit={handleSearch} className="users-search" initialValue={keyword} />
                </Box>
                <Box className="users-toolbar__actions">
                  <Badge
                    color="primary"
                    badgeContent={filtersCount}
                    overlap="circular"
                    invisible={filtersCount === 0}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<FilterAltOutlinedIcon />}
                      onClick={() => setFiltersOpen(true)}
                    >
                      {strings.FILTERS_BUTTON}
                    </Button>
                  </Badge>
                  <Tooltip title={strings.SAVE_VIEW} disableHoverListener={!unsavedChanges}>
                    <span>
                      <Badge color="secondary" variant="dot" invisible={!unsavedChanges} overlap="circular">
                        <Button
                          variant="outlined"
                          startIcon={<BookmarkBorderOutlinedIcon />}
                          onClick={handleSaveView}
                          disabled={!unsavedChanges}
                        >
                          {strings.SAVE_VIEW}
                        </Button>
                      </Badge>
                    </span>
                  </Tooltip>
                  <Tooltip title={strings.RESET_VIEW}>
                    <span>
                      <IconButton onClick={handleResetView}>
                        <RefreshOutlinedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={strings.ADMIN_ONLY_ACTION}
                    placement="top"
                    arrow
                    disableFocusListener={admin}
                    disableHoverListener={admin}
                    disableTouchListener={admin}
                  >
                    <span>
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        className="users-add"
                        href="/create-user"
                        startIcon={<AddIcon />}
                        disabled={!admin}
                      >
                        {strings.NEW_USER}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            <Grid container justifyContent="space-between" alignItems="center" className="users-meta">
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  {resultsLabel}
                </Typography>
              </Grid>
              {actionLoading && (
                <Grid item>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                      {commonStrings.PLEASE_WAIT}
                    </Typography>
                  </Stack>
                </Grid>
              )}
            </Grid>

            <UserList
              user={user}
              keyword={keyword}
              filters={filters}
              admin={admin}
              refreshToken={refreshToken}
              selectionResetKey={selectionResetKey}
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={handleVisibilityChange}
              density={density}
              onDensityChange={handleDensityChange}
              onSelectionChange={handleSelectionChange}
              onReviewsClick={handleReviewsClick}
              onTotalChange={setTotalUsers}
            />
          </Container>

          {admin && selection.ids.length > 0 && (
            <Box className="users-bulk-bar">
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {strings.formatString(strings.BULK_SELECTED_COUNT, selection.ids.length) as string}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {strings.BULK_ACTIONS_DESCRIPTION}
                </Typography>
              </Stack>
              <Box className="users-bulk-bar__actions">
                <Button variant="outlined" onClick={handleActivate} disabled={!canBulk}>
                  {strings.BULK_ACTIVATE}
                </Button>
                <Button variant="outlined" onClick={handleDeactivate} disabled={!canBulk}>
                  {strings.BULK_DEACTIVATE}
                </Button>
                <Button variant="outlined" onClick={handleBlacklist} disabled={!canBulk}>
                  {strings.BULK_BLACKLIST}
                </Button>
                <Button variant="outlined" onClick={handleToSupplier} disabled={!canBulk}>
                  {strings.BULK_TO_SUPPLIER}
                </Button>
                <Button variant="outlined" onClick={handleToClient} disabled={!canBulk}>
                  {strings.BULK_TO_CLIENT}
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete} disabled={!canBulk}>
                  {strings.BULK_DELETE}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}

      <UsersFilters
        open={filtersOpen}
        admin={admin}
        filters={filters}
        agencies={agencies}
        onApply={handleFiltersApply}
        onReset={handleResetFilters}
        onClose={() => setFiltersOpen(false)}
      />

      <UserReviewsDialog open={reviewsOpen} user={reviewsUser} onClose={closeReviewsDialog} />

      <Dialog open={Boolean(confirmState)} onClose={() => setConfirmState(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent className="dialog-content">
          {confirmState?.message}
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setConfirmState(null)} variant="contained" className="btn-secondary">
            {commonStrings.CANCEL}
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="primary" disabled={actionLoading}>
            {commonStrings.CONFIRM}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}

export default Users
