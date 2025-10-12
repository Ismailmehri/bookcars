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
} from '@mui/material'

export interface TableColumn<T> {
  key: keyof T
  label: string
  align?: 'left' | 'right' | 'center'
  render?: (row: T, index: number) => React.ReactNode
}

interface TableSimpleProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  emptyLabel: string
}

const TableSimple = <T extends Record<string, unknown>>({ columns, data, emptyLabel }: TableSimpleProps<T>) => (
  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
    <Table size="small">
      <TableHead sx={{ backgroundColor: '#F5F7FB' }}>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={String(column.key)} align={column.align ?? 'left'} sx={{ fontWeight: 600 }}>
              {column.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length}>
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                {emptyLabel}
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={String(column.key)} align={column.align ?? 'left'}>
                  {column.render ? column.render(row, index) : (row[column.key] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
)

export default TableSimple
