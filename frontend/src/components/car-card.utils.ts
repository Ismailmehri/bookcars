export interface AvailabilityDisplay {
  label: string
  tooltip: string
  color: 'success' | 'default'
}

export interface AvailabilityLabels {
  available: string
  availableTooltip: string
  unavailable: string
  unavailableTooltip: string
}

export const transformScore = (score?: number): number => {
  if (!score || score < 0 || score > 100) {
    return 0
  }

  const transformedScore = (score / 100) * 5
  return Math.round(transformedScore * 10) / 10
}

export const getAvailabilityDisplay = (
  available: boolean,
  labels: AvailabilityLabels,
): AvailabilityDisplay => (
  available
    ? {
      label: labels.available,
      tooltip: labels.availableTooltip,
      color: 'success',
    }
    : {
      label: labels.unavailable,
      tooltip: labels.unavailableTooltip,
      color: 'default',
    }
)
