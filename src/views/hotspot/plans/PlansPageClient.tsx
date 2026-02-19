'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import AddEditPlanDrawer from './AddEditPlanDrawer'
import tableStyles from '@core/styles/table.module.css'

type Plan = {
  id: string
  name: string
  type: string
  price: number
  validity: number
  validityUnit: string
  rateLimit: string
  dataLimit: number | null
  sharedUsers: number
  isActive: boolean
  description: string | null
  _count?: { customers: number; transactions: number }
  createdAt: string
}

const columnHelper = createColumnHelper<Plan>()

const PlansPageClient = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editPlan, setEditPlan] = useState<Plan | null>(null)

  const loadPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hotspot/plans')
      const data = await res.json()
      if (Array.isArray(data)) setPlans(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPlans() }, [loadPlans])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this plan?')) return
    await fetch(`/api/hotspot/plans/${id}`, { method: 'DELETE' })
    setPlans(prev => prev.filter(p => p.id !== id))
  }, [])

  const handleToggleActive = useCallback(async (plan: Plan) => {
    await fetch(`/api/hotspot/plans/${plan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !plan.isActive })
    })
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
  }, [])

  const filtered = useMemo(() => {
    let data = plans
    if (typeFilter !== 'all') data = data.filter(p => p.type === typeFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      data = data.filter(p => p.name.toLowerCase().includes(q) || p.rateLimit.toLowerCase().includes(q))
    }
    return data
  }, [plans, typeFilter, globalFilter])

  const columns = useMemo<ColumnDef<Plan, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Plan',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>{row.original.name}</Typography>
            {row.original.description && <Typography variant='caption' color='text.disabled'>{row.original.description}</Typography>}
          </div>
        )
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ row }) => <Chip label={row.original.type} color={row.original.type === 'PPPoE' ? 'info' : 'primary'} variant='tonal' size='small' />
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ row }) => <Typography variant='body2' className='font-medium'>${row.original.price.toFixed(2)}</Typography>
      }),
      columnHelper.accessor('validity', {
        header: 'Validity',
        cell: ({ row }) => <Typography variant='body2'>{row.original.validity} {row.original.validityUnit}</Typography>
      }),
      columnHelper.accessor('rateLimit', {
        header: 'Speed',
        cell: ({ row }) => <Typography variant='body2' className='font-mono text-xs'>{row.original.rateLimit}</Typography>
      }),
      columnHelper.accessor('sharedUsers', {
        header: 'Shared',
        cell: ({ row }) => <Typography variant='body2'>{row.original.sharedUsers}</Typography>
      }),
      columnHelper.display({
        id: 'customers',
        header: 'Customers',
        cell: ({ row }) => <Typography variant='body2'>{row.original._count?.customers ?? 0}</Typography>
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => <Chip label={row.original.isActive ? 'Active' : 'Inactive'} color={row.original.isActive ? 'success' : 'default'} variant='tonal' size='small' />
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title={row.original.isActive ? 'Deactivate' : 'Activate'}>
              <IconButton size='small' color={row.original.isActive ? 'warning' : 'success'} onClick={() => handleToggleActive(row.original)}>
                <i className={`tabler-${row.original.isActive ? 'ban' : 'check'} text-lg`} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Edit'>
              <IconButton size='small' onClick={() => { setEditPlan(row.original); setDrawerOpen(true) }}>
                <i className='tabler-edit text-lg' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete'>
              <IconButton size='small' color='error' onClick={() => handleDelete(row.original.id)}>
                <i className='tabler-trash text-lg' />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    [handleDelete, handleToggleActive]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <>
      <Card>
        <CardHeader
          title='Service Plans'
          action={
            <Button variant='contained' startIcon={<i className='tabler-plus text-lg' />}
              onClick={() => { setEditPlan(null); setDrawerOpen(true) }}>
              Add Plan
            </Button>
          }
        />
        <div className='flex flex-wrap gap-4 px-6 pb-4'>
          <CustomTextField value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder='Search plans...' size='small'
            slotProps={{ input: { startAdornment: <i className='tabler-search text-textSecondary me-2' /> } }} sx={{ minWidth: 200 }} />
          <FormControl size='small' sx={{ minWidth: 130 }}>
            <InputLabel>Type</InputLabel>
            <Select label='Type' value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='Hotspot'>Hotspot</MenuItem>
              <MenuItem value='PPPoE'>PPPoE</MenuItem>
            </Select>
          </FormControl>
          {loading && <CircularProgress size={24} className='self-center' />}
        </div>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} className='cursor-pointer'>
                      <div className='flex items-center gap-1'>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: <i className='tabler-chevron-up text-sm' />, desc: <i className='tabler-chevron-down text-sm' /> }[h.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className='text-center py-8'><Typography color='text.disabled'>No plans found</Typography></td></tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          component={() => <TablePaginationComponent table={table as any} />}
          count={filtered.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      <AddEditPlanDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editPlan={editPlan} onSaved={loadPlans} />
    </>
  )
}

export default PlansPageClient
