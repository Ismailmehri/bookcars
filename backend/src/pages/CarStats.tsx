import React, { useEffect, useState, useCallback } from 'react'
import { LineChart, PieChart } from '@mui/x-charts'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  SelectChangeEvent,
} from '@mui/material'
import { subMonths, subDays } from 'date-fns'
import { strings } from '@/lang/stats'
import { getBookingStats, getBookingSummary, getCarStats, getUniqueSuppliers } from '@/services/CarStatsService'
import Layout from '@/components/Layout'
import DateTimePicker from '@/components/DateTimePicker'
import * as bookcarsTypes from ':bookcars-types'
import SimpleBackdrop from '@/components/SimpleBackdrop'
import * as helper from '@/common/helper'
import env from '@/config/env.config'

const CarStats = () => {
  const ALL_CARS_VALUE = 'ALL_CARS'
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [stats, setStats] = useState<bookcarsTypes.SummedStat[]>([])
  const [bookingStats, setBookingStats] = useState<bookcarsTypes.BookingStat[]>([])
  const [cars, setCars] = useState<bookcarsTypes.ICar[]>([])
  const [selectedCar, setSelectedCar] = useState<string>('')
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 6)) // 6 mois avant
  const [endDate, setEndDate] = useState<Date>(subDays(new Date(), 1)) // Hier
  const [loading, setLoading] = useState<boolean>(true)
  const [admin, setAdmin] = useState<boolean>(false)
  const [suppliers, setSuppliers] = useState<bookcarsTypes.SuppliersStat[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    deposit: 0,
    reserved: 0
  })
  // Agréger les vues par date

    const sumViewsByDate = (data: bookcarsTypes.CarStat[]): bookcarsTypes.SummedStat[] => {
      const result: {
        [key: string]: {
          views: number;
          payedViews: number;
          organiqueViews: number;
        }
      } = {}

      data.forEach((item) => {
        const { date, views, payedViews, organiqueViews } = item

        if (!result[date]) {
          result[date] = {
            views: 0,
            payedViews: 0,
            organiqueViews: 0
          }
        }

        result[date].views += views
        result[date].payedViews += (payedViews || 0) // Gestion valeurs manquantes
        result[date].organiqueViews += (organiqueViews || 0) // Gestion valeurs manquantes
      })

      return Object.keys(result).map((date) => ({
        date,
        views: result[date].views,
        payedViews: result[date].payedViews,
        organiqueViews: result[date].organiqueViews
      }))
    }

  const fetchBookingStats = useCallback(
    async (supplierId?: string) => {
      try {
        const statsData = await getBookingStats(
          supplierId || user?._id,
          selectedCar === ALL_CARS_VALUE ? '' : selectedCar,
          startDate,
          endDate
        )
        setBookingStats(statsData)
      } catch (error) {
        console.error('Error fetching booking stats:', error)
      } finally {
        setLoading(false)
      }
    },
    [user?._id, startDate, selectedCar, endDate]
  )
  // Récupérer les statistiques avec useCallback
  const fetchCarStats = useCallback(
    async (supplierId?: string) => {
      try {
        const statsData = await getCarStats(supplierId || user?._id, selectedCar === ALL_CARS_VALUE ? '' : selectedCar, startDate, endDate)
        setStats(sumViewsByDate(statsData))

        // Extraire les noms des voitures si aucune voiture n'est sélectionnée
        if (!selectedCar) {
          const uniqueCars = Array.from(
            new Map(statsData.map((stat: bookcarsTypes.CarStat) => [stat.carId, { id: stat.carId, name: stat.carName }])).values()
          )
          setCars(uniqueCars)
        }
      } catch (error) {
        console.error('Error fetching car stats:', error)
      } finally {
        setLoading(false)
      }
    },
    [user?._id, selectedCar, startDate, endDate] // Dépendances de fetchCarStats
  )

  // Récupérer la liste des agences pour l'admin
  const fetchSuppliers = async () => {
    try {
      const suppliersData = await getUniqueSuppliers()
      setSuppliers(suppliersData)
      if (suppliersData.length > 0) {
        setSelectedSupplier(suppliersData[0].supplierId) // Sélectionner la première agence par défaut
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }
  useEffect(() => {
    const loadSummary = async () => {
      if (user?._id || selectedSupplier) {
        const supplierId = admin && selectedSupplier ? selectedSupplier : user?._id
        const data = await getBookingSummary(
          supplierId
        )
        setSummary(data)
      }
    }
    loadSummary()
  }, [admin, selectedSupplier, user?._id, selectedCar])

  useEffect(() => {
    if (admin) {
      fetchSuppliers()
    }
  }, [admin])

  useEffect(() => {
    if (admin && selectedSupplier) {
      fetchBookingStats(selectedSupplier)
    } else if (user?._id) {
      fetchBookingStats()
    }
  }, [fetchBookingStats, admin, selectedSupplier, user?._id, selectedCar])

  useEffect(() => {
    if (admin && selectedSupplier) {
      fetchCarStats(selectedSupplier)
    } else if (user?._id) {
      fetchCarStats()
    }
  }, [fetchCarStats, admin, selectedSupplier, user?._id])

  // Gérer le changement de voiture
  const handleCarChange = (event: SelectChangeEvent<string>) => {
    setSelectedCar(event.target.value)
  }

  // Gérer le changement de date de début
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date)
    }
  }

  // Gérer le changement de date de fin
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date)
    }
  }

  // Gérer le changement d'agence
  const handleSupplierChange = (event: SelectChangeEvent<string>) => {
    setSelectedSupplier(event.target.value)
    setCars([]) // Réinitialiser la liste des voitures
    setSelectedCar('') // Réinitialiser la sélection de voiture
  }

  // Récupérer l'utilisateur au chargement
  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
    const _isAdmin = helper.admin(_user)
    setAdmin(_isAdmin)
  }
  const statusColors = {
    [bookcarsTypes.BookingStatus.Void]: '#ff6384',
    [bookcarsTypes.BookingStatus.Pending]: '#EF6C00',
    [bookcarsTypes.BookingStatus.Deposit]: '#3CB371',
    [bookcarsTypes.BookingStatus.Paid]: '#77BC23',
    [bookcarsTypes.BookingStatus.Reserved]: '#1E88E5',
    [bookcarsTypes.BookingStatus.Cancelled]: '#E53935'
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && !loading && (
        <Box sx={{ padding: 3 }}>
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle2">Total CA</Typography>
                  <Typography variant="h4">
                    {helper.formatNumber(summary.total)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, backgroundColor: '#e8f5e9' }}>
                  <Typography variant="subtitle2">Payé</Typography>
                  <Typography variant="h4">
                    {helper.formatNumber(summary.paid)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                  <Typography variant="subtitle2">Acompte</Typography>
                  <Typography variant="h4">
                    {helper.formatNumber(summary.deposit)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                  <Typography variant="subtitle2">Réservé</Typography>
                  <Typography variant="h4">
                    {helper.formatNumber(summary.reserved)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
          {/* Filtres */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Typography variant="h1" sx={{ fontSize: '2rem', marginBottom: 3 }} gutterBottom>
              {strings.CAR_STATS}
            </Typography>
            <Grid container spacing={3}>
              {/* Sélecteur d'agence pour l'admin */}
              {admin && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="supplier-select-label">{strings.SELECT_SUPPLIER}</InputLabel>
                    <Select
                      labelId="supplier-select-label"
                      value={selectedSupplier}
                      label={strings.SELECT_SUPPLIER}
                      onChange={handleSupplierChange}
                    >
                      {suppliers.map((supplier) => (
                        <MenuItem key={supplier.supplierId} value={supplier.supplierId}>
                          {supplier.supplierName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} md={admin ? 3 : 4}>
                <FormControl fullWidth>
                  <InputLabel id="car-select-label">{strings.SELECT_CAR}</InputLabel>
                  <Select
                    labelId="car-select-label"
                    value={selectedCar}
                    label={strings.SELECT_CAR}
                    onChange={handleCarChange}
                  >
                    <MenuItem key="0" value={ALL_CARS_VALUE}>
                      <em>{strings.ALL_CARS}</em>
                    </MenuItem>
                    {cars.map((car) => (
                      <MenuItem key={car.id} value={car.id}>
                        {car.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={admin ? 3 : 4}>
                <DateTimePicker
                  label={strings.START_DATE}
                  value={startDate}
                  minDate={subMonths(new Date(), 6)}
                  maxDate={subDays(new Date(), 1)}
                  onChange={handleStartDateChange}
                  showTime={false}
                  language="fr"
                />
              </Grid>
              <Grid item xs={12} md={admin ? 3 : 4}>
                <DateTimePicker
                  label={strings.END_DATE}
                  value={endDate}
                  minDate={subMonths(new Date(), 6)}
                  maxDate={subDays(new Date(), 1)}
                  onChange={handleEndDateChange}
                  showTime={false}
                  language="fr"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Graphiques */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Typography variant="h6" gutterBottom>
              {strings.VIEWS_OVER_TIME}
            </Typography>
            <LineChart
              xAxis={[
                {
                  data: stats.map((stat) => stat.date),
                  scaleType: 'band',
                  label: strings.DATE,
                },
              ]}
              yAxis={[
                {
                  tickMinStep: 1, // Forcer les ticks à être des entiers
                },
              ]}
              series={[
                {
                  data: stats.map((stat) => stat.organiqueViews),
                  label: strings.ORGANIC_VIEWS,
                  color: '#1E88E5',
                  stack: 'total',
                  area: true,
                  showMark: true,
                },
                {
                  data: stats.map((stat) => stat.payedViews),
                  label: strings.PAID_VIEWS,
                  color: '#77BC23',
                  stack: 'total',
                  area: true,
                  showMark: true,
                },
                {
                  data: stats.map((stat) => stat.views),
                  label: strings.TOTAL_VIEWS,
                  color: '#EF6C00',
                  // stack: 'total',
                  area: false,
                  showMark: true,
                },
              ]}
              height={400}
            />
          </Paper>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {strings.STATUS_DISTRIBUTION}
              </Typography>
              <PieChart
                series={[
                    {
                      data: bookingStats.map((item) => ({
                        value: item.count,
                        label: `${helper.getBookingStatus(item.status)} (${item.count})`,
                        color: statusColors[item.status]
                      })),
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      arcLabel: (params) => `${params.label}`,
                    }
                  ]}
                height={env.isMobile() ? 400 : 300}
                legend={env.isMobile() ? { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } } : {}}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} sx={{ paddingTop: 3, marginBottom: 3 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {strings.REVENUE_DISTRIBUTION}
              </Typography>
              <PieChart
                series={[
                    {
                      data: bookingStats.map((item) => ({
                        value: item.totalPrice,
                        label: `${helper.getBookingStatus(item.status)}`,
                        color: statusColors[item.status]
                      })),
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      arcLabel: (params) => `${params.value} DT`,
                    }
                  ]}
                height={env.isMobile() ? 400 : 300}
                legend={env.isMobile() ? { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } } : {}}
              />
            </Paper>
          </Grid>
        </Box>

      )}
      {(!user || loading) && <SimpleBackdrop text={strings.LOADING} />}
    </Layout>
  )
}

export default CarStats
