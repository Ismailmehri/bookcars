export const clampPage = (page: number, rowsPerPage: number, totalRows: number) => {
  if (rowsPerPage <= 0) {
    return 0
  }

  const maxPage = Math.max(0, Math.ceil(totalRows / rowsPerPage) - 1)
  if (maxPage === 0) {
    return 0
  }

  if (page < 0) {
    return 0
  }

  if (page > maxPage) {
    return maxPage
  }

  return page
}

export const paginateRows = <T,>(rows: T[], page: number, rowsPerPage: number): T[] => {
  if (rowsPerPage <= 0) {
    return rows
  }

  const start = page * rowsPerPage
  if (start >= rows.length) {
    const lastPageStart = Math.max(0, (Math.ceil(rows.length / rowsPerPage) - 1) * rowsPerPage)
    return rows.slice(lastPageStart, lastPageStart + rowsPerPage)
  }

  return rows.slice(start, start + rowsPerPage)
}
