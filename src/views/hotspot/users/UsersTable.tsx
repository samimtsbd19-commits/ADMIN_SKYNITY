'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// MUI Imports
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

// Third-party Imports
import { rankItem } from '@tanstack/match-sorter-utils'

// TanStack Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import AddEditUserDrawer from './AddEditUserDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type HotspotUser = {
  id: string
  username: string
  disabled: boolean
  macAddress: string | null
  ipAddress: string | null
  limitUptime: string | null
  comment: string | null
  profileId: string | null
  profile: { name: string; rateLimit: string } | null
  createdAt: string
}

type Profile = { id: string; name: string; rateLimit: string }

type Props = {
  routerId: string
}

const columnHelper = createColumnHelper<HotspotUser>()

const UsersTable = ({ routerId }: Props) => {
  const [users, setUsers] = useState<HotspotUser[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editUser, setEditUser] = useState<HotspotUser | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hotspot/users?routerId=${routerId}`)
      const data = await res.json()
      if (Array.isArray(data)) setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [routerId])

  useEffect(() => {
    fetch(`/api/hotspot/profiles?routerId=${routerId}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProfiles(data) })
      .catch(() => {})
    loadUsers()
  }, [routerId, loadUsers])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this user? This will also remove them from the router.')) return
    await fetch(`/api/hotspot/users/${id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.id !== id))
  }, [])

  const handleToggleDisable = useCallback(async (user: HotspotUser) => {
    await fetch(`/api/hotspot/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: !user.disabled })
    })
    setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, disabled: !u.disabled } : u)))
  }, [])

  const filteredUsers = useMemo(() => {
    let data = users
    if (statusFilter === 'active') data = data.filter(u => !u.disabled)
    if (statusFilter === 'disabled') data = data.filter(u => u.disabled)
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      data = data.filter(
        u =>
          u.username.toLowerCase().includes(q) ||
          u.macAddress?.toLowerCase().includes(q) ||
          u.profile?.name.toLowerCase().includes(q)
      )
    }
    return data
  }, [users, statusFilter, globalFilter])

  const columns = useMemo<ColumnDef<HotspotUser, any>[]>(
    () => [
      columnHelper.accessor('username', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.username}
            </Typography>
            {row.original.comment && (
              <Typography variant='caption' color='text.disabled'>
                {row.original.comment}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('profile', {
        header: 'Profile',
        cell: ({ row }) =>
          row.original.profile ? (
            <div className='flex flex-col'>
              <Typography variant='body2' className='font-medium'>
                {row.original.profile.name}
              </Typography>
              <Typography variant='caption' color='text.disabled'>
                {row.original.profile.rateLimit}
              </Typography>
            </div>
          ) : (
            <Typography variant='body2' color='text.disabled'>
              —
            </Typography>
          )
      }),
      columnHelper.accessor('macAddress', {
        header: 'MAC Address',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-mono text-xs'>
            {row.original.macAddress || '—'}
          </Typography>
        )
      }),
      columnHelper.accessor('ipAddress', {
        header: 'IP',
        cell: ({ row }) => (
          <Typography variant='body2'>{row.original.ipAddress || '—'}</Typography>
        )
      }),
      columnHelper.accessor('limitUptime', {
        header: 'Uptime Limit',
        cell: ({ row }) => (
          <Typography variant='body2'>{row.original.limitUptime || 'Unlimited'}</Typography>
        )
      }),
      columnHelper.accessor('disabled', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.disabled ? 'Disabled' : 'Active'}
            color={row.original.disabled ? 'error' : 'success'}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title={row.original.disabled ? 'Enable' : 'Disable'}>
              <IconButton
                size='small'
                color={row.original.disabled ? 'success' : 'warning'}
                onClick={() => handleToggleDisable(row.original)}
              >
                <i className={`tabler-${row.original.disabled ? 'check' : 'ban'} text-lg`} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Edit'>
              <IconButton
                size='small'
                onClick={() => {
                  setEditUser(row.original)
                  setDrawerOpen(true)
                }}
              >
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
    [handleDelete, handleToggleDisable]
  )

  const table = useReactTable({
    data: filteredUsers,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
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
          title='Hotspot Users'
          action={
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus text-lg' />}
              onClick={() => {
                setEditUser(null)
                setDrawerOpen(true)
              }}
            >
              Add User
            </Button>
          }
        />

        {/* Filters */}
        <div className='flex flex-wrap gap-4 px-6 pb-4'>
          <CustomTextField
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search users...'
            size='small'
            slotProps={{ input: { startAdornment: <i className='tabler-search text-textSecondary me-2' /> } }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label='Status'
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='disabled'>Disabled</MenuItem>
            </Select>
          </FormControl>
          {loading && <CircularProgress size={24} className='self-center' />}
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} className='cursor-pointer'>
                      <div className='flex items-center gap-1'>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{
                          asc: <i className='tabler-chevron-up text-sm' />,
                          desc: <i className='tabler-chevron-down text-sm' />
                        }[h.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center py-8'>
                    <Typography color='text.disabled'>No users found</Typography>
                  </td>
                </tr>
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
          count={filteredUsers.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      <AddEditUserDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        routerId={routerId}
        profiles={profiles}
        editUser={editUser}
        onSaved={loadUsers}
      />
    </>
  )
}

export default UsersTable
