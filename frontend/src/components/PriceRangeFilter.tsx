import React from 'react'
import { Slider } from '@mui/material'

import '@/assets/css/price-range-filter.css'

interface PriceRangeFilterProps {
  value: number[]
  min: number
  max: number
  marks: { value: number; label: string }[]
  onChange: (value: number[]) => void
  onChangeCommitted?: (value: number[]) => void
}

const PriceRangeFilter = ({ value, min, max, marks, onChange, onChangeCommitted }: PriceRangeFilterProps) => (
  <section className="price-range" aria-label="Filtre de prix par jour">
    <div className="price-range__header">
      <p className="price-range__title">Filtrer par prix par jour</p>
      <span className="price-range__value" aria-live="polite">{`${value[0]}DT — ${value[1]}DT`}</span>
    </div>
    <Slider
      getAriaLabel={() => 'Prix par jour'}
      value={value}
      onChange={(_event, newValue) => onChange(newValue as number[])}
      onChangeCommitted={(_event, newValue) => onChangeCommitted?.(newValue as number[])}
      getAriaValueText={(val) => `${val}DT`}
      valueLabelFormat={(val) => `${val}DT`}
      step={10}
      min={min}
      max={max}
      marks={marks}
      valueLabelDisplay="on"
      className="price-range__slider"
    />
  </section>
)

export default PriceRangeFilter
