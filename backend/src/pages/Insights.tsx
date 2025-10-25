import React from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { subMonths } from 'date-fns'
import DateTimePicker from '@/components/DateTimePicker'
import Layout from '@/components/Layout'
import AgencyView from '@/components/insights/AgencyView'
import AdminView from '@/components/insights/AdminView'
import BoostedCarsView from '@/components/insights/BoostedCarsView'
import env from '@/config/env.config'
import { strings } from '@/lang/insights'
import { insightsPageContainerSx } from './insights.styles'
import { useInsightsMetrics } from './useInsightsMetrics'

const Insights: React.FC = () => {
  const {
    user,
    isAdmin,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    selectedAgency,
    setSelectedAgency,
    agencyOptions,
    agencyMetrics,
    adminMetrics,
    loading,
    buttonLoading,
    error,
    tab,
    setTab,
    adminTabLoaded,
    setAdminTabLoaded,
    applyFilters,
    handleUserLoaded,
    handleExportAgency,
    handleExportAdmin,
    refreshAdminOverview,
    filtersVersion,
  } = useInsightsMetrics()

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date)
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date)
    }
  }

  const handleAgencyChange = (value: string | null) => {
    setSelectedAgency(value ?? '')
    if (isAdmin) {
      setAdminTabLoaded(false)
    }
  }

  const handleApply = () => {
    const includeAdmin = isAdmin && tab === 'admin'
    if (isAdmin && tab !== 'admin') {
      setAdminTabLoaded(false)
    }
    applyFilters({ includeAdmin }).catch((err) => {
      console.error(err)
    })
  }

  const content = (
    <Stack spacing={4} sx={insightsPageContainerSx}>
      <Box
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: '#fff',
          p: 3,
          boxShadow: '0 12px 32px rgba(30, 136, 229, 0.08)',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E88E5' }}>
              {strings.TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {strings.FILTERS_DESCRIPTION}
            </Typography>
          </Stack>
        </Stack>

        <Grid container spacing={2} mt={1} alignItems="center">
          <Grid item xs={12} md={3}>
            <DateTimePicker
              label={strings.START_DATE}
              value={startDate}
              minDate={subMonths(new Date(), 12)}
              maxDate={endDate}
              onChange={handleStartDateChange}
              showTime={false}
              language={env.DEFAULT_LANGUAGE}
              format="dd/MM/yyyy"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <DateTimePicker
              label={strings.END_DATE}
              value={endDate}
              minDate={startDate}
              maxDate={new Date()}
              onChange={handleEndDateChange}
              showTime={false}
              language={env.DEFAULT_LANGUAGE}
              format="dd/MM/yyyy"
            />
          </Grid>
          {isAdmin ? (
            <Grid item xs={12} md={3}>
              <Autocomplete
                value={agencyOptions.find((option) => option.id === selectedAgency) ?? null}
                options={agencyOptions}
                fullWidth
                autoHighlight
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                onChange={(_event, option) => handleAgencyChange(option?.id ?? null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={strings.AGENCY_SEARCH_PLACEHOLDER}
                    placeholder={strings.AGENCY_SEARCH_PLACEHOLDER}
                  />
                )}
                ListboxProps={{ style: { maxHeight: 320 } }}
                noOptionsText={strings.AGENCY_NO_RESULTS}
              />
            </Grid>
          ) : null}
          <Grid item xs={12} md={3} display="flex" alignItems="center">
            <LoadingButton
              variant="contained"
              color="primary"
              onClick={handleApply}
              loading={buttonLoading}
              sx={{ minWidth: 160 }}
            >
              {strings.APPLY}
            </LoadingButton>
          </Grid>
        </Grid>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {isAdmin ? (
        <Tabs
          value={tab}
          onChange={(_event, value: 'agency' | 'admin' | 'boosted') => {
            setTab(value)
            if (value === 'admin' && !adminTabLoaded) {
              applyFilters({ includeAdmin: true }).catch((err) => {
                console.error(err)
              })
            }
          }}
          sx={{ alignSelf: 'flex-start' }}
        >
          <Tab value="agency" label={strings.TAB_AGENCY} />
          <Tab value="admin" label={strings.TAB_ADMIN} />
          <Tab value="boosted" label={strings.TAB_BOOSTED} />
        </Tabs>
      ) : null}

      {(!isAdmin || tab === 'agency') && selectedAgency ? (
        <AgencyView
          loading={loading}
          agencyName={agencyOptions.find((option) => option.id === selectedAgency)?.name || user?.fullName || ''}
          metrics={agencyMetrics}
          onExport={handleExportAgency}
        />
      ) : null}

      {isAdmin && tab === 'admin' ? (
        <AdminView
          loading={loading}
          metrics={adminMetrics}
          onExport={handleExportAdmin}
          onRankingRefresh={refreshAdminOverview}
        />
      ) : null}

      {isAdmin && tab === 'boosted' ? (
        <BoostedCarsView
          agencyOptions={agencyOptions}
          filtersVersion={filtersVersion}
          defaultAgencyId={selectedAgency}
        />
      ) : null}
    </Stack>
  )

  return (
    <Layout onLoad={handleUserLoaded} strict>
      {content}
    </Layout>
  )
}

export default Insights
