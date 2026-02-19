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

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import AddEditCustomerDrawer from './AddEditCustomerDrawer'
import tableStyles from '@core/styles/table.module.css'

type Customer = {
  id: string
  username: string
  fullName: string
  email: string | null
  phone: string | null
  serviceType: string
  accountType: string
  status: string
  balance: number
  plan: { id: string; name: string; price: number; rateLimit: string } | null
  router: { id: string; name: string } | null
  createdAt: string
}

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default' | 'info'> = {
  Active: 'success',
  Banned: 'error',
  Disabled: 'warning',
  Suspended: 'warning',
  Inactive: 'default'
}

const columnHelper = createColumnHelper<Customer>()

const CustomersPageClient = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hotspot/customers')
      const data = await res.json()
      if (Array.isArray(data)) setCustomers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCustomers() }, [loadCustomers])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this customer? All transactions will also be deleted.')) return
    await fetch(`/api/hotspot/customers/${id}`, { method: 'DELETE' })
    setCustomers(prev => prev.filter(c => c.id !== id))
  }, [])

  const filtered = useMemo(() => {
    let data = customers
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter)
    if (serviceFilter !== 'all') data = data.filter(c => c.serviceType === serviceFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      data = data.filter(c =>
        c.username.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      )
    }
    return data
  }, [customers, statusFilter, serviceFilter, globalFilter])

  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      columnHelper.accessor('fullName', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='primary' size={34}>
              {row.original.fullName.charAt(0).toUpperCase()}
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>{row.original.fullName}</Typography>
              <Typography variant='caption' color='text.disabled'>{row.original.username}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Contact',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2'>{row.original.phone || '—'}</Typography>
            <Typography variant='caption' color='text.disabled'>{row.original.email || ''}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('serviceType', {
        header: 'Type',
        cell: ({ row }) => (
          <Chip label={row.original.serviceType} color={row.original.serviceType === 'PPPoE' ? 'info' : 'primary'} variant='tonal' size='small' />
        )
      }),
      columnHelper.accessor('plan', {
        header: 'Plan',
        cell: ({ row }) => row.original.plan ? (
          <div className='flex flex-col'>
            <Typography variant='body2' className='font-medium'>{row.original.plan.name}</Typography>
            <Typography variant='caption' color='text.disabled'>{row.original.plan.rateLimit}</Typography>
          </div>
        ) : <Typography variant='body2' color='text.disabled'>—</Typography>
      }),
      columnHelper.accessor('balance', {
        header: 'Balance',
        cell: ({ row }) => (
          <Typography variant='body2' className={row.original.balance < 0 ? 'text-error' : ''}>
            ${row.original.balance.toFixed(2)}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip label={row.original.status} color={statusColors[row.original.status] || 'default'} variant='tonal' size='small' />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title='Edit'>
              <IconButton size='small' onClick={() => { setEditCustomer(row.original); setDrawerOpen(true) }}>
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
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <>
      <Card>
        <CardHeader
          title='Customers'
          action={
            <Button variant='contained' startIcon={<i className='tabler-plus text-lg' />}
              onClick={() => { setEditCustomer(null); setDrawerOpen(true) }}>
              Add Customer
            </Button>
          }
        />
        <div className='flex flex-wrap gap-4 px-6 pb-4'>
          <CustomTextField
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search customers...'
            size='small'
            slotProps={{ input: { startAdornment: <i className='tabler-search text-textSecondary me-2' /> } }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size='small' sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select label='Status' value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Inactive'>Inactive</MenuItem>
              <MenuItem value='Suspended'>Suspended</MenuItem>
              <MenuItem value='Banned'>Banned</MenuItem>
              <MenuItem value='Disabled'>Disabled</MenuItem>
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 130 }}>
            <InputLabel>Service</InputLabel>
            <Select label='Service' value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
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
                <tr><td colSpan={columns.length} className='text-center py-8'>
                  <Typography color='text.disabled'>No customers found</Typography>
                </td></tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
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

      <AddEditCustomerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editCustomer={editCustomer}
        onSaved={loadCustomers}
      />
    </>
  )
}

export default CustomersPageClient
