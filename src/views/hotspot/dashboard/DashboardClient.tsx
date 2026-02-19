'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// View Imports
import StatsCards from './StatsCards'
import BandwidthChart from './BandwidthChart'
import UsersByProfileChart from './UsersByProfileChart'
import RecentSessionsTable from './RecentSessionsTable'

// Link Import
import Link from 'next/link'

type Router = { id: string; name: string; host: string; isActive: boolean }
type Stats = {
  totalUsers: number
  onlineUsers: number
  activeVouchers: number
  totalDownload: number
  totalUpload: number
}
type Session = any
type Profile = { id: string; name: string; _count: { users: number } }

const DashboardClient = () => {
  const [routers, setRouters] = useState<Router[]>([])
  const [selectedRouter, setSelectedRouter] = useState<string>('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  // Load routers on mount
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

  const loadDashboardData = useCallback(async (routerId: string) => {
    if (!routerId) return
    setLoading(true)
    try {
      const [statsRes, sessionsRes, profilesRes] = await Promise.allSettled([
        fetch(`/api/hotspot/stats?routerId=${routerId}`).then(r => r.json()),
        fetch(`/api/hotspot/sessions?routerId=${routerId}`).then(r => r.json()),
        fetch(`/api/hotspot/profiles?routerId=${routerId}`).then(r => r.json())
      ])

      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      if (sessionsRes.status === 'fulfilled' && Array.isArray(sessionsRes.value)) setSessions(sessionsRes.value)
      if (profilesRes.status === 'fulfilled' && Array.isArray(profilesRes.value)) setProfiles(profilesRes.value)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedRouter) loadDashboardData(selectedRouter)
  }, [selectedRouter, loadDashboardData])

  // Auto-refresh sessions every 30s
  useEffect(() => {
    if (!selectedRouter) return
    const interval = setInterval(() => {
      fetch(`/api/hotspot/sessions?routerId=${selectedRouter}`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setSessions(data) })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [selectedRouter])

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
        Add a MikroTik router to start managing your hotspot users.
      </Alert>
    )
  }

  const profileChartData = profiles.map(p => ({ name: p.name, count: p._count.users }))

  return (
    <Grid container spacing={6}>
      {/* Router Selector */}
      <Grid size={{ xs: 12 }}>
        <div className='flex items-center justify-between flex-wrap gap-4'>
          <div>
            <Typography variant='h5'>Hotspot Dashboard</Typography>
            <Typography variant='body2' color='text.secondary'>
              Real-time monitoring and management
            </Typography>
          </div>
          <div className='flex items-center gap-3'>
            {loading && <CircularProgress size={20} />}
            <FormControl size='small' sx={{ minWidth: 200 }}>
              <InputLabel>Router</InputLabel>
              <Select
                label='Router'
                value={selectedRouter}
                onChange={e => setSelectedRouter(e.target.value)}
              >
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
              onClick={() => loadDashboardData(selectedRouter)}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Grid>

      {/* Stats Cards */}
      {stats && (
        <StatsCards
          totalUsers={stats.totalUsers}
          onlineUsers={stats.onlineUsers}
          activeVouchers={stats.activeVouchers}
          totalDownload={stats.totalDownload}
          totalUpload={stats.totalUpload}
        />
      )}

      {/* Bandwidth Chart */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <BandwidthChart />
      </Grid>

      {/* Users by Profile Chart */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <UsersByProfileChart profiles={profileChartData} />
      </Grid>

      {/* Active Sessions Table */}
      <Grid size={{ xs: 12 }}>
        <RecentSessionsTable
          sessions={sessions}
          routerId={selectedRouter}
          onDisconnect={id => setSessions(prev => prev.filter((s: any) => s['.id'] !== id))}
        />
      </Grid>
    </Grid>
  )
}

export default DashboardClient
