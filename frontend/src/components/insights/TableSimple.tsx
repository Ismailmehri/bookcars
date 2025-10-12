import React from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress
} from '@mui/material'

import { type DataStatus } from '@/types/insights'
import { strings as insightsStrings } from '@/lang/insights'

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  align?: 'left' | 'right' | 'center'
  render?: (row: T) => React.ReactNode
  minWidth?: number
}

interface TableSimpleProps<T> {
  title: string
  columns: TableColumn<T>[]
  data: T[]
  status: DataStatus
  emptyMessage?: string
  ariaLabel?: string
  getRowKey: (row: T, index: number) => string
}

const renderStatus = (status: DataStatus, emptyMessage?: string) => {
  if (status === 'loading' || status === 'idle') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" py={4} aria-live="polite">
        <CircularProgress size={24} color="primary" />
        <Typography variant="body2" ml={1} color="text.secondary">
          {insightsStrings.STATUS_LOADING}
        </Typography>
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" py={4} aria-live="assertive">
        <Typography variant="body2" color="error">
          {insightsStrings.STATUS_ERROR}
        </Typography>
      </Box>
    )
  }

  if (status === 'empty') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" py={4} aria-live="polite">
        <Typography variant="body2" color="text.secondary">
          {emptyMessage ?? insightsStrings.STATUS_EMPTY}
        </Typography>
      </Box>
    )
  }

  return null
}

const TableSimple = <T, >({ title, columns, data, status, emptyMessage, ariaLabel, getRowKey }: TableSimpleProps<T>) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      border: '1px solid rgba(30, 136, 229, 0.12)',
      overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}
  >
    <Box px={3} py={2} borderBottom="1px solid rgba(30, 136, 229, 0.12)" bgcolor="rgba(30, 136, 229, 0.04)">
      <Typography variant="subtitle1" fontWeight={600} color="#1E2A45">
        {title}
      </Typography>
    </Box>
    {status !== 'success' ? (
      renderStatus(status, emptyMessage)
    ) : (
      <TableContainer sx={{ maxHeight: 360 }}>
        <Table stickyHeader aria-label={ariaLabel ?? title} size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key as string}
                  align={column.align ?? 'left'}
                  sx={{
                    fontWeight: 600,
                    color: '#1E2A45',
                    backgroundColor: 'rgba(30, 136, 229, 0.06)',
                    minWidth: column.minWidth,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const rowKey = getRowKey(row, index)
              return (
                <TableRow key={rowKey} hover>
                  {columns.map((column) => {
                    const rawValue = (row as Record<string, React.ReactNode | undefined>)[column.key as string]
                    const value = column.render ? column.render(row) : rawValue ?? '—'
                    return (
                      <TableCell
                        key={`${rowKey}-${column.key as string}`}
                        align={column.align ?? 'left'}
                        sx={{ color: '#1E2A45', fontSize: 13 }}
                      >
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Paper>
)

export default TableSimple
