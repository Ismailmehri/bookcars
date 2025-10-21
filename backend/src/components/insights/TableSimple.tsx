import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Checkbox,
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

type ColumnKey<T extends object> = Extract<keyof T, string | number>

export interface TableColumn<T extends object> {
  key: ColumnKey<T>
  label: string
  align?: 'left' | 'right' | 'center'
  render?: (row: T, index: number) => React.ReactNode
  sortable?: boolean
  sortValue?: (row: T) => SortValue
  sortComparator?: (a: T, b: T) => number
}

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [5, 10, 25]

interface TableSimpleProps<T extends object> {
  columns: TableColumn<T>[]
  data: T[]
  emptyLabel: string
  rowsPerPageOptions?: number[]
  initialRowsPerPage?: number
  mobileSortLabel?: string
  getRowId?: (row: T, index: number) => React.Key
  selectable?: boolean
  selectedRows?: React.Key[]
  onSelectionChange?: (rows: T[], ids: React.Key[]) => void
  selectionLabel?: string
}

const resolveSortValue = <T extends object>(row: T, column: TableColumn<T>): SortValue => {
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

const getColumnId = <T extends object>(column: TableColumn<T>) => String(column.key)

const TableSimple = <T extends object>({
  columns,
  data,
  emptyLabel,
  rowsPerPageOptions,
  initialRowsPerPage,
  mobileSortLabel,
  getRowId,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  selectionLabel,
}: TableSimpleProps<T>) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const sortLabel = mobileSortLabel ?? 'Sort'
  const resolvedSelectionLabel = selectionLabel ?? 'Select rows'

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

  const sortedEntries = useMemo(() => {
    const entries = data.map((row, index) => ({ row, index }))

    if (!orderBy) {
      return entries
    }

    const activeColumn = columns.find((column) => getColumnId(column) === orderBy)
    if (!activeColumn || activeColumn.sortable === false) {
      return entries
    }

    const comparator = activeColumn.sortComparator
      ? activeColumn.sortComparator
      : (a: T, b: T) => compareValues(resolveSortValue(a, activeColumn), resolveSortValue(b, activeColumn))

    return [...entries].sort((a, b) => {
      const result = comparator(a.row, b.row)
      if (result !== 0) {
        return orderDirection === 'asc' ? result : -result
      }

      return a.index - b.index
    })
  }, [columns, data, orderBy, orderDirection])

  const sortedRows = useMemo(() => sortedEntries.map((entry) => entry.row), [sortedEntries])

  const clampedPage = useMemo(
    () => clampPage(page, rowsPerPage, sortedRows.length),
    [page, rowsPerPage, sortedRows.length],
  )

  useEffect(() => {
    if (clampedPage !== page) {
      setPage(clampedPage)
    }
  }, [clampedPage, page])

  const visibleEntries = useMemo(
    () => paginateRows(sortedEntries, clampedPage, rowsPerPage),
    [sortedEntries, clampedPage, rowsPerPage],
  )

  const totalPages = rowsPerPage > 0 ? Math.ceil(sortedRows.length / rowsPerPage) : 1
  const showPagination = totalPages > 1

  const selectionActive = selectable && typeof onSelectionChange === 'function' && typeof getRowId === 'function'

  const selectedIdSet = useMemo(() => {
    if (!selectionActive) {
      return new Set<string>()
    }
    return new Set((selectedRows ?? []).map((value) => String(value)))
  }, [selectedRows, selectionActive])

  const rowIdAccessor = useMemo(() => {
    if (!selectionActive || !getRowId) {
      return null
    }
    return getRowId
  }, [selectionActive, getRowId])

  const rowIdMap = useMemo(() => {
    if (!selectionActive || !rowIdAccessor) {
      return new Map<string, T>()
    }

    return data.reduce<Map<string, T>>((acc, row, index) => {
      const id = String(rowIdAccessor(row, index))
      acc.set(id, row)
      return acc
    }, new Map())
  }, [data, rowIdAccessor, selectionActive])

  const emitSelection = useCallback(
    (ids: string[]) => {
      if (!selectionActive || !rowIdAccessor || !onSelectionChange) {
        return
      }
      const uniqueIds = Array.from(new Set(ids))
      const selectedData = uniqueIds
        .map((id) => rowIdMap.get(id))
        .filter((value): value is T => Boolean(value))

      onSelectionChange(selectedData, uniqueIds)
    },
    [selectionActive, rowIdAccessor, onSelectionChange, rowIdMap],
  )

  const toggleRowSelection = useCallback(
    (row: T, originalIndex: number) => {
      if (!selectionActive || !rowIdAccessor) {
        return
      }
      const rowId = String(rowIdAccessor(row, originalIndex))
      const next = new Set(selectedIdSet)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      emitSelection(Array.from(next))
    },
    [selectionActive, rowIdAccessor, selectedIdSet, emitSelection],
  )

  const toggleSelectAllVisible = useCallback(
    (checked: boolean) => {
      if (!selectionActive || !rowIdAccessor) {
        return
      }
      const next = new Set(selectedIdSet)
      visibleEntries.forEach((entry) => {
        const id = String(rowIdAccessor(entry.row, entry.index))
        if (checked) {
          next.add(id)
        } else {
          next.delete(id)
        }
      })
      emitSelection(Array.from(next))
    },
    [selectionActive, rowIdAccessor, selectedIdSet, visibleEntries, emitSelection],
  )

  const visibleSelectionState = useMemo(() => {
    if (!selectionActive || !rowIdAccessor) {
      return { selected: 0, total: visibleEntries.length }
    }

    let selected = 0
    visibleEntries.forEach((entry) => {
      const id = String(rowIdAccessor(entry.row, entry.index))
      if (selectedIdSet.has(id)) {
        selected += 1
      }
    })

    return { selected, total: visibleEntries.length }
  }, [selectionActive, rowIdAccessor, visibleEntries, selectedIdSet])

  const allVisibleSelected = selectionActive
    && visibleSelectionState.total > 0
    && visibleSelectionState.selected === visibleSelectionState.total

  const someVisibleSelected = selectionActive
    && visibleSelectionState.selected > 0
    && visibleSelectionState.selected < visibleSelectionState.total

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
          {visibleEntries.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              {emptyLabel}
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {selectionActive ? (
                <Box display="flex" justifyContent="flex-end">
                  <Checkbox
                    size="small"
                    indeterminate={someVisibleSelected}
                    checked={allVisibleSelected}
                    onChange={(event) => {
                      const { checked } = event.target as HTMLInputElement
                      toggleSelectAllVisible(checked)
                    }}
                    inputProps={{ 'aria-label': resolvedSelectionLabel }}
                  />
                </Box>
              ) : null}
              {visibleEntries.map((entry, rowIndex) => {
                const row = entry.row
                const sortedIndex = rowIndex + clampedPage * rowsPerPage
                const originalIndex = entry.index
                const rowIdentifier = getRowId ? getRowId(row, sortedIndex) : JSON.stringify(row)
                const rowKey = typeof rowIdentifier === 'string' || typeof rowIdentifier === 'number'
                  ? rowIdentifier
                  : JSON.stringify(rowIdentifier)
                const selectionId = selectionActive && rowIdAccessor
                  ? String(rowIdAccessor(row, originalIndex))
                  : undefined
                const isSelected = selectionId ? selectedIdSet.has(selectionId) : false

                return (
                  <Box
                    key={rowKey}
                    data-testid="table-simple-card"
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      p: 2,
                      backgroundColor: isSelected ? 'rgba(30,136,229,0.08)' : '#FAFCFF',
                    }}
                  >
                    {selectionActive ? (
                      <Box display="flex" justifyContent="flex-end" mb={1}>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={(event) => {
                            event.stopPropagation()
                            const { checked } = event.target as HTMLInputElement
                            if (checked !== isSelected) {
                              toggleRowSelection(row, originalIndex)
                            }
                          }}
                          inputProps={{ 'aria-label': resolvedSelectionLabel }}
                        />
                      </Box>
                    ) : null}
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
                            ? column.render(row, sortedIndex)
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
                {selectionActive ? (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={someVisibleSelected}
                      checked={allVisibleSelected}
                    onChange={(event) => {
                      const { checked } = event.target as HTMLInputElement
                      toggleSelectAllVisible(checked)
                    }}
                      inputProps={{ 'aria-label': resolvedSelectionLabel }}
                    />
                  </TableCell>
                ) : null}
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
              {visibleEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectionActive ? 1 : 0)}>
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      {emptyLabel}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleEntries.map((entry, rowIndex) => {
                  const row = entry.row
                  const sortedIndex = rowIndex + clampedPage * rowsPerPage
                  const originalIndex = entry.index
                  const resolvedKey = getRowId ? getRowId(row, sortedIndex) : JSON.stringify(row)
                  const rowKey = typeof resolvedKey === 'string' || typeof resolvedKey === 'number'
                    ? resolvedKey
                    : JSON.stringify(resolvedKey)
                  const selectionId = selectionActive && rowIdAccessor
                    ? String(rowIdAccessor(row, originalIndex))
                    : undefined
                  const isSelected = selectionId ? selectedIdSet.has(selectionId) : false

                  return (
                    <TableRow key={rowKey} hover selected={isSelected}>
                      {selectionActive ? (
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isSelected}
                            onChange={(event) => {
                              event.stopPropagation()
                              toggleRowSelection(row, originalIndex)
                            }}
                            inputProps={{ 'aria-label': resolvedSelectionLabel }}
                          />
                        </TableCell>
                      ) : null}
                      {columns.map((column) => (
                        <TableCell key={getColumnId(column)} align={column.align ?? 'left'}>
                          {column.render
                            ? column.render(row, sortedIndex)
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
            const { value } = event.target as HTMLInputElement
            const numericValue = Number(value)
            if (Number.isNaN(numericValue) || numericValue <= 0) {
              setRowsPerPage(options[0])
            } else {
              setRowsPerPage(numericValue)
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
