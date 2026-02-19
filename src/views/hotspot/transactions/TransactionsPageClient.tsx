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
import AddTransactionDrawer from './AddTransactionDrawer'
import tableStyles from '@core/styles/table.module.css'

type Transaction = {
  id: string
  amount: number
  paymentMethod: string
  status: string
  note: string | null
  createdBy: string | null
  createdAt: string
  expiresAt: string | null
  customer: { id: string; username: string; fullName: string }
  plan: { id: string; name: string; price: number } | null
}

const statusColors: Record<string, 'success' | 'error' | 'warning'> = {
  Paid: 'success',
  Unpaid: 'warning',
  Canceled: 'error'
}

const columnHelper = createColumnHelper<Transaction>()

const TransactionsPageClient = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hotspot/transactions')
      const data = await res.json()
      if (Array.isArray(data)) setTransactions(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTransactions() }, [loadTransactions])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    await fetch(`/api/hotspot/transactions/${id}`, { method: 'DELETE' })
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    await fetch(`/api/hotspot/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }, [])

  const filtered = useMemo(() => {
    let data = transactions
    if (statusFilter !== 'all') data = data.filter(t => t.status === statusFilter)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      data = data.filter(t =>
        t.customer.username.toLowerCase().includes(q) ||
        t.customer.fullName.toLowerCase().includes(q) ||
        t.plan?.name.toLowerCase().includes(q)
      )
    }
    return data
  }, [transactions, statusFilter, globalFilter])

  const totalRevenue = useMemo(() => filtered.filter(t => t.status === 'Paid').reduce((s, t) => s + t.amount, 0), [filtered])

  const columns = useMemo<ColumnDef<Transaction, any>[]>(
    () => [
      columnHelper.accessor('customer', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2' className='font-medium'>{row.original.customer.fullName}</Typography>
            <Typography variant='caption' color='text.disabled'>{row.original.customer.username}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('plan', {
        header: 'Plan',
        cell: ({ row }) => row.original.plan
          ? <Typography variant='body2'>{row.original.plan.name}</Typography>
          : <Typography variant='body2' color='text.disabled'>—</Typography>
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: ({ row }) => <Typography variant='body2' className='font-medium'>${row.original.amount.toFixed(2)}</Typography>
      }),
      columnHelper.accessor('paymentMethod', {
        header: 'Method',
        cell: ({ row }) => <Chip label={row.original.paymentMethod} variant='tonal' size='small' color='default' />
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => <Chip label={row.original.status} color={statusColors[row.original.status] || 'default'} variant='tonal' size='small' />
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography variant='body2'>{new Date(row.original.createdAt).toLocaleDateString()}</Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            {row.original.status === 'Unpaid' && (
              <Tooltip title='Mark Paid'>
                <IconButton size='small' color='success' onClick={() => handleStatusChange(row.original.id, 'Paid')}>
                  <i className='tabler-check text-lg' />
                </IconButton>
              </Tooltip>
            )}
            {row.original.status !== 'Canceled' && (
              <Tooltip title='Cancel'>
                <IconButton size='small' color='warning' onClick={() => handleStatusChange(row.original.id, 'Canceled')}>
                  <i className='tabler-ban text-lg' />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title='Delete'>
              <IconButton size='small' color='error' onClick={() => handleDelete(row.original.id)}>
                <i className='tabler-trash text-lg' />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    [handleDelete, handleStatusChange]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  })

  return (
    <>
      <Card>
        <CardHeader
          title='Transactions'
          subheader={`Revenue (filtered): $${totalRevenue.toFixed(2)}`}
          action={
            <Button variant='contained' startIcon={<i className='tabler-plus text-lg' />} onClick={() => setDrawerOpen(true)}>
              Add Transaction
            </Button>
          }
        />
        <div className='flex flex-wrap gap-4 px-6 pb-4'>
          <CustomTextField value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder='Search...' size='small'
            slotProps={{ input: { startAdornment: <i className='tabler-search text-textSecondary me-2' /> } }} sx={{ minWidth: 200 }} />
          <FormControl size='small' sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select label='Status' value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='Paid'>Paid</MenuItem>
              <MenuItem value='Unpaid'>Unpaid</MenuItem>
              <MenuItem value='Canceled'>Canceled</MenuItem>
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
                <tr><td colSpan={columns.length} className='text-center py-8'><Typography color='text.disabled'>No transactions found</Typography></td></tr>
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

      <AddTransactionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSaved={loadTransactions} />
    </>
  )
}

export default TransactionsPageClient
