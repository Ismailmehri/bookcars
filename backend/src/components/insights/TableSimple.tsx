import React, { useEffect, useMemo, useState } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import { clampPage, paginateRows } from './tableSimple.utils'

export interface TableColumn<T> {
  key: keyof T
  label: string
  align?: 'left' | 'right' | 'center'
  render?: (row: T, index: number) => React.ReactNode
}

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [5, 10, 25]

interface TableSimpleProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  emptyLabel: string
  rowsPerPageOptions?: number[]
  initialRowsPerPage?: number
}

const TableSimple = <T extends Record<string, unknown>>({
  columns,
  data,
  emptyLabel,
  rowsPerPageOptions,
  initialRowsPerPage,
}: TableSimpleProps<T>) => {
  const options = rowsPerPageOptions && rowsPerPageOptions.length > 0 ? rowsPerPageOptions : DEFAULT_ROWS_PER_PAGE_OPTIONS
  const initialRows = initialRowsPerPage && initialRowsPerPage > 0 ? initialRowsPerPage : options[0]

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRows)

  const clampedPage = useMemo(() => clampPage(page, rowsPerPage, data.length), [data.length, page, rowsPerPage])

  useEffect(() => {
    if (clampedPage !== page) {
      setPage(clampedPage)
    }
  }, [clampedPage, page])

  const visibleRows = useMemo(() => paginateRows(data, clampedPage, rowsPerPage), [clampedPage, data, rowsPerPage])

  const totalPages = rowsPerPage > 0 ? Math.ceil(data.length / rowsPerPage) : 1
  const showPagination = totalPages > 1

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden', backgroundColor: '#fff' }}
    >
      <TableContainer>
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
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    {emptyLabel}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} align={column.align ?? 'left'}>
                      {column.render ? column.render(row, index + clampedPage * rowsPerPage) : (row[column.key] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination ? (
        <TablePagination
          component="div"
          rowsPerPageOptions={options}
          count={data.length}
          page={clampedPage}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            const value = Number(event.target.value)
            if (Number.isNaN(value) || value <= 0) {
              setRowsPerPage(options[0])
            } else {
              setRowsPerPage(value)
            }
            setPage(0)
          }}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          showFirstButton
          showLastButton
        />
      ) : null}
    </Paper>
  )
}

export default TableSimple
