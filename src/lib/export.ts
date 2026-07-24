export interface ExportColumn<T> {
  header: string
  accessor: (row: T) => string | number
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function escapeCsvCell(value: string | number): string {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function exportToCsv<T>(rows: T[], columns: ExportColumn<T>[], filename: string) {
  const header = columns.map((col) => escapeCsvCell(col.header)).join(',')
  const body = rows
    .map((row) => columns.map((col) => escapeCsvCell(col.accessor(row))).join(','))
    .join('\n')
  // UTF-8 BOM so Excel/Numbers detect encoding and render peso signs/ñ correctly.
  const blob = new Blob(['﻿', header, '\n', body], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Builds a real Excel worksheet (.xls) via the HTML-table-as-workbook trick,
 * avoiding the SheetJS/xlsx package (unpatched high-severity advisories).
 */
export function exportToExcel<T>(rows: T[], columns: ExportColumn<T>[], filename: string) {
  const headerRow = `<tr>${columns.map((col) => `<th>${escapeHtml(col.header)}</th>`).join('')}</tr>`
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${columns.map((col) => `<td>${escapeHtml(col.accessor(row))}</td>`).join('')}</tr>`,
    )
    .join('')

  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="utf-8" /></head>
<body><table>${headerRow}${bodyRows}</table></body>
</html>`

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  downloadBlob(blob, filename)
}
