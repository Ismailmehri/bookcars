import React from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import { ViewList as ViewListIcon, Map as MapIcon } from '@mui/icons-material'
import { strings } from '@/lang/search'
import type { CarSortOption } from '@/common/carSorting'

export type ViewMode = 'list' | 'map'

interface ResultsToolbarProps {
  sortBy: CarSortOption;
  onSortChange: (value: CarSortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  totalResults: number;
  disableMap?: boolean;
}

const ResultsToolbar = ({ sortBy, onSortChange, viewMode, onViewModeChange, totalResults, disableMap }: ResultsToolbarProps) => {
  const handleSortChange = (event: SelectChangeEvent<CarSortOption>) => {
    onSortChange(event.target.value as CarSortOption)
  }

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, nextView: ViewMode | null) => {
    if (nextView) {
      onViewModeChange(nextView)
    }
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        backgroundColor: 'common.white',
        boxShadow: 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {strings.RESULTS_COUNT.replace('{count}', new Intl.NumberFormat().format(totalResults))}
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="search-sort-label">{strings.SORT_LABEL}</InputLabel>
            <Select
              labelId="search-sort-label"
              value={sortBy}
              label={strings.SORT_LABEL}
              onChange={handleSortChange}
            >
              <MenuItem value="priceAsc">{strings.SORT_PRICE_ASC}</MenuItem>
              <MenuItem value="priceDesc">{strings.SORT_PRICE_DESC}</MenuItem>
              <MenuItem value="rating">{strings.SORT_RATING}</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            color="primary"
            size="small"
            aria-label={strings.VIEW_LABEL}
          >
            <ToggleButton value="list" aria-label={strings.VIEW_LIST}>
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="map" aria-label={strings.VIEW_MAP} disabled={disableMap}>
              <MapIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
    </Box>
  )
}

export default ResultsToolbar
