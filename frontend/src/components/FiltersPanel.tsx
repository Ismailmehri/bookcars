import React from 'react'
import { Alert, Box, Button, CircularProgress, Divider, Paper, Slider, Stack, Typography } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import CarFilter from '@/components/CarFilter'
import SupplierFilter from '@/components/SupplierFilter'
import CarTypeFilter from '@/components/CarTypeFilter'
import GearboxFilter from '@/components/GearboxFilter'
import MileageFilter from '@/components/MileageFilter'
import DepositFilter from '@/components/DepositFilter'
import { strings } from '@/lang/search'

interface FiltersPanelProps {
  pickupLocation?: bookcarsTypes.Location;
  dropOffLocation?: bookcarsTypes.Location;
  from?: Date;
  to?: Date;
  selectedSupplier?: string[];
  suppliers: bookcarsTypes.User[];
  loading: boolean;
  priceRange: number[];
  priceBounds: { min: number; max: number };
  onSubmit: (filter: bookcarsTypes.CarFilter) => void;
  onSupplierChange: (ids: string[]) => void;
  onCarTypeChange: (values: bookcarsTypes.CarType[]) => void;
  onGearboxChange: (values: bookcarsTypes.GearboxType[]) => void;
  onMileageChange: (values: bookcarsTypes.Mileage[]) => void;
  onDepositChange: (value: number) => void;
  onPriceChange: (_event: Event, value: number | number[]) => void;
  onPriceCommit?: (_event: Event, value: number | number[]) => void;
  onReset: () => void;
  collapseFilters?: boolean;
  versionKey?: number;
}

const FiltersPanel = ({
  pickupLocation,
  dropOffLocation,
  from,
  to,
  selectedSupplier,
  suppliers,
  loading,
  priceRange,
  priceBounds,
  onSubmit,
  onSupplierChange,
  onCarTypeChange,
  onGearboxChange,
  onMileageChange,
  onDepositChange,
  onPriceChange,
  onPriceCommit,
  onReset,
  collapseFilters,
  versionKey,
}: FiltersPanelProps) => {
  if (!pickupLocation || !dropOffLocation || !from || !to) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={32} aria-label={strings.FILTERS_LOADING} />
      </Paper>
    )
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, boxShadow: 1, backgroundColor: 'common.white' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
            {strings.FILTERS_TITLE}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {strings.FILTERS_DESCRIPTION}
          </Typography>
        </Box>
        <CarFilter
          key={`car-filter-${versionKey}`}
          className="filter"
          pickupLocation={pickupLocation}
          dropOffLocation={dropOffLocation}
          from={from}
          to={to}
          suppliers={selectedSupplier}
          accordion={collapseFilters}
          collapse={collapseFilters}
          onSubmit={onSubmit}
        />
        {loading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={28} aria-label={strings.FILTERS_LOADING} />
          </Box>
        ) : suppliers.length === 0 ? (
          <Alert severity="info">{strings.SUPPLIERS_EMPTY}</Alert>
        ) : (
          <SupplierFilter key={`supplier-filter-${versionKey}`} className="filter" suppliers={suppliers} onChange={onSupplierChange} />
        )}
        <Divider />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {strings.PRICE_FILTER_TITLE}
          </Typography>
          <Slider
            aria-label={strings.PRICE_FILTER_TITLE}
            value={priceRange}
            onChange={onPriceChange}
            onChangeCommitted={(event, value) => onPriceCommit?.(event, value)}
            getAriaValueText={(value) => `${value}DT`}
            valueLabelFormat={(value) => `${value}DT`}
            step={10}
            min={priceBounds.min}
            max={priceBounds.max}
            marks={[{ value: priceBounds.min, label: `${priceBounds.min}DT` }, { value: priceBounds.max, label: `${priceBounds.max}DT` }]}
            valueLabelDisplay="on"
          />
        </Box>
        <Divider />
        <CarTypeFilter key={`car-type-${versionKey}`} className="filter" onChange={onCarTypeChange} collapse={collapseFilters} />
        <GearboxFilter key={`gearbox-${versionKey}`} className="filter" onChange={onGearboxChange} />
        <MileageFilter key={`mileage-${versionKey}`} className="filter" onChange={onMileageChange} />
        <DepositFilter key={`deposit-${versionKey}`} className="filter" onChange={onDepositChange} />
        <Button variant="outlined" color="primary" onClick={onReset} fullWidth>
          {strings.RESET_FILTERS}
        </Button>
      </Stack>
    </Paper>
  )
}

export default FiltersPanel
