import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
  MenuItem,
} from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import { strings as usersStrings } from '@/lang/users'
import { strings as commonStrings } from '@/lang/common'
import { UsersReducerState, UsersViewMode } from '@/hooks/useUsersState'

interface UsersToolbarProps {
  state: UsersReducerState
  isAdmin: boolean
  canBulkManage: boolean
  onCreateUser: () => void
  onBulkActivate: (active: boolean) => void
  onBulkDelete: () => void
  onBulkChangeRole: (type: bookcarsTypes.UserType) => void
  onBulkAssignAgency: (agencyId: string) => void
  agencies: bookcarsTypes.Option[]
  onViewModeChange: (mode: UsersViewMode) => void
  onKeywordChange: (keyword: string) => void
  onTypesChange: (types: bookcarsTypes.UserType[]) => void
  onStatusChange: (status: ('active' | 'inactive')[]) => void
  onVerifiedChange: (verified: string[]) => void
  onAgencyChange: (agencyId?: string) => void
  onWithReviewsChange: (withReviews?: boolean) => void
  onLastLoginChange: (range?: bookcarsTypes.DateRangeFilter) => void
}

const UsersToolbar = ({
  state,
  isAdmin,
  canBulkManage,
  onCreateUser,
  onBulkActivate,
  onBulkDelete,
  onBulkChangeRole,
  onBulkAssignAgency,
  agencies,
  onViewModeChange,
  onKeywordChange,
  onTypesChange,
  onStatusChange,
  onVerifiedChange,
  onAgencyChange,
  onWithReviewsChange,
  onLastLoginChange,
}: UsersToolbarProps) => {
  const [localKeyword, setLocalKeyword] = useState(state.keyword)

  useEffect(() => {
    setLocalKeyword(state.keyword)
  }, [state.keyword])

  const userTypeOptions = useMemo(() => (
    isAdmin
      ? [bookcarsTypes.UserType.Admin, bookcarsTypes.UserType.Supplier, bookcarsTypes.UserType.User]
      : [bookcarsTypes.UserType.Supplier, bookcarsTypes.UserType.User]
  ), [isAdmin])

  const verifiedOptions = useMemo(() => ([
    { label: usersStrings.EMAIL_VERIFIED, value: 'emailVerified' },
    { label: usersStrings.KYC_VERIFIED, value: 'kycVerified' },
    { label: usersStrings.NOT_VERIFIED, value: 'unverified' },
  ]), [])

  const handleKeywordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onKeywordChange(localKeyword)
  }

  const handleWithReviewsToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onWithReviewsChange(event.target.checked ? true : undefined)
  }

  const handleLastLoginChange = (key: 'from' | 'to') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const nextRange: bookcarsTypes.DateRangeFilter = {
      ...state.lastLoginRange,
      [key]: value ? new Date(value).toISOString() : undefined,
    }
    if (!nextRange.from && !nextRange.to) {
      onLastLoginChange(undefined)
    } else {
      onLastLoginChange(nextRange)
    }
  }

  return (
    <Box component="section" sx={{ px: { xs: 0, md: 2 }, py: 2 }}>
      <form onSubmit={handleKeywordSubmit}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            fullWidth
            size="small"
            label={commonStrings.SEARCH}
            value={localKeyword}
            onChange={(event) => setLocalKeyword(event.target.value)}
            placeholder={usersStrings.SEARCH_PLACEHOLDER}
          />
          <Button type="submit" variant="contained" className="btn-primary" sx={{ minWidth: 120 }}>
            {commonStrings.SEARCH}
          </Button>
          <Button variant="outlined" onClick={onCreateUser} sx={{ minWidth: 160 }}>
            {usersStrings.NEW_USER}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {usersStrings.FILTER_BY_TYPE}
          </Typography>
          <ToggleButtonGroup
            value={state.types}
            onChange={(_, value) => onTypesChange(value as bookcarsTypes.UserType[])}
            size="small"
          >
            {userTypeOptions.map((option) => (
              <ToggleButton key={option} value={option} aria-label={option}>
                {commonStrings[`RECORD_TYPE_${option.toUpperCase()}` as keyof typeof commonStrings] || option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {usersStrings.FILTER_BY_STATUS}
          </Typography>
          <ToggleButtonGroup
            value={state.status}
            onChange={(_, value) => onStatusChange(value as ('active' | 'inactive')[])}
            size="small"
          >
            <ToggleButton value="active">{usersStrings.STATUS_ACTIVE}</ToggleButton>
            <ToggleButton value="inactive">{usersStrings.STATUS_INACTIVE}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {usersStrings.FILTER_VERIFIED}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {verifiedOptions.map((option) => {
              const selected = state.verified.includes(option.value)
              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  color={selected ? 'primary' : 'default'}
                  onClick={() => {
                    const next = selected
                      ? state.verified.filter((value) => value !== option.value)
                      : [...state.verified, option.value]
                    onVerifiedChange(next)
                  }}
                  variant={selected ? 'filled' : 'outlined'}
                />
              )
            })}
          </Stack>
        </Box>

        {isAdmin && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {usersStrings.FILTER_BY_AGENCY}
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={state.agencyId || ''}
              onChange={(event) => onAgencyChange(event.target.value || undefined)}
              label={usersStrings.SELECT_AGENCY}
            >
              <MenuItem value="">{commonStrings.ALL}</MenuItem>
              {agencies.map((agency) => (
                <MenuItem key={agency._id} value={agency._id}>{agency.name}</MenuItem>
              ))}
            </TextField>
          </Box>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <FormControlLabel
            control={(
              <Switch
                checked={Boolean(state.withReviews)}
                onChange={handleWithReviewsToggle}
              />
            )}
            label={usersStrings.ONLY_WITH_REVIEWS}
          />
          <TextField
            type="date"
            size="small"
            label={usersStrings.LAST_LOGIN_FROM}
            InputLabelProps={{ shrink: true }}
            onChange={handleLastLoginChange('from')}
            value={state.lastLoginRange?.from ? state.lastLoginRange.from.substring(0, 10) : ''}
          />
          <TextField
            type="date"
            size="small"
            label={usersStrings.LAST_LOGIN_TO}
            InputLabelProps={{ shrink: true }}
            onChange={handleLastLoginChange('to')}
            value={state.lastLoginRange?.to ? state.lastLoginRange.to.substring(0, 10) : ''}
          />
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <ToggleButtonGroup
          value={state.viewMode}
          exclusive
          onChange={(_, value) => value && onViewModeChange(value)}
          size="small"
        >
          <ToggleButton value="table">{usersStrings.VIEW_TABLE}</ToggleButton>
          <ToggleButton value="groupByAgency" disabled={!isAdmin}>{usersStrings.VIEW_GROUP_BY_AGENCY}</ToggleButton>
        </ToggleButtonGroup>

        {canBulkManage && (
          <ButtonGroup variant="contained" size="small">
            <Button onClick={() => onBulkActivate(true)}>{usersStrings.BULK_ACTIVATE}</Button>
            <Button onClick={() => onBulkActivate(false)}>{usersStrings.BULK_DEACTIVATE}</Button>
            {isAdmin && (
              <Button onClick={() => onBulkChangeRole(bookcarsTypes.UserType.Supplier)}>
                {usersStrings.BULK_ROLE_SUPPLIER}
              </Button>
            )}
            {isAdmin && (
              <Button onClick={() => onBulkChangeRole(bookcarsTypes.UserType.User)}>
                {usersStrings.BULK_ROLE_DRIVER}
              </Button>
            )}
            {isAdmin && agencies.length > 0 && (
              <Button onClick={() => onBulkAssignAgency(state.agencyId || agencies[0]._id)}>
                {usersStrings.BULK_ASSIGN_AGENCY}
              </Button>
            )}
            <Button color="error" onClick={onBulkDelete}>{usersStrings.BULK_DELETE}</Button>
          </ButtonGroup>
        )}
      </Stack>
    </Box>
  )
}

export default React.memo(UsersToolbar)
