import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Columns3, Download } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { buildColumns } from './columns'
import { exportToCsv, exportToExcel, type ExportColumn } from '@/lib/export'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Property } from '@/types/property'
import { cn } from '@/lib/utils'

const EXPORT_COLUMNS: ExportColumn<Property>[] = [
  { header: 'Property ID', accessor: (p) => p.batchNo },
  { header: 'Property Type', accessor: (p) => p.propertyType },
  { header: 'City', accessor: (p) => p.cityMuni },
  { header: 'Address', accessor: (p) => p.location },
  { header: 'Minimum Bid', accessor: (p) => p.minBid },
  { header: 'Appraisal Date', accessor: (p) => formatDate(p.appraisalDate) },
  { header: 'Lot Area (sqm)', accessor: (p) => p.lotArea },
  { header: 'Floor Area (sqm)', accessor: (p) => p.floorArea },
  { header: 'Occupancy', accessor: (p) => p.occupancy },
  { header: 'Auction Type', accessor: (p) => p.auctionLabel },
]

interface PropertyTableProps {
  data: Property[]
  isFavorite: (id: string) => boolean
  onToggleFavorite: (property: Property) => void
  onViewDetails: (property: Property) => void
}

export function PropertyTable({ data, isFavorite, onToggleFavorite, onViewDetails }: PropertyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ id: false, cityMuni: false })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 })

  // Jump back to page 1 whenever the underlying result set changes (new search, filter, or
  // search-box query) instead of silently rendering an out-of-range, possibly empty page.
  const [trackedData, setTrackedData] = useState(data)
  if (trackedData !== data) {
    setTrackedData(data)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const columns = useMemo(
    () => buildColumns({ isFavorite, onToggleFavorite, onViewDetails }),
    [isFavorite, onToggleFavorite, onViewDetails],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
  const selectedCount = selectedRows.length
  const exportRows = selectedCount > 0 ? selectedRows : data

  if (data.length === 0) {
    return (
      <Empty className="mt-6">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
            <Columns3 />
          </EmptyMedia>
          <EmptyTitle>No properties found</EmptyTitle>
          <EmptyDescription>Try widening your filters or picking a different city.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : `${data.length} properties`}
        </p>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 data-icon="inline-start" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download data-icon="inline-start" />
                Export {selectedCount > 0 ? 'Selected' : 'All'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <button
                className="flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => exportToCsv(exportRows, EXPORT_COLUMNS, 'pagibig-properties.csv')}
              >
                Export as CSV
              </button>
              <button
                className="flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => exportToExcel(exportRows, EXPORT_COLUMNS, 'pagibig-properties.xls')}
              >
                Export as Excel
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto rounded-lg border">
        <Table style={{ width: table.getTotalSize() }}>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize(), position: 'relative' }}
                    className="select-none bg-background"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          'absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-border/0 hover:bg-primary/50',
                          header.column.getIsResizing() && 'bg-primary',
                        )}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer"
                onClick={() => onViewDetails(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => setPagination({ pageIndex: 0, pageSize: Number(value) })}
          >
            <SelectTrigger size="sm" className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      {selectedCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Total minimum bid of selected: {formatCurrency(selectedRows.reduce((sum, p) => sum + p.minBid, 0))}
        </p>
      )}
    </div>
  )
}
