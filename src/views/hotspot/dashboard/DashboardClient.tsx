'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// Component Imports
import CardStatVertical from '@/components/card-statistics/Vertical'

// View Imports
import OnlineUsersSparkCard from './OnlineUsersSparkCard'
import TrafficSparkCard from './TrafficSparkCard'
import BandwidthChart from './BandwidthChart'
import UsersByProfileChart from './UsersByProfileChart'
import RecentSessionsTable from './RecentSessionsTable'
import RouterStatusCard from './RouterStatusCard'

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

  if (routers.length === 0 && !loading) {
    return (
      <Alert
        severity='info'
        action={
          <Button component={Link} href='/en/hotspot/routers' size='small' variant='outlined' color='info'>
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

      {/* ── Row 1: Page header ── */}
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
            <Button
              variant='outlined'
              size='small'
              startIcon={<i className='tabler-refresh text-lg' />}
              onClick={() => loadDashboardData(selectedRouter)}
              disabled={!selectedRouter}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Grid>

      {/* ── Row 2: Mini sparkline stat cards ── */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <OnlineUsersSparkCard count={stats?.onlineUsers ?? 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <TrafficSparkCard
          totalBytes={(stats?.totalDownload ?? 0) + (stats?.totalUpload ?? 0)}
          download={stats?.totalDownload ?? 0}
          upload={stats?.totalUpload ?? 0}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <CardStatVertical
          title='Total Users'
          subtitle='Registered accounts'
          stats={String(stats?.totalUsers ?? 0)}
          avatarColor='primary'
          avatarIcon='tabler-users'
          avatarSkin='light'
          avatarSize={44}
          chipText='All time'
          chipColor='primary'
          chipVariant='tonal'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <CardStatVertical
          title='Active Vouchers'
          subtitle='Unused codes'
          stats={String(stats?.activeVouchers ?? 0)}
          avatarColor='warning'
          avatarIcon='tabler-ticket'
          avatarSkin='light'
          avatarSize={44}
          chipText='Available'
          chipColor='warning'
          chipVariant='tonal'
        />
      </Grid>

      {/* ── Row 3: Traffic chart + Profile donut ── */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <BandwidthChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <UsersByProfileChart profiles={profileChartData} />
      </Grid>

      {/* ── Row 4: Active sessions + Router status ── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <RecentSessionsTable
          sessions={sessions}
          routerId={selectedRouter}
          onDisconnect={id => setSessions(prev => prev.filter((s: any) => s['.id'] !== id))}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <RouterStatusCard
          routers={routers}
          selectedRouter={selectedRouter}
          onSelect={id => setSelectedRouter(id)}
        />
      </Grid>

    </Grid>
  )
}

export default DashboardClient
