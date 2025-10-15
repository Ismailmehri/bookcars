import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { visuallyHidden } from '@mui/utils'
import { clampPage, paginateRows } from './tableSimple.utils'

export type SortValue = string | number | Date | boolean | null | undefined
export type SortDirection = 'asc' | 'desc'

export interface TableColumn<T> {
  key: keyof T
  label: string
  align?: 'left' | 'right' | 'center'
  render?: (row: T, index: number) => React.ReactNode
  sortable?: boolean
  sortValue?: (row: T) => SortValue
  sortComparator?: (a: T, b: T) => number
}

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [5, 10, 25]

interface TableSimpleProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  emptyLabel: string
  rowsPerPageOptions?: number[]
  initialRowsPerPage?: number
  mobileSortLabel?: string
  getRowId?: (row: T, index: number) => React.Key
}

const resolveSortValue = <T extends Record<string, unknown>>(row: T, column: TableColumn<T>): SortValue => {
  if (column.sortValue) {
    return column.sortValue(row)
  }

  return row[column.key] as SortValue
}

const compareValues = (a: SortValue, b: SortValue): number => {
  if (a === b) {
    return 0
  }

  if (a === null || a === undefined) {
    return 1
  }

  if (b === null || b === undefined) {
    return -1
  }

  const normalise = (value: Exclude<SortValue, null | undefined>) => {
    if (value instanceof Date) {
      return value.getTime()
    }

    if (typeof value === 'number') {
      return value
    }

    if (typeof value === 'boolean') {
      return value ? 1 : 0
    }

    if (typeof value === 'string') {
      return value.toLocaleLowerCase()
    }

    return String(value)
  }

  const normalisedA = normalise(a)
  const normalisedB = normalise(b)

  if (typeof normalisedA === 'number' && typeof normalisedB === 'number') {
    return normalisedA - normalisedB
  }

  return String(normalisedA).localeCompare(String(normalisedB), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

const getColumnId = <T, >(column: TableColumn<T>) => String(column.key)

const TableSimple = <T extends Record<string, unknown>>({
  columns,
  data,
  emptyLabel,
  rowsPerPageOptions,
  initialRowsPerPage,
  mobileSortLabel,
  getRowId,
}: TableSimpleProps<T>) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const sortLabel = mobileSortLabel ?? 'Sort'

  const options = rowsPerPageOptions && rowsPerPageOptions.length > 0 ? rowsPerPageOptions : DEFAULT_ROWS_PER_PAGE_OPTIONS
  const initialRows = initialRowsPerPage && initialRowsPerPage > 0 ? initialRowsPerPage : options[0]

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRows)
  const [orderBy, setOrderBy] = useState<string | null>(null)
  const [orderDirection, setOrderDirection] = useState<SortDirection>('asc')

  const sortableColumns = useMemo(
    () => columns.filter((column) => column.sortable !== false),
    [columns],
  )

  useEffect(() => {
    if (orderBy && !sortableColumns.some((column) => getColumnId(column) === orderBy)) {
      setOrderBy(null)
      setOrderDirection('asc')
    }
  }, [orderBy, sortableColumns])

  const sortedRows = useMemo(() => {
    if (!orderBy) {
      return data
    }

    const activeColumn = columns.find((column) => getColumnId(column) === orderBy)
    if (!activeColumn || activeColumn.sortable === false) {
      return data
    }

    const comparator = activeColumn.sortComparator
      ? activeColumn.sortComparator
      : (a: T, b: T) => compareValues(resolveSortValue(a, activeColumn), resolveSortValue(b, activeColumn))

    return data
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const result = comparator(a.row, b.row)
        if (result !== 0) {
          return orderDirection === 'asc' ? result : -result
        }

        return a.index - b.index
      })
      .map(({ row }) => row)
  }, [columns, data, orderBy, orderDirection])

  const clampedPage = useMemo(
    () => clampPage(page, rowsPerPage, sortedRows.length),
    [page, rowsPerPage, sortedRows.length],
  )

  useEffect(() => {
    if (clampedPage !== page) {
      setPage(clampedPage)
    }
  }, [clampedPage, page])

  const visibleRows = useMemo(
    () => paginateRows(sortedRows, clampedPage, rowsPerPage),
    [clampedPage, rowsPerPage, sortedRows],
  )

  const totalPages = rowsPerPage > 0 ? Math.ceil(sortedRows.length / rowsPerPage) : 1
  const showPagination = totalPages > 1

  const handleSortRequest = (columnId: string) => {
    if (orderBy === columnId) {
      setOrderDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderBy(columnId)
      setOrderDirection('asc')
    }
    setPage(0)
  }

  const handleMobileSortChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target
    if (!value) {
      setOrderBy(null)
      setOrderDirection('asc')
    } else {
      setOrderBy(value)
      setOrderDirection('asc')
    }
    setPage(0)
  }

  const currentSortLabel = useMemo(() => {
    if (!orderBy) {
      return mobileSortLabel
    }

    const column = columns.find((item) => getColumnId(item) === orderBy)
    return column?.label ?? mobileSortLabel
  }, [columns, mobileSortLabel, orderBy])

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      {isMobile ? (
        <Stack spacing={2} sx={{ px: 2, pt: 2 }}>
          {sortableColumns.length > 0 ? (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>{sortLabel}</InputLabel>
                <Select
                  value={orderBy ?? ''}
                  label={sortLabel}
                  onChange={handleMobileSortChange}
                  displayEmpty
                  renderValue={(value) => {
                    if (!value) {
                      return sortLabel
                    }

                    return currentSortLabel ?? sortLabel
                  }}
                  inputProps={{ 'aria-label': sortLabel }}
                >
                  <MenuItem value="">
                    <Typography variant="body2" color="text.secondary">
                      {sortLabel}
                    </Typography>
                  </MenuItem>
                  {sortableColumns.map((column) => {
                    const columnId = getColumnId(column)
                    return (
                      <MenuItem key={columnId} value={columnId}>
                        {column.label}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <IconButton
                color="primary"
                onClick={() => {
                  if (sortableColumns.length === 0) {
                    return
                  }
                  const fallbackColumnId = getColumnId(sortableColumns[0])
                  handleSortRequest(orderBy ?? fallbackColumnId)
                }}
                disabled={sortableColumns.length === 0}
                aria-label={orderDirection === 'asc' ? 'Toggle descending sort' : 'Toggle ascending sort'}
              >
                {orderDirection === 'asc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </IconButton>
            </Stack>
          ) : null}
          {visibleRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              {emptyLabel}
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {visibleRows.map((row, rowIndex) => {
                const absoluteIndex = rowIndex + clampedPage * rowsPerPage
                const rowKey = getRowId?.(row, absoluteIndex) ?? JSON.stringify(row)
                  return (
                    <Box
                      key={rowKey}
                      data-testid="table-simple-card"
                      sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 2,
                        backgroundColor: '#FAFCFF',
                      }}
                    >
                      {columns.map((column) => (
                        <Stack
                          key={getColumnId(column)}
                          spacing={0.5}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          sx={{
                            py: 0.5,
                            gap: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                          >
                            {column.label}
                          </Typography>
                          <Box sx={{ textAlign: column.align ?? 'left', flex: 1 }}>
                            {column.render
                              ? column.render(row, absoluteIndex)
                              : (row[column.key] as React.ReactNode)}
                          </Box>
                        </Stack>
                      ))}
                    </Box>
                  )
                })}
            </Stack>
          )}
        </Stack>
      ) : (
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 560 }}>
            <TableHead sx={{ backgroundColor: '#F5F7FB' }}>
              <TableRow>
                {columns.map((column) => {
                  const columnId = getColumnId(column)
                  const isSortable = column.sortable !== false
                  const isActive = isSortable && orderBy === columnId
                  return (
                    <TableCell key={columnId} align={column.align ?? 'left'} sx={{ fontWeight: 600 }}>
                      {isSortable ? (
                        <TableSortLabel
                          active={isActive}
                          direction={isActive ? orderDirection : 'asc'}
                          onClick={() => handleSortRequest(columnId)}
                        >
                          {column.label}
                          {isActive ? (
                            <Box component="span" sx={visuallyHidden}>
                              {orderDirection === 'asc' ? 'sorted ascending' : 'sorted descending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  )
                })}
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
                visibleRows.map((row, index) => {
                  const absoluteIndex = index + clampedPage * rowsPerPage
                  const rowKey = getRowId?.(row, absoluteIndex) ?? JSON.stringify(row)
                  return (
                    <TableRow key={rowKey} hover>
                      {columns.map((column) => (
                        <TableCell key={getColumnId(column)} align={column.align ?? 'left'}>
                          {column.render
                            ? column.render(row, absoluteIndex)
                            : (row[column.key] as React.ReactNode)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {showPagination ? (
        <TablePagination
          component="div"
          rowsPerPageOptions={options}
          count={sortedRows.length}
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
