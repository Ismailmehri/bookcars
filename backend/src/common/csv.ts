interface CsvOptions {
  delimiter?: string
}

const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`

export const buildCsvContent = (rows: string[][], options?: CsvOptions) => {
  const delimiter = options?.delimiter ?? ';'
  return rows.map((row) => row.map((cell) => escapeCell(cell)).join(delimiter)).join('\n')
}

export const downloadCsv = (filename: string, rows: string[][], options?: CsvOptions) => {
  if (typeof window === 'undefined') {
    return
  }

  const csvContent = buildCsvContent(rows, options)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
