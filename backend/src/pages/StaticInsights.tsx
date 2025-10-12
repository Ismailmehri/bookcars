import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import ApartmentIcon from '@mui/icons-material/Apartment'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import StarIcon from '@mui/icons-material/Star'
import SpeedIcon from '@mui/icons-material/Speed'
import PercentIcon from '@mui/icons-material/Percent'
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import GroupsIcon from '@mui/icons-material/Groups'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import TimelineIcon from '@mui/icons-material/Timeline'
import AutoGraphIcon from '@mui/icons-material/AutoGraph'
import ShieldIcon from '@mui/icons-material/Shield'
import CategoryIcon from '@mui/icons-material/Category'
import InsightsIcon from '@mui/icons-material/Insights'
import { BarChart, LineChart, PieChart } from '@mui/x-charts'
import Layout from '@/components/Layout'
import SimpleBackdrop from '@/components/SimpleBackdrop'
import * as bookcarsTypes from ':bookcars-types'
import * as helper from '@/common/helper'
import { strings as statsStrings } from '@/lang/stats'

const PLANY_COLORS = {
  blue: '#1E88E5',
  orange: '#FF7A00',
  green: '#2EAD66',
  red: '#E53935',
  gray: '#94A3B8',
  yellow: '#F59E0B',
  purple: '#7C3AED',
}

type AdminKpi = {
  label: string
  value: string | number
  icon: React.ReactNode
  trend: number
}

type AgencyKpi = {
  label: string
  value: string | number
  icon: React.ReactNode
  trend: number
}

type AdminViewDatum = {
  date: string
  organique: number
  paid: number
  total: number
}

type BookingStatusDatum = {
  name: string
  value: number
  color: string
}

type AvgPriceDatum = {
  categorie: string
  jour: number
  mois: number
}

type RankingRow = {
  rank: number
  agence: string
  score: number
  bookings: number
  cars: number
  revenue: number
  acceptance: number
  cancel: number
  pending: number
  lastAct: string
}

type WatchlistRow = {
  agence: string
  reason: string
  metric: string
  since: string
}

type FunnelDatum = {
  stage: string
  value: number
}

type QualityTrendDatum = {
  date: string
  accept: number
  cancel: number
}

type OccupancyDatum = {
  date: string
  occ: number
}

type OpsDisciplineRow = {
  agence: string
  updateDelayH: number
  lateClosure: string
  responseMin: number
  profile: string
}

type PricingIndexRow = {
  agence: string
  index: number
  dispersion: number
  daysWithPrices: number
}

type RiskRow = {
  agence: string
  flag: string
  level: string
}

type TopModelGlobalRow = {
  model: string
  bookings: number
  agence: string
}

type AgencyPriceDatum = {
  categorie: string
  jour: number
  mois: number
}

type AgencyTopModelRow = {
  model: string
  bookings: number
}

type PendingUpdateRow = {
  car: string
  end: string
  status: string
  overdue: number
}

export type DataState = 'loading' | 'empty' | 'error' | 'ready'

export type SectionKey =
  | 'adminViews'
  | 'adminStatus'
  | 'adminFunnel'
  | 'adminQuality'
  | 'adminOccupancy'
  | 'adminPrices'
  | 'adminRanking'
  | 'adminWatchlist'
  | 'adminDiscipline'
  | 'adminRisk'
  | 'adminPricing'
  | 'adminTopModels'
  | 'agencyViews'
  | 'agencyStatus'
  | 'agencyPrices'
  | 'agencyTopModels'
  | 'agencyPending'

export type SectionStates = Partial<Record<SectionKey, DataState>>

const adminKpis: AdminKpi[] = [
  { label: 'Agences actives', value: 42, icon: <ApartmentIcon sx={{ color: 'text.secondary' }} />, trend: 6 },
  { label: 'Total voitures', value: 812, icon: <DirectionsCarIcon sx={{ color: 'text.secondary' }} />, trend: 18 },
  { label: 'CA (30j)', value: '1 240 000 DT', icon: <AttachMoneyIcon sx={{ color: 'text.secondary' }} />, trend: 12 },
  { label: 'Score moyen', value: 78, icon: <StarIcon sx={{ color: 'text.secondary' }} />, trend: 2 },
  { label: 'CA / voiture', value: '1 527 DT', icon: <SpeedIcon sx={{ color: 'text.secondary' }} />, trend: 7 },
  { label: "Taux d'occupation", value: '68%', icon: <PercentIcon sx={{ color: 'text.secondary' }} />, trend: 5 },
  { label: 'Délai médian réponse', value: '23 min', icon: <QueryBuilderIcon sx={{ color: 'text.secondary' }} />, trend: -12 },
  { label: 'Maj. à l\'heure', value: '88%', icon: <AccessTimeIcon sx={{ color: 'text.secondary' }} />, trend: 9 },
]

const adminViews: AdminViewDatum[] = [
  { date: '2025-09-10', organique: 820, paid: 120, total: 940 },
  { date: '2025-09-17', organique: 910, paid: 210, total: 1120 },
  { date: '2025-09-24', organique: 1020, paid: 260, total: 1280 },
  { date: '2025-10-01', organique: 980, paid: 340, total: 1320 },
  { date: '2025-10-08', organique: 1200, paid: 300, total: 1500 },
]

const adminBookingStatus: BookingStatusDatum[] = [
  { name: 'Payées', value: 520, color: PLANY_COLORS.green },
  { name: 'Acompte', value: 140, color: PLANY_COLORS.orange },
  { name: 'Réservées', value: 260, color: PLANY_COLORS.blue },
  { name: 'Annulées', value: 90, color: PLANY_COLORS.red },
]

const adminAvgPrices: AvgPriceDatum[] = [
  { categorie: 'Mini', jour: 80, mois: 1800 },
  { categorie: 'Midi', jour: 110, mois: 2400 },
  { categorie: 'Maxi', jour: 180, mois: 3900 },
  { categorie: 'Scooter', jour: 55, mois: 1200 },
]

const adminRanking: RankingRow[] = [
  { rank: 1, agence: 'YO RENT A CAR', score: 92, bookings: 410, cars: 86, revenue: 240000, acceptance: 96, cancel: 3, pending: 0, lastAct: '2025-10-11' },
  { rank: 2, agence: 'Kmayra Rent a Car', score: 88, bookings: 320, cars: 58, revenue: 190000, acceptance: 92, cancel: 5, pending: 1, lastAct: '2025-10-10' },
  { rank: 3, agence: 'BenOthmanCarRental', score: 83, bookings: 295, cars: 61, revenue: 172000, acceptance: 90, cancel: 7, pending: 3, lastAct: '2025-10-09' },
  { rank: 4, agence: 'Afif Auto Tourisme', score: 79, bookings: 210, cars: 44, revenue: 128000, acceptance: 86, cancel: 10, pending: 5, lastAct: '2025-10-06' },
  { rank: 5, agence: 'Vroom Vroom', score: 72, bookings: 150, cars: 37, revenue: 99000, acceptance: 81, cancel: 12, pending: 8, lastAct: '2025-10-02' },
]

const watchlist: WatchlistRow[] = [
  { agence: 'Jina Rent a Car', reason: 'Taux d’annulation élevé', metric: '18%', since: '14 j' },
  { agence: 'Anis Car', reason: 'Aucune connexion', metric: '10 j', since: '10 j' },
  { agence: 'SN Rent a Car', reason: 'Mises à jour en retard', metric: '12 réservations', since: '21 j' },
]

const topModelsGlobal: TopModelGlobalRow[] = [
  { model: 'Kia Picanto', bookings: 540, agence: 'Multi' },
  { model: 'Hyundai i10', bookings: 490, agence: 'Multi' },
  { model: 'Dacia Sandero', bookings: 320, agence: 'Multi' },
  { model: 'Peugeot 208', bookings: 210, agence: 'Multi' },
]

const adminFunnel: FunnelDatum[] = [
  { stage: 'Vues', value: 15000 },
  { stage: 'Clics', value: 4200 },
  { stage: 'Leads', value: 1300 },
  { stage: 'Réservations', value: 1010 },
  { stage: 'Payées', value: 660 },
]

const adminQualityTrend: QualityTrendDatum[] = [
  { date: '2025-09-10', accept: 89, cancel: 7 },
  { date: '2025-09-17', accept: 91, cancel: 6 },
  { date: '2025-09-24', accept: 92, cancel: 5 },
  { date: '2025-10-01', accept: 93, cancel: 4 },
  { date: '2025-10-08', accept: 94, cancel: 3 },
]

const adminOccupancy: OccupancyDatum[] = [
  { date: '2025-09-10', occ: 59 },
  { date: '2025-09-17', occ: 61 },
  { date: '2025-09-24', occ: 64 },
  { date: '2025-10-01', occ: 66 },
  { date: '2025-10-08', occ: 68 },
]

const adminOpsDiscipline: OpsDisciplineRow[] = [
  { agence: 'YO RENT A CAR', updateDelayH: 3.2, lateClosure: '2%', responseMin: 12, profile: '100%' },
  { agence: 'Kmayra Rent a Car', updateDelayH: 7.8, lateClosure: '6%', responseMin: 26, profile: '96%' },
  { agence: 'BenOthmanCarRental', updateDelayH: 9.1, lateClosure: '8%', responseMin: 33, profile: '88%' },
]

const adminPricingIndex: PricingIndexRow[] = [
  { agence: 'YO RENT A CAR', index: 0.97, dispersion: 8, daysWithPrices: 98 },
  { agence: 'Kmayra Rent a Car', index: 1.04, dispersion: 12, daysWithPrices: 91 },
  { agence: 'BenOthmanCarRental', index: 1.12, dispersion: 18, daysWithPrices: 86 },
]

const adminRisk: RiskRow[] = [
  { agence: 'Vroom Vroom', flag: 'Photos < 4 / véhicule', level: 'Moyen' },
  { agence: 'Afif Auto Tourisme', flag: 'Prix mensuel manquant', level: 'Faible' },
  { agence: 'SN Rent a Car', flag: 'Doublons détectés', level: 'Élevé' },
]

const agencyName = 'YO RENT A CAR'

const agencyKpis: AgencyKpi[] = [
  { label: 'Réservations (30j)', value: 410, icon: <GroupsIcon sx={{ color: 'text.secondary' }} />, trend: 9 },
  { label: 'Chiffre d’affaires', value: '240 000 DT', icon: <AttachMoneyIcon sx={{ color: 'text.secondary' }} />, trend: 14 },
  { label: 'Taux d’acceptation', value: '96%', icon: <EmojiEventsIcon sx={{ color: 'text.secondary' }} />, trend: 3 },
  { label: 'Taux d’annulation', value: '3%', icon: <WarningAmberIcon sx={{ color: 'text.secondary' }} />, trend: -1 },
]

const agencyViews: AdminViewDatum[] = adminViews

const agencyPrices: AgencyPriceDatum[] = [
  { categorie: 'Mini', jour: 82, mois: 1850 },
  { categorie: 'Midi', jour: 115, mois: 2480 },
  { categorie: 'Maxi', jour: 175, mois: 3820 },
]

const agencyTopModels: AgencyTopModelRow[] = [
  { model: 'Kia Picanto Smart', bookings: 210 },
  { model: 'Hyundai Grand i10', bookings: 160 },
  { model: 'Dacia Sandero', bookings: 70 },
]

const pendingUpdates: PendingUpdateRow[] = [
  { car: 'Kia Picanto – Res#7841', end: '2025-10-08', status: 'Reserved', overdue: 3 },
  { car: 'Hyundai i10 – Res#7803', end: '2025-10-04', status: 'Deposit', overdue: 7 },
]

interface DataSectionProps {
  state: DataState
  minHeight?: number
  loadingText?: string
  emptyText?: string
  errorText?: string
  children: React.ReactNode
}

export const DataSection = ({
  state,
  minHeight = 240,
  loadingText = 'Chargement en cours…',
  emptyText = 'Aucune donnée disponible.',
  errorText = 'Une erreur est survenue lors du chargement.',
  children,
}: DataSectionProps) => {
  if (state === 'loading') {
    return (
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress size={24} aria-label={loadingText} />
        <Typography variant="body2" color="text.secondary">
          {loadingText}
        </Typography>
      </Stack>
    )
  }

  if (state === 'empty') {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight }}
        aria-live="polite"
      >
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      </Stack>
    )
  }

  if (state === 'error') {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight }}
        aria-live="assertive"
      >
        <Typography variant="body2" color="error">
          {errorText}
        </Typography>
      </Stack>
    )
  }

  return <Box sx={{ minHeight }}>{children}</Box>
}

const TrendChip = ({ value }: { value: number }) => {
  const positive = value >= 0
  const icon = positive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />
  const label = `${positive ? '+' : ''}${value}%`

  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      color={positive ? 'success' : 'error'}
      variant={positive ? 'outlined' : 'filled'}
      sx={{ fontWeight: 500 }}
      aria-label={`Tendance ${positive ? 'en hausse' : 'en baisse'} de ${Math.abs(value)}%`}
    />
  )
}

interface KpiCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: number
}

const KpiCard = ({ label, value, icon, trend }: KpiCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" mt={1} fontWeight={600}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
      </Stack>
      {typeof trend === 'number' && (
        <Box mt={2}>
          <TrendChip value={trend} />
        </Box>
      )}
    </CardContent>
  </Card>
)

interface StaticTableProps {
  columns: string[]
  rows: React.ReactNode[][]
  caption?: string
}

const StaticTable = ({ columns, rows, caption }: StaticTableProps) => (
  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
    <Table size="small" aria-label={caption}>
      {caption && <caption>{caption}</caption>}
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column} sx={{ fontWeight: 600 }}>
              {column}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <TableCell key={`cell-${rowIndex}-${cellIndex}`}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value)

const stateFor = (key: SectionKey, states?: SectionStates): DataState => states?.[key] ?? 'ready'

interface AdminViewProps {
  states?: SectionStates
}

const AdminView = ({ states }: AdminViewProps) => {
  const [selectedAgency, setSelectedAgency] = useState<string>('all')

  const handleAgencyChange = (event: SelectChangeEvent<string>) => {
    setSelectedAgency(event.target.value)
  }

  const rankingRows = useMemo(
    () =>
      adminRanking.map((row) => [
        row.rank,
        row.agence,
        row.score,
        row.bookings,
        row.cars,
        `${formatNumber(row.revenue)} DT`,
        `${row.acceptance}%`,
        `${row.cancel}%`,
        row.pending,
        row.lastAct,
      ]),
    [],
  )

  const disciplineRows = useMemo(
    () =>
      adminOpsDiscipline.map((row) => [
        row.agence,
        row.updateDelayH,
        row.lateClosure,
        row.responseMin,
        row.profile,
      ]),
    [],
  )

  const pricingRows = useMemo(
    () =>
      adminPricingIndex.map((row) => [
        row.agence,
        row.index.toFixed(2),
        `${row.dispersion}%`,
        `${row.daysWithPrices}%`,
      ]),
    [],
  )

  const riskRows = useMemo(
    () => adminRisk.map((row) => [row.agence, row.flag, row.level]),
    [],
  )

  const topModelRows = useMemo(
    () => topModelsGlobal.map((row) => [row.model, row.bookings, row.agence]),
    [],
  )

  return (
    <Stack spacing={3}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Vue Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aperçu global des performances Plany (démo statique)
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Du"
              type="date"
              size="small"
              defaultValue="2025-09-10"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Au"
              type="date"
              size="small"
              defaultValue="2025-10-10"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="admin-agency-select">Agence</InputLabel>
            <Select
              labelId="admin-agency-select"
              label="Agence"
              value={selectedAgency}
              onChange={handleAgencyChange}
            >
              <MenuItem value="all">Toutes</MenuItem>
              {adminRanking.map((row) => (
                <MenuItem key={row.agence} value={row.agence}>
                  {row.agence}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary">
            Appliquer
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {adminKpis.map((kpi) => (
          <Grid key={kpi.label} item xs={12} sm={6} md={3} lg={3} xl={3}>
            <KpiCard label={kpi.label} value={kpi.value} icon={kpi.icon} trend={kpi.trend} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><TimelineIcon fontSize="small" /> <span>Vues sur la période</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('adminViews', states)} minHeight={320}>
                <LineChart
                  height={320}
                  dataset={adminViews}
                  xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
                  series={[
                    { dataKey: 'organique', label: 'Vues organiques', color: PLANY_COLORS.blue, area: true },
                    { dataKey: 'paid', label: 'Vues payées', color: PLANY_COLORS.green, area: true },
                    { dataKey: 'total', label: 'Total vues', color: PLANY_COLORS.orange },
                  ]}
                  margin={{ top: 16, right: 16, left: 8 }}
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><DonutSmallIcon fontSize="small" /> <span>Répartition des statuts</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('adminStatus', states)} minHeight={320}>
                <PieChart
                  height={320}
                  series={[
                    {
                      data: adminBookingStatus.map((item) => ({ id: item.name, value: item.value, label: item.name, color: item.color })),
                      innerRadius: 40,
                    },
                  ]}
                  margin={{ top: 16, bottom: 16 }}
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><InsightsIcon fontSize="small" /> <span>Funnel de conversion</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('adminFunnel', states)} minHeight={300}>
                <BarChart
                  height={300}
                  dataset={adminFunnel}
                  yAxis={[{ scaleType: 'band', dataKey: 'stage' }]}
                  series={[{ dataKey: 'value', label: 'Volume', color: PLANY_COLORS.purple }]}
                  layout="horizontal"
                  margin={{ left: 80 }}
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><EmojiEventsIcon fontSize="small" /> <span>Acceptation vs Annulation</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('adminQuality', states)} minHeight={300}>
                <LineChart
                  height={300}
                  dataset={adminQualityTrend}
                  xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
                  series={[
                    { dataKey: 'accept', label: 'Acceptation (%)', color: PLANY_COLORS.green },
                    { dataKey: 'cancel', label: 'Annulation (%)', color: PLANY_COLORS.red },
                  ]}
                  margin={{ top: 16, right: 16, left: 8 }}
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><PercentIcon fontSize="small" /> <span>Taux d'occupation</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('adminOccupancy', states)} minHeight={300}>
                <LineChart
                  height={300}
                  dataset={adminOccupancy}
                  xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
                  series={[{ dataKey: 'occ', label: 'Occupation (%)', color: PLANY_COLORS.orange }]}
                  margin={{ top: 16, right: 16, left: 8 }}
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><AutoGraphIcon fontSize="small" /> <span>Prix moyens par catégorie</span></Stack>} />
        <CardContent>
          <DataSection state={stateFor('adminPrices', states)} minHeight={320}>
            <BarChart
              height={320}
              dataset={adminAvgPrices}
              xAxis={[{ scaleType: 'band', dataKey: 'categorie' }]}
              series={[
                { dataKey: 'jour', label: 'Prix moyen / jour (DT)', color: PLANY_COLORS.blue },
                { dataKey: 'mois', label: 'Prix moyen / mois (DT)', color: PLANY_COLORS.orange },
              ]}
              margin={{ top: 16, right: 16, left: 16 }}
            />
          </DataSection>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} xl={8}>
          <Card>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><EmojiEventsIcon fontSize="small" /> <span>Classement des agences</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('adminRanking', states)}>
                <StaticTable
                  columns={[
                    '#',
                    'Agence',
                    'Score',
                    'Réservations',
                    'Voitures',
                    'CA (DT)',
                    'Accept.',
                    'Annul.',
                    'Retards',
                    'Dernière activité',
                  ]}
                  rows={rankingRows}
                  caption="Classement des agences"
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><WarningAmberIcon fontSize="small" /> <span>Watchlist</span></Stack>} />
            <CardContent>
              <DataSection
                state={stateFor('adminWatchlist', states)}
                minHeight={200}
                emptyText="Aucune agence à surveiller."
              >
                <Stack spacing={2}>
                  {watchlist.map((entry) => (
                    <Paper key={entry.agence} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          {entry.agence}
                        </Typography>
                        <Chip size="small" label={entry.since} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {entry.reason}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Indicateur : {entry.metric}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} xl={8}>
          <Card>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><AccessTimeIcon fontSize="small" /> <span>Discipline opérationnelle</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('adminDiscipline', states)}>
                <StaticTable
                  columns={['Agence', 'Délai maj (h)', '% retards clôture', 'Réponse médiane (min)', 'Profil complété']}
                  rows={disciplineRows}
                  caption="Discipline opérationnelle"
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} xl={4}>
          <Card>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><ShieldIcon fontSize="small" /> <span>Hygiène & Risques</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('adminRisk', states)} minHeight={220} emptyText="Aucun risque détecté.">
                <StaticTable columns={['Agence', 'Signal', 'Niveau']} rows={riskRows} caption="Hygiène & Risques" />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><CategoryIcon fontSize="small" /> <span>Indice de compétitivité prix</span></Stack>} />
        <CardContent>
          <DataSection state={stateFor('adminPricing', states)}>
            <StaticTable
              columns={["Agence", "Indice prix (≤1=Comp.)", 'Dispersion (%)', '% jours avec prix']}
              rows={pricingRows}
              caption="Indice de compétitivité prix"
            />
          </DataSection>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><DirectionsCarIcon fontSize="small" /> <span>Modèles les plus loués (global)</span></Stack>} />
        <CardContent>
          <DataSection state={stateFor('adminTopModels', states)}>
            <StaticTable
              columns={['Modèle', 'Réservations', 'Agences']}
              rows={topModelRows}
              caption="Modèles les plus loués (global)"
            />
          </DataSection>
        </CardContent>
      </Card>
    </Stack>
  )
}

interface AgencyViewProps {
  states?: SectionStates
}

const AgencyView = ({ states }: AgencyViewProps) => {
  const topModelRows = useMemo(
    () => agencyTopModels.map((row) => [row.model, row.bookings]),
    [],
  )

  const pendingRows = useMemo(
    () => pendingUpdates.map((row) => [row.car, row.end, row.status, row.overdue]),
    [],
  )

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          Vue Agence
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {agencyName} — tableau de bord (démo statique)
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {agencyKpis.map((kpi) => (
          <Grid key={kpi.label} item xs={12} sm={6} md={3}>
            <KpiCard label={kpi.label} value={kpi.value} icon={kpi.icon} trend={kpi.trend} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><TimelineIcon fontSize="small" /> <span>Vues sur la période</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('agencyViews', states)} minHeight={320}>
                <LineChart
                  height={320}
                  dataset={agencyViews}
                  xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
                  series={[
                    { dataKey: 'organique', label: 'Vues organiques', color: PLANY_COLORS.blue, area: true },
                    { dataKey: 'paid', label: 'Vues payées', color: PLANY_COLORS.green, area: true },
                    { dataKey: 'total', label: 'Total vues', color: PLANY_COLORS.orange },
                  ]}
                  margin={{ top: 16, right: 16, left: 8 }}
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><StarIcon fontSize="small" /> <span>Qualité & Statuts</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('agencyStatus', states)} minHeight={320}>
                <PieChart
                  height={320}
                  series={[
                    {
                      data: adminBookingStatus.map((item) => ({ id: item.name, value: item.value, label: item.name, color: item.color })),
                      innerRadius: 40,
                    },
                  ]}
                  margin={{ top: 16, bottom: 16 }}
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><AutoGraphIcon fontSize="small" /> <span>Prix moyens par catégorie (agence)</span></Stack>} />
        <CardContent>
          <DataSection state={stateFor('agencyPrices', states)} minHeight={320}>
            <BarChart
              height={320}
              dataset={agencyPrices}
              xAxis={[{ scaleType: 'band', dataKey: 'categorie' }]}
              series={[
                { dataKey: 'jour', label: 'Prix moyen / jour (DT)', color: PLANY_COLORS.blue },
                { dataKey: 'mois', label: 'Prix moyen / mois (DT)', color: PLANY_COLORS.orange },
              ]}
              margin={{ top: 16, right: 16, left: 16 }}
            />
          </DataSection>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><DirectionsCarIcon fontSize="small" /> <span>Modèles les plus loués (agence)</span></Stack>} />
            <CardContent>
              <DataSection state={stateFor('agencyTopModels', states)}>
                <StaticTable
                  columns={['Modèle', 'Réservations']}
                  rows={topModelRows}
                  caption="Modèles les plus loués (agence)"
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={<Stack direction="row" alignItems="center" spacing={1}><WarningAmberIcon fontSize="small" /> <span>Mises à jour en retard</span></Stack>} />
            <CardContent>
              <DataSection
                state={stateFor('agencyPending', states)}
                minHeight={200}
                emptyText="Aucune mise à jour en retard."
              >
                <StaticTable
                  columns={['Réservation', 'Fin', 'Statut', 'Retard (j)']}
                  rows={pendingRows}
                  caption="Mises à jour en retard"
                />
              </DataSection>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}

interface StaticInsightsContentProps {
  defaultTab: 'admin' | 'agency'
  sectionStates?: SectionStates
}

export const StaticInsightsContent = ({ defaultTab, sectionStates }: StaticInsightsContentProps) => {
  const [tab, setTab] = useState<'admin' | 'agency'>(defaultTab)

  useEffect(() => {
    setTab(defaultTab)
  }, [defaultTab])

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 6 }, pb: 6 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Plany — Tableau de bord Statistiques
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Refonte IHM au style SaaS (démo statique). Remplacez les données par vos APIs plus tard.
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Vue du tableau de bord">
        <Tab label="Admin" value="admin" />
        <Tab label="Agence" value="agency" />
      </Tabs>
      <Divider sx={{ my: 3 }} />

      {tab === 'admin' ? <AdminView states={sectionStates} /> : <AgencyView states={sectionStates} />}
    </Box>
  )
}

const StaticInsights = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [loading, setLoading] = useState<boolean>(true)
  const [defaultTab, setDefaultTab] = useState<'admin' | 'agency'>('admin')

  const onLoad = (loadedUser?: bookcarsTypes.User) => {
    setUser(loadedUser)
    const isAdmin = helper.admin(loadedUser)
    setDefaultTab(isAdmin ? 'admin' : 'agency')
    setLoading(false)
  }

  return (
    <Layout onLoad={onLoad} strict>
      {loading || !user ? (
        <SimpleBackdrop text={statsStrings.LOADING} />
      ) : (
        <StaticInsightsContent defaultTab={defaultTab} />
      )}
    </Layout>
  )
}

export default StaticInsights
