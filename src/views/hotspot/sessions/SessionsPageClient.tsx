'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Link from 'next/link'

// Type Imports
import type { RosHotspotActive } from '@/libs/mikrotik/hotspot'
import { formatBytes } from '@/libs/mikrotik/hotspot'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type Router = { id: string; name: string; host: string; isActive: boolean }

const SessionsPageClient = () => {
  const [routers, setRouters] = useState<Router[]>([])
  const [selectedRouter, setSelectedRouter] = useState<string>('')
  const [sessions, setSessions] = useState<RosHotspotActive[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    fetch('/api/hotspot/routers')
      .then(r => r.json())
      .then((data: Router[]) => {
        setRouters(data)
        const active = data.find(r => r.isActive)
        if (active) setSelectedRouter(active.id)
      })
      .catch(() => {})
  }, [])

  const loadSessions = useCallback(async (routerId: string) => {
    if (!routerId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/hotspot/sessions?routerId=${routerId}`)
      const data = await res.json()
      if (Array.isArray(data)) setSessions(data)
      setLastRefresh(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedRouter) loadSessions(selectedRouter)
  }, [selectedRouter, loadSessions])

  // Auto-refresh every 30s
  useEffect(() => {
    if (!selectedRouter) return
    const interval = setInterval(() => loadSessions(selectedRouter), 30000)
    return () => clearInterval(interval)
  }, [selectedRouter, loadSessions])

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this user?')) return
    await fetch(`/api/hotspot/sessions/${id}?routerId=${selectedRouter}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s['.id'] !== id))
  }

  if (routers.length === 0) {
    return (
      <Alert
        severity='info'
        action={
          <Button component={Link} href='/hotspot/routers' size='small' variant='outlined' color='info'>
            Add Router
          </Button>
        }
      >
        <AlertTitle>No routers configured</AlertTitle>
        Add a MikroTik router first.
      </Alert>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <Typography variant='h5'>Active Sessions</Typography>
          <Typography variant='body2' color='text.secondary'>
            {sessions.length} users online
            {lastRefresh && (
              <span className='ml-2 text-xs text-textDisabled'>
                · Last updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </Typography>
        </div>
        <div className='flex items-center gap-3'>
          {loading && <CircularProgress size={20} />}
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Router</InputLabel>
            <Select label='Router' value={selectedRouter} onChange={e => setSelectedRouter(e.target.value)}>
              {routers.map(r => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} — {r.host}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='tabler-refresh text-lg' />}
            onClick={() => loadSessions(selectedRouter)}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>MAC Address</TableCell>
                <TableCell>Login By</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Download</TableCell>
                <TableCell>Upload</TableCell>
                <TableCell>Server</TableCell>
                <TableCell align='center'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' className='py-10'>
                    <div className='flex flex-col items-center gap-2'>
                      <i className='tabler-wifi-off text-4xl text-textDisabled' />
                      <Typography color='text.disabled'>No active sessions</Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map(s => (
                  <TableRow key={s['.id']}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <i className='tabler-user text-textSecondary' />
                        <Typography className='font-medium' color='text.primary'>
                          {s.user}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{s.address}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' className='font-mono text-xs'>
                        {s['mac-address']}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={s['login-by']} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell>
                      <Chip label={s.uptime} size='small' color='success' variant='tonal' />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <i className='tabler-arrow-down text-primary text-sm' />
                        <Typography variant='body2'>{formatBytes(s['bytes-in'])}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <i className='tabler-arrow-up text-success text-sm' />
                        <Typography variant='body2'>{formatBytes(s['bytes-out'])}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {s.server}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Tooltip title='Disconnect user'>
                        <IconButton size='small' color='error' onClick={() => handleDisconnect(s['.id'])}>
                          <i className='tabler-logout text-lg' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </div>
  )
}

export default SessionsPageClient
