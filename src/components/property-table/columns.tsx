import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { OccupancyBadge } from '@/components/occupancy-badge'
import { FavoriteButton } from '@/components/favorite-button'
import { SortableHeader } from './sortable-header'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Property } from '@/types/property'

interface ColumnsOptions {
  isFavorite: (id: string) => boolean
  onToggleFavorite: (property: Property) => void
  onViewDetails: (property: Property) => void
}

export function buildColumns({ isFavorite, onToggleFavorite, onViewDetails }: ColumnsOptions): ColumnDef<Property>[] {
  return [
    {
      id: 'select',
      size: 36,
      enableResizing: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
    },
    {
      id: 'favorite',
      size: 40,
      enableResizing: false,
      header: '',
      cell: ({ row }) => (
        <FavoriteButton
          active={isFavorite(row.original.id)}
          onToggle={() => onToggleFavorite(row.original)}
        />
      ),
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <SortableHeader label="Property ID" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
      ),
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.batchNo}</span>,
      size: 130,
    },
    {
      accessorKey: 'propertyType',
      header: ({ column }) => (
        <SortableHeader label="Property Type" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
      ),
      size: 160,
    },
    {
      accessorKey: 'cityMuni',
      header: ({ column }) => (
        <SortableHeader label="City" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
      ),
      cell: ({ row }) => <span className="capitalize">{row.original.cityMuni.toLowerCase()}</span>,
      size: 150,
    },
    {
      accessorKey: 'location',
      header: 'Address',
      cell: ({ row }) => <span className="block max-w-[260px] truncate" title={row.original.location}>{row.original.location}</span>,
      size: 260,
    },
    {
      accessorKey: 'minBid',
      header: ({ column }) => (
        <SortableHeader label="Minimum Bid" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
      ),
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.minBid)}</span>,
      size: 130,
    },
    {
      accessorKey: 'appraisalDate',
      header: ({ column }) => (
        <SortableHeader label="Appraisal Date" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
      ),
      cell: ({ row }) => formatDate(row.original.appraisalDate),
      sortingFn: (a, b) => (a.original.appraisalDate?.getTime() ?? 0) - (b.original.appraisalDate?.getTime() ?? 0),
      size: 130,
    },
    {
      accessorKey: 'lotArea',
      header: ({ column }) => (
        <SortableHeader label="Lot Area" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
      ),
      cell: ({ row }) => `${row.original.lotArea.toLocaleString()} sqm`,
      size: 110,
    },
    {
      accessorKey: 'floorArea',
      header: ({ column }) => (
        <SortableHeader label="Floor Area" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
      ),
      cell: ({ row }) => `${row.original.floorArea.toLocaleString()} sqm`,
      size: 110,
    },
    {
      accessorKey: 'occupancy',
      header: 'Occupancy',
      cell: ({ row }) => <OccupancyBadge occupancy={row.original.occupancy} />,
      size: 130,
    },
    {
      accessorKey: 'auctionLabel',
      header: 'Status',
      cell: ({ row }) => <Badge variant="outline">{row.original.auctionLabel}</Badge>,
      size: 150,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableResizing: false,
      size: 90,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(row.original)
          }}
        >
          <Eye data-icon="inline-start" />
          View
        </Button>
      ),
    },
  ]
}
