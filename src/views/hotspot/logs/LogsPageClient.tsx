'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'

type SystemLog = {
  id: string
  userId: string | null
  action: string
  target: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

const actionColor = (action: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  if (action.startsWith('CREATE')) return 'success'
  if (action.startsWith('DELETE')) return 'error'
  if (action.startsWith('UPDATE')) return 'warning'
  return 'default'
}

const LogsPageClient = () => {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      params.set('limit', '200')
      const res = await fetch(`/api/hotspot/logs?${params}`)
      const data = await res.json()
      if (Array.isArray(data)) setLogs(data)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => { loadLogs() }, [loadLogs])

  const filtered = search
    ? logs.filter(l =>
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.toLowerCase().includes(search.toLowerCase()) ||
        l.target?.toLowerCase().includes(search.toLowerCase())
      )
    : logs

  return (
    <Card>
      <CardHeader
        title='System Logs'
        subheader={`${filtered.length} entries`}
        action={
          <Button variant='outlined' startIcon={<i className='tabler-refresh text-lg' />} onClick={loadLogs} disabled={loading}>
            Refresh
          </Button>
        }
      />
      <CardContent>
        <div className='flex flex-wrap gap-4 mb-4'>
          <CustomTextField value={search} onChange={e => setSearch(e.target.value)} placeholder='Search logs...' size='small'
            slotProps={{ input: { startAdornment: <i className='tabler-search text-textSecondary me-2' /> } }} sx={{ minWidth: 220 }} />
          <CustomTextField label='From' type='date' size='small' value={from}
            onChange={e => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <CustomTextField label='To' type='date' size='small' value={to}
            onChange={e => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          {loading && <CircularProgress size={24} className='self-center' />}
        </div>
      </CardContent>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Details</th>
              <th>Target</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className='text-center py-8'><Typography color='text.disabled'>No logs found</Typography></td></tr>
            ) : (
              filtered.map(log => (
                <tr key={log.id}>
                  <td>
                    <Typography variant='caption' className='font-mono whitespace-nowrap'>
                      {new Date(log.createdAt).toLocaleString()}
                    </Typography>
                  </td>
                  <td><Chip label={log.action} color={actionColor(log.action)} variant='tonal' size='small' /></td>
                  <td><Typography variant='body2'>{log.details || '—'}</Typography></td>
                  <td><Typography variant='caption' className='font-mono text-xs'>{log.target || '—'}</Typography></td>
                  <td><Typography variant='caption'>{log.ipAddress || '—'}</Typography></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default LogsPageClient
