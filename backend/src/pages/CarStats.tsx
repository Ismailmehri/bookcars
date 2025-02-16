import React, { useEffect, useState, useCallback } from 'react'
import { LineChart } from '@mui/x-charts'
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
import { getCarStats, getUniqueSuppliers } from '@/services/CarStatsService'
import Layout from '@/components/Layout'
import DateTimePicker from '@/components/DateTimePicker'
import * as bookcarsTypes from ':bookcars-types'
import SimpleBackdrop from '@/components/SimpleBackdrop'
import * as helper from '@/common/helper'

const CarStats = () => {
  const ALL_CARS_VALUE = 'ALL_CARS'
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [stats, setStats] = useState<bookcarsTypes.SummedStat[]>([])
  const [cars, setCars] = useState<bookcarsTypes.ICar[]>([])
  const [selectedCar, setSelectedCar] = useState<string>(ALL_CARS_VALUE)
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 6)) // 6 mois avant
  const [endDate, setEndDate] = useState<Date>(subDays(new Date(), 1)) // Hier
  const [loading, setLoading] = useState<boolean>(true)
  const [admin, setAdmin] = useState<boolean>(false)
  const [suppliers, setSuppliers] = useState<bookcarsTypes.SuppliersStat[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')

  // Agréger les vues par date
  const sumViewsByDate = (data: bookcarsTypes.CarStat[]): bookcarsTypes.SummedStat[] => {
    const result: { [key: string]: number } = {}

    data.forEach((item) => {
      const { date, views } = item
      if (result[date]) {
        result[date] += views
      } else {
        result[date] = views
      }
    })

    return Object.keys(result).map((date) => ({
      date,
      views: result[date],
    }))
  }

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
    if (admin) {
      fetchSuppliers()
    }
  }, [admin])

  useEffect(() => {
    if (admin && selectedSupplier) {
      fetchCarStats(selectedSupplier)
    } else if (user?._id) {
      fetchCarStats()
    }
  }, [fetchCarStats, admin, selectedSupplier, user?._id]) // Ajouter fetchCarStats aux dépendances

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

  return (
    <Layout onLoad={onLoad} strict>
      {user && !loading && (
        <Box sx={{ padding: 3 }}>

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
                  data: stats.map((stat) => stat.views),
                  label: strings.VIEWS,
                  area: true,
                },
              ]}
              height={400}
            />
          </Paper>
        </Box>
      )}
      {(!user || loading) && <SimpleBackdrop text={strings.LOADING} />}
    </Layout>
  )
}

export default CarStats
