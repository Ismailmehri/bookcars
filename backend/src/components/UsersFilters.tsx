import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/users'
import { strings as commonStrings } from '@/lang/common'
import {
  UsersFiltersState,
  UserActivityFilterValue,
  UserBlacklistFilterValue,
  UserVerificationFilterValue,
} from '@/pages/users.types'

interface UsersFiltersProps {
  open: boolean
  admin: boolean
  filters: UsersFiltersState
  agencies: bookcarsTypes.User[]
  onApply: (filters: UsersFiltersState) => void
  onReset: () => void
  onClose: () => void
}

const toggleValue = <T, >(values: T[], value: T) =>
  (values.includes(value) ? values.filter((item) => item !== value) : [...values, value])

const UsersFilters = ({ open, admin, filters, agencies, onApply, onReset, onClose }: UsersFiltersProps) => {
  const [draft, setDraft] = useState<UsersFiltersState>(filters)

  useEffect(() => {
    if (open) {
      setDraft(filters)
    }
  }, [filters, open])

  const isApplyDisabled = useMemo(() => JSON.stringify(draft) === JSON.stringify(filters), [draft, filters])

  const handleRolesChange = (role: bookcarsTypes.UserType) => {
    setDraft((prev) => ({
      ...prev,
      roles: toggleValue(prev.roles, role),
    }))
  }

  const handleVerificationChange = (status: UserVerificationFilterValue) => {
    setDraft((prev) => ({
      ...prev,
      verification: toggleValue(prev.verification, status),
    }))
  }

  const handleActivityChange = (status: UserActivityFilterValue) => {
    setDraft((prev) => ({
      ...prev,
      activity: toggleValue(prev.activity, status),
    }))
  }

  const handleBlacklistChange = (status: UserBlacklistFilterValue) => {
    setDraft((prev) => ({
      ...prev,
      blacklisted: prev.blacklisted === status ? 'all' : status,
    }))
  }

  const handleAgencyChange = (agencyId: string) => {
    setDraft((prev) => ({
      ...prev,
      agencyId: agencyId || null,
    }))
  }

  const handleDateChange = (key: 'lastLoginFrom' | 'lastLoginTo', value: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value || null,
    }))
  }

  const applyFilters = () => {
    onApply(draft)
    onClose()
  }

  const resetFilters = () => {
    onReset()
    onClose()
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380, md: 420 },
          borderRadius: { xs: '24px 24px 0 0', sm: '24px 0 0 24px' },
          borderLeft: '1px solid #E8EEF4',
          backgroundColor: '#fff',
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      <Stack spacing={3} height="100%">
        <Box px={3} pt={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {strings.FILTERS_TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {strings.FILTERS_DESCRIPTION}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label={commonStrings.CLOSE} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Stack spacing={4} px={3} flex={1} overflow="auto" data-testid="users-filters">
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
              {strings.ROLE_FILTER_TITLE}
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={draft.roles.includes(bookcarsTypes.UserType.Admin)}
                    onChange={() => handleRolesChange(bookcarsTypes.UserType.Admin)}
                  />
                )}
                label={commonStrings.ADMIN}
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={draft.roles.includes(bookcarsTypes.UserType.Supplier)}
                    onChange={() => handleRolesChange(bookcarsTypes.UserType.Supplier)}
                  />
                )}
                label={commonStrings.SUPPLIER}
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={draft.roles.includes(bookcarsTypes.UserType.User)}
                    onChange={() => handleRolesChange(bookcarsTypes.UserType.User)}
                  />
                )}
                label={strings.CLIENT_LABEL}
              />
            </FormGroup>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
              {strings.VERIFICATION_FILTER_TITLE}
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={draft.verification.includes('verified')}
                    onChange={() => handleVerificationChange('verified')}
                  />
                )}
                label={strings.VERIFIED_LABEL}
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={draft.verification.includes('unverified')}
                    onChange={() => handleVerificationChange('unverified')}
                  />
                )}
                label={strings.UNVERIFIED_LABEL}
              />
            </FormGroup>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
              {strings.ACTIVITY_FILTER_TITLE}
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={draft.activity.includes('active')}
                    onChange={() => handleActivityChange('active')}
                  />
                )}
                label={strings.ACTIVE_LABEL}
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={draft.activity.includes('inactive')}
                    onChange={() => handleActivityChange('inactive')}
                  />
                )}
                label={strings.INACTIVE_LABEL}
              />
            </FormGroup>
          </Box>

          {admin && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                {strings.BLACKLIST_FILTER_TITLE}
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={draft.blacklisted === 'blacklisted'}
                      onChange={() => handleBlacklistChange('blacklisted')}
                    />
                  )}
                  label={strings.BLACKLIST_ONLY_LABEL}
                />
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={draft.blacklisted === 'not_blacklisted'}
                      onChange={() => handleBlacklistChange('not_blacklisted')}
                    />
                  )}
                  label={strings.WHITELIST_ONLY_LABEL}
                />
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={draft.blacklisted === 'all'}
                      onChange={() => handleBlacklistChange('all')}
                    />
                  )}
                  label={commonStrings.ALL}
                />
              </FormGroup>
            </Box>
          )}

          {admin && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                {strings.AGENCY_FILTER_LABEL}
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="users-agency-filter">{strings.AGENCY_FILTER_LABEL}</InputLabel>
                <Select
                  labelId="users-agency-filter"
                  label={strings.AGENCY_FILTER_LABEL}
                  value={draft.agencyId || ''}
                  onChange={(event) => handleAgencyChange(event.target.value)}
                >
                  <MenuItem value="">{commonStrings.ALL}</MenuItem>
                  {agencies.map((agency) => (
                    <MenuItem key={agency._id} value={agency._id}>
                      {agency.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {admin && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                {strings.LAST_LOGIN_SECTION_LABEL}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label={strings.LAST_LOGIN_FROM_LABEL}
                  type="date"
                  value={draft.lastLoginFrom || ''}
                  onChange={(event) => handleDateChange('lastLoginFrom', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={strings.LAST_LOGIN_TO_LABEL}
                  type="date"
                  value={draft.lastLoginTo || ''}
                  onChange={(event) => handleDateChange('lastLoginTo', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Stack>
            </Box>
          )}
        </Stack>

        <Divider />

        <Box px={3} py={2} display="flex" justifyContent="space-between" alignItems="center">
          <Button onClick={resetFilters} color="inherit">
            {strings.RESET_FILTERS}
          </Button>
          <Stack direction="row" spacing={1.5}>
            <Button onClick={onClose}>{strings.CLOSE_FILTERS}</Button>
            <Button variant="contained" onClick={applyFilters} disabled={isApplyDisabled}>
              {strings.APPLY_FILTERS}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Drawer>
  )
}

export default UsersFilters
