'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import AddEditPoolDrawer from './AddEditPoolDrawer'
import tableStyles from '@core/styles/table.module.css'

type IpPool = {
  id: string
  name: string
  range: string
  routerId: string
  createdAt: string
  router: { id: string; name: string }
}

type Router = { id: string; name: string }

const columnHelper = createColumnHelper<IpPool>()

const PoolsPageClient = () => {
  const [pools, setPools] = useState<IpPool[]>([])
  const [routers, setRouters] = useState<Router[]>([])
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [routerFilter, setRouterFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editPool, setEditPool] = useState<IpPool | null>(null)

  const loadPools = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hotspot/pools')
      const data = await res.json()
      if (Array.isArray(data)) setPools(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/hotspot/routers').then(r => r.json()).then(d => { if (Array.isArray(d)) setRouters(d) })
    loadPools()
  }, [loadPools])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this IP pool?')) return
    await fetch(`/api/hotspot/pools/${id}`, { method: 'DELETE' })
    setPools(prev => prev.filter(p => p.id !== id))
  }, [])

  const filtered = useMemo(() => {
    let data = pools
    if (routerFilter !== 'all') data = data.filter(p => p.routerId === routerFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      data = data.filter(p => p.name.toLowerCase().includes(q) || p.range.toLowerCase().includes(q))
    }
    return data
  }, [pools, routerFilter, globalFilter])

  const columns = useMemo<ColumnDef<IpPool, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Pool Name',
        cell: ({ row }) => <Typography className='font-medium' color='text.primary'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('range', {
        header: 'IP Range',
        cell: ({ row }) => <Typography variant='body2' className='font-mono text-xs'>{row.original.range}</Typography>
      }),
      columnHelper.accessor('router', {
        header: 'Router',
        cell: ({ row }) => <Typography variant='body2'>{row.original.router.name}</Typography>
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: ({ row }) => <Typography variant='body2'>{new Date(row.original.createdAt).toLocaleDateString()}</Typography>
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title='Edit'>
              <IconButton size='small' onClick={() => { setEditPool(row.original); setDrawerOpen(true) }}>
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
    [handleDelete]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <>
      <Card>
        <CardHeader
          title='IP Pools'
          action={
            <Button variant='contained' startIcon={<i className='tabler-plus text-lg' />}
              onClick={() => { setEditPool(null); setDrawerOpen(true) }}>
              Add Pool
            </Button>
          }
        />
        <div className='flex flex-wrap gap-4 px-6 pb-4'>
          <CustomTextField value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder='Search pools...' size='small'
            slotProps={{ input: { startAdornment: <i className='tabler-search text-textSecondary me-2' /> } }} sx={{ minWidth: 200 }} />
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel>Router</InputLabel>
            <Select label='Router' value={routerFilter} onChange={e => setRouterFilter(e.target.value)}>
              <MenuItem value='all'>All Routers</MenuItem>
              {routers.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
          {loading && <CircularProgress size={24} className='self-center' />}
        </div>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>{hg.headers.map(h => <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className='text-center py-8'><Typography color='text.disabled'>No IP pools found</Typography></td></tr>
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

      <AddEditPoolDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editPool={editPool} routers={routers} onSaved={loadPools} />
    </>
  )
}

export default PoolsPageClient
