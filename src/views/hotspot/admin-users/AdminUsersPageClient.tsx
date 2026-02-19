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
import CircularProgress from '@mui/material/CircularProgress'

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import AddEditAdminUserDrawer from './AddEditAdminUserDrawer'
import tableStyles from '@core/styles/table.module.css'

type AdminUser = {
  id: string
  username: string
  email: string
  fullName: string | null
  role: string
  isActive: boolean
  createdAt: string
}

const roleColors: Record<string, 'error' | 'primary' | 'info' | 'success'> = {
  SuperAdmin: 'error',
  Admin: 'primary',
  Agent: 'info',
  Sales: 'success'
}

const columnHelper = createColumnHelper<AdminUser>()

const AdminUsersPageClient = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hotspot/admin-users')
      const data = await res.json()
      if (Array.isArray(data)) setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this admin user?')) return
    await fetch(`/api/hotspot/admin-users/${id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.id !== id))
  }, [])

  const handleToggleActive = useCallback(async (user: AdminUser) => {
    await fetch(`/api/hotspot/admin-users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive })
    })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
  }, [])

  const filtered = useMemo(() => {
    if (!globalFilter) return users
    const q = globalFilter.toLowerCase()
    return users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q)
    )
  }, [users, globalFilter])

  const columns = useMemo<ColumnDef<AdminUser, any>[]>(
    () => [
      columnHelper.accessor('username', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='primary' size={34}>
              {(row.original.fullName || row.original.username).charAt(0).toUpperCase()}
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>{row.original.fullName || row.original.username}</Typography>
              <Typography variant='caption' color='text.disabled'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => <Chip label={row.original.role} color={roleColors[row.original.role] || 'default'} variant='tonal' size='small' />
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => <Chip label={row.original.isActive ? 'Active' : 'Inactive'} color={row.original.isActive ? 'success' : 'default'} variant='tonal' size='small' />
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
            <Tooltip title={row.original.isActive ? 'Deactivate' : 'Activate'}>
              <IconButton size='small' color={row.original.isActive ? 'warning' : 'success'} onClick={() => handleToggleActive(row.original)}>
                <i className={`tabler-${row.original.isActive ? 'ban' : 'check'} text-lg`} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Edit'>
              <IconButton size='small' onClick={() => { setEditUser(row.original); setDrawerOpen(true) }}>
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <>
      <Card>
        <CardHeader
          title='Admin Users'
          action={
            <Button variant='contained' startIcon={<i className='tabler-plus text-lg' />}
              onClick={() => { setEditUser(null); setDrawerOpen(true) }}>
              Add Admin
            </Button>
          }
        />
        <div className='flex flex-wrap gap-4 px-6 pb-4'>
          <CustomTextField value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder='Search...' size='small'
            slotProps={{ input: { startAdornment: <i className='tabler-search text-textSecondary me-2' /> } }} sx={{ minWidth: 200 }} />
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
                <tr><td colSpan={columns.length} className='text-center py-8'><Typography color='text.disabled'>No admin users found</Typography></td></tr>
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

      <AddEditAdminUserDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editUser={editUser} onSaved={loadUsers} />
    </>
  )
}

export default AdminUsersPageClient
