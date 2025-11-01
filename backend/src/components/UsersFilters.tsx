import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
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
  admin: boolean
  filters: UsersFiltersState
  agencies: bookcarsTypes.User[]
  onChange: (filters: UsersFiltersState) => void
  onReset: () => void
}

const toggleValue = <T,>(values: T[], value: T) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

const UsersFilters = ({
  admin,
  filters,
  agencies,
  onChange,
  onReset,
}: UsersFiltersProps) => {
  const handleRolesChange = (role: bookcarsTypes.UserType) => {
    onChange({
      ...filters,
      roles: toggleValue(filters.roles, role),
    })
  }

  const handleVerificationChange = (status: UserVerificationFilterValue) => {
    onChange({
      ...filters,
      verification: toggleValue(filters.verification, status),
    })
  }

  const handleActivityChange = (status: UserActivityFilterValue) => {
    onChange({
      ...filters,
      activity: toggleValue(filters.activity, status),
    })
  }

  const handleBlacklistChange = (status: UserBlacklistFilterValue) => {
    onChange({
      ...filters,
      blacklisted: status,
    })
  }

  const handleAgencyChange = (agencyId: string) => {
    onChange({
      ...filters,
      agencyId,
    })
  }

  const handleDateChange = (key: 'lastLoginFrom' | 'lastLoginTo', value: string) => {
    onChange({
      ...filters,
      [key]: value || null,
    })
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid #e0e0e0' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {strings.FILTERS_TITLE}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {strings.FILTERS_DESCRIPTION}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                {strings.ROLE_FILTER_TITLE}
              </FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={filters.roles.includes(bookcarsTypes.UserType.Admin)}
                      onChange={() => handleRolesChange(bookcarsTypes.UserType.Admin)}
                    />
                  )}
                  label={commonStrings.ADMIN}
                />
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={filters.roles.includes(bookcarsTypes.UserType.Supplier)}
                      onChange={() => handleRolesChange(bookcarsTypes.UserType.Supplier)}
                    />
                  )}
                  label={commonStrings.SUPPLIER}
                />
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={filters.roles.includes(bookcarsTypes.UserType.User)}
                      onChange={() => handleRolesChange(bookcarsTypes.UserType.User)}
                    />
                  )}
                  label={strings.CLIENT_LABEL}
                />
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                {strings.VERIFICATION_FILTER_TITLE}
              </FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={filters.verification.includes('verified')}
                      onChange={() => handleVerificationChange('verified')}
                    />
                  )}
                  label={strings.VERIFIED_LABEL}
                />
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={filters.verification.includes('unverified')}
                      onChange={() => handleVerificationChange('unverified')}
                    />
                  )}
                  label={strings.UNVERIFIED_LABEL}
                />
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                {strings.ACTIVITY_FILTER_TITLE}
              </FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={filters.activity.includes('active')}
                      onChange={() => handleActivityChange('active')}
                    />
                  )}
                  label={strings.ACTIVE_LABEL}
                />
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={filters.activity.includes('inactive')}
                      onChange={() => handleActivityChange('inactive')}
                    />
                  )}
                  label={strings.INACTIVE_LABEL}
                />
              </FormGroup>
            </FormControl>
          </Grid>

          {admin && (
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset" variant="standard">
                <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                  {strings.BLACKLIST_FILTER_TITLE}
                </FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={filters.blacklisted === 'blacklisted'}
                        onChange={() => handleBlacklistChange('blacklisted')}
                      />
                    )}
                    label={strings.BLACKLIST_ONLY_LABEL}
                  />
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={filters.blacklisted === 'not_blacklisted'}
                        onChange={() => handleBlacklistChange('not_blacklisted')}
                      />
                    )}
                    label={strings.WHITELIST_ONLY_LABEL}
                  />
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={filters.blacklisted === 'all'}
                        onChange={() => handleBlacklistChange('all')}
                      />
                    )}
                    label={commonStrings.ALL}
                  />
                </FormGroup>
              </FormControl>
            </Grid>
          )}

          {admin && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="users-agency-filter">{strings.AGENCY_FILTER_LABEL}</InputLabel>
                <Select
                  labelId="users-agency-filter"
                  label={strings.AGENCY_FILTER_LABEL}
                  value={filters.agencyId || ''}
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
            </Grid>
          )}

          {admin && (
            <Grid item xs={12} md={4}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
                <TextField
                  label={strings.LAST_LOGIN_FROM_LABEL}
                  type="date"
                  value={filters.lastLoginFrom || ''}
                  onChange={(event) => handleDateChange('lastLoginFrom', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label={strings.LAST_LOGIN_TO_LABEL}
                  type="date"
                  value={filters.lastLoginTo || ''}
                  onChange={(event) => handleDateChange('lastLoginTo', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </Grid>
          )}
        </Grid>

        <Box display="flex" justifyContent="flex-end">
          <Button variant="text" color="primary" onClick={onReset}>
            {strings.RESET_FILTERS}
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}

export default UsersFilters
