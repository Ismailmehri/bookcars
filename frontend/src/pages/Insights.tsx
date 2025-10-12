import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  MenuItem
} from '@mui/material'

import Layout from '@/components/Layout'
import Seo from '@/components/Seo'
import AgencyView from '@/components/insights/AgencyView'
import AdminView from '@/components/insights/AdminView'
import {
  type AdminInsights,
  type AgencyInsights,
  type AgencyOption,
  type AsyncDataState,
  type DateRangeFilter
} from '@/types/insights'
import {
  buildInitialAdminState,
  buildInitialAgencyState,
  getAdminInsightsMock,
  getAgencyInsightsMock,
  listAgenciesMock
} from '@/lib/mocks/insights'
import { strings as insightsStrings } from '@/lang/insights'

const toInputDate = (date: Date) => date.toISOString().slice(0, 10)

const defaultRange = (): DateRangeFilter => {
  const today = new Date()
  const start = new Date()
  start.setDate(today.getDate() - 29)
  return {
    startDate: toInputDate(start),
    endDate: toInputDate(today),
  }
}

const Insights = () => {
  const [agencies, setAgencies] = useState<AgencyOption[]>([])
  const [selectedAgencyId, setSelectedAgencyId] = useState('')
  const [pendingAgencyId, setPendingAgencyId] = useState('')
  const [appliedRange, setAppliedRange] = useState<DateRangeFilter>(defaultRange())
  const [pendingRange, setPendingRange] = useState<DateRangeFilter>(defaultRange())
  const [agencyState, setAgencyState] = useState<AsyncDataState<AgencyInsights>>(buildInitialAgencyState())
  const [adminState, setAdminState] = useState<AsyncDataState<AdminInsights>>(buildInitialAdminState())
  const [tabIndex, setTabIndex] = useState(0)
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [fetchError, setFetchError] = useState<string>()

  const isRangeValid = useMemo(() => pendingRange.startDate <= pendingRange.endDate, [pendingRange])
  const filtersDirty = useMemo(
    () =>
      pendingAgencyId !== selectedAgencyId
      || pendingRange.startDate !== appliedRange.startDate
      || pendingRange.endDate !== appliedRange.endDate,
    [pendingAgencyId, selectedAgencyId, pendingRange, appliedRange]
  )

  useEffect(() => {
    let isMounted = true
    listAgenciesMock()
      .then((results) => {
        if (!isMounted) {
          return
        }
        setAgencies(results)
        const firstAgency = results[0]
        if (firstAgency) {
          setSelectedAgencyId(firstAgency.id)
          setPendingAgencyId(firstAgency.id)
        }
      })
      .catch(() => {
        if (!isMounted) {
          return
        }
        setFetchError(insightsStrings.STATUS_ERROR)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedAgencyId) {
      setAgencyState(buildInitialAgencyState())
      return undefined
    }

    setAgencyState({ status: 'loading', data: null })
    setFetchError(undefined)
    const controller = new AbortController()

    getAgencyInsightsMock(selectedAgencyId, appliedRange, { signal: controller.signal })
      .then((result) => {
        setAgencyState({ status: 'success', data: result })
      })
      .catch((err: unknown) => {
        if ((err as DOMException)?.name === 'AbortError') {
          return
        }
        setAgencyState({ status: 'error', data: null, error: (err as Error)?.message })
        setFetchError(insightsStrings.STATUS_ERROR)
      })

    return () => {
      controller.abort()
    }
  }, [selectedAgencyId, appliedRange])

  useEffect(() => {
    setAdminState({ status: 'loading', data: null })
    setFetchError(undefined)
    const controller = new AbortController()

    getAdminInsightsMock(appliedRange, { signal: controller.signal })
      .then((result) => {
        setAdminState({ status: 'success', data: result })
      })
      .catch((err: unknown) => {
        if ((err as DOMException)?.name === 'AbortError') {
          return
        }
        setAdminState({ status: 'error', data: null, error: (err as Error)?.message })
        setFetchError(insightsStrings.STATUS_ERROR)
      })

    return () => {
      controller.abort()
    }
  }, [appliedRange])

  useEffect(() => {
    if (loadingFilters && agencyState.status !== 'loading' && adminState.status !== 'loading') {
      setLoadingFilters(false)
    }
  }, [loadingFilters, agencyState.status, adminState.status])

  const handleRangeChange = (key: keyof DateRangeFilter) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingRange((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleApply = () => {
    if (!isRangeValid) {
      return
    }

    setAppliedRange({ ...pendingRange })
    setSelectedAgencyId(pendingAgencyId)
    setLoadingFilters(true)
  }

  const handleTabChange = (_event: React.SyntheticEvent, value: number) => {
    setTabIndex(value)
  }

  const applyDisabled = !isRangeValid || !filtersDirty || loadingFilters || !pendingAgencyId

  return (
    <Layout>
      <Seo title="Insights" description="Pilotage des indicateurs clés de Plany" canonical="https://plany.tn/insights" />
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box mb={4} display="flex" flexDirection="column" gap={1.5}>
          <Typography variant="h3" fontWeight={700} color="#1E2A45">
            {insightsStrings.TITLE}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {insightsStrings.SUBTITLE}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, rgba(30,136,229,0.12), rgba(255,122,0,0.08))',
            border: '1px solid rgba(30,136,229,0.18)',
          }}
          aria-label={insightsStrings.FILTER_TITLE}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label={insightsStrings.PERIOD_START}
                value={pendingRange.startDate}
                InputLabelProps={{ shrink: true }}
                onChange={handleRangeChange('startDate')}
                error={!isRangeValid}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label={insightsStrings.PERIOD_END}
                value={pendingRange.endDate}
                InputLabelProps={{ shrink: true }}
                onChange={handleRangeChange('endDate')}
                error={!isRangeValid}
                helperText={!isRangeValid ? insightsStrings.PERIOD_INVALID : undefined}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label={insightsStrings.AGENCY_PLACEHOLDER}
                value={pendingAgencyId}
                onChange={(event) => setPendingAgencyId(event.target.value)}
                disabled={agencies.length === 0}
              >
                {agencies.map((agency) => (
                  <MenuItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                onClick={handleApply}
                disabled={applyDisabled}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: '#1E88E5',
                  '&:hover': { backgroundColor: '#1664B4' },
                }}
              >
                {loadingFilters ? insightsStrings.STATUS_LOADING : insightsStrings.APPLY}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {fetchError && (
          <Box mb={2}>
            <Typography variant="body2" color="error">
              {fetchError}
            </Typography>
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(30, 136, 229, 0.18)',
            p: { xs: 2, md: 3 },
            backgroundColor: '#fff',
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="insights-tabs"
            textColor="primary"
            TabIndicatorProps={{ style: { backgroundColor: '#FF7A00', height: 4, borderRadius: 4 } }}
          >
            <Tab label={insightsStrings.AGENCY_TAB} id="insights-tab-0" aria-controls="insights-panel-0" />
            <Tab label={insightsStrings.ADMIN_TAB} id="insights-tab-1" aria-controls="insights-panel-1" />
          </Tabs>
          <Box mt={3}>
            {tabIndex === 0 && (
              <Box role="tabpanel" id="insights-panel-0" aria-labelledby="insights-tab-0">
                <AgencyView state={agencyState} />
              </Box>
            )}
            {tabIndex === 1 && (
              <Box role="tabpanel" id="insights-panel-1" aria-labelledby="insights-tab-1">
                <AdminView state={adminState} />
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Layout>
  )
}

export default Insights
