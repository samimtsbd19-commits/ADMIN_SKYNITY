'use client'

// React Imports
import { useState, useEffect } from 'react'

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
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type Router = { id: string; name: string; host: string; isActive: boolean }

type HotspotProfile = {
  id: string
  name: string
  rateLimit: string
  sharedUsers: number
  sessionTimeout: string | null
  idleTimeout: string | null
  addressPool: string | null
  _count: { users: number; vouchers: number }
}

type FormData = {
  name: string
  rateLimit: string
  sharedUsers: number
  sessionTimeout: string
  idleTimeout: string
  addressPool: string
}

type ProfileDrawerProps = {
  open: boolean
  onClose: () => void
  routerId: string
  editProfile?: HotspotProfile | null
  onSaved: () => void
}

const ProfileDrawer = ({ open, onClose, routerId, editProfile, onSaved }: ProfileDrawerProps) => {
  const isEdit = Boolean(editProfile)
  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: { name: '', rateLimit: '0/0', sharedUsers: 1, sessionTimeout: '', idleTimeout: '', addressPool: '' }
  })

  useEffect(() => {
    if (editProfile) {
      reset({
        name: editProfile.name,
        rateLimit: editProfile.rateLimit,
        sharedUsers: editProfile.sharedUsers,
        sessionTimeout: editProfile.sessionTimeout || '',
        idleTimeout: editProfile.idleTimeout || '',
        addressPool: editProfile.addressPool || ''
      })
    } else {
      reset({ name: '', rateLimit: '0/0', sharedUsers: 1, sessionTimeout: '', idleTimeout: '', addressPool: '' })
    }
  }, [editProfile, reset])

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `/api/hotspot/profiles/${editProfile!.id}` : '/api/hotspot/profiles'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, routerId, sharedUsers: Number(data.sharedUsers) })
    })
    if (res.ok) { onSaved(); onClose() }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{isEdit ? 'Edit Profile' : 'Add Profile'}</Typography>
        <IconButton onClick={onClose} size='small'><i className='tabler-x text-xl' /></IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6'>
        <Controller name='name' control={control} rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Profile Name' error={Boolean(errors.name)} helperText={errors.name?.message} />
          )}
        />
        <Controller name='rateLimit' control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Rate Limit' placeholder='2M/2M' helperText='Format: upload/download (e.g. 5M/10M)' />
          )}
        />
        <Controller name='sharedUsers' control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth type='number' label='Shared Users' inputProps={{ min: 1 }} />
          )}
        />
        <Controller name='sessionTimeout' control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Session Timeout' placeholder='1h, 8h, 1d' helperText='Optional — 0 for unlimited' />
          )}
        />
        <Controller name='idleTimeout' control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Idle Timeout' placeholder='5m, 30m' />
          )}
        />
        <Controller name='addressPool' control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Address Pool' placeholder='hs-pool-1' />
          )}
        />
        <div className='flex gap-4 mt-2'>
          <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}>
            {isEdit ? 'Save Changes' : 'Create Profile'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>Cancel</Button>
        </div>
      </form>
    </Drawer>
  )
}

const ProfilesPageClient = () => {
  const [routers, setRouters] = useState<Router[]>([])
  const [selectedRouter, setSelectedRouter] = useState<string>('')
  const [profiles, setProfiles] = useState<HotspotProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editProfile, setEditProfile] = useState<HotspotProfile | null>(null)

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

  const loadProfiles = async (routerId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hotspot/profiles?routerId=${routerId}`)
      const data = await res.json()
      if (Array.isArray(data)) setProfiles(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRouter) loadProfiles(selectedRouter)
  }, [selectedRouter])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile? Users on this profile will be unassigned.')) return
    await fetch(`/api/hotspot/profiles/${id}`, { method: 'DELETE' })
    setProfiles(prev => prev.filter(p => p.id !== id))
  }

  if (routers.length === 0) {
    return (
      <Alert severity='info'
        action={<Button component={Link} href='/hotspot/routers' size='small' variant='outlined' color='info'>Add Router</Button>}>
        <AlertTitle>No routers configured</AlertTitle>
        Add a MikroTik router first.
      </Alert>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <Typography variant='h5'>Hotspot Profiles</Typography>
          <Typography variant='body2' color='text.secondary'>Bandwidth plans and access policies</Typography>
        </div>
        <div className='flex items-center gap-3'>
          {loading && <CircularProgress size={20} />}
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Router</InputLabel>
            <Select label='Router' value={selectedRouter} onChange={e => setSelectedRouter(e.target.value)}>
              {routers.map(r => <MenuItem key={r.id} value={r.id}>{r.name} — {r.host}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant='contained' startIcon={<i className='tabler-plus text-lg' />}
            onClick={() => { setEditProfile(null); setDrawerOpen(true) }}>
            Add Profile
          </Button>
        </div>
      </div>

      <Card>
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Rate Limit</TableCell>
                <TableCell>Shared Users</TableCell>
                <TableCell>Session Timeout</TableCell>
                <TableCell>Idle Timeout</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Vouchers</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' className='py-10'>
                    <div className='flex flex-col items-center gap-2'>
                      <i className='tabler-gauge-off text-4xl text-textDisabled' />
                      <Typography color='text.disabled'>No profiles found</Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Typography className='font-medium' color='text.primary'>{p.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={p.rateLimit || 'Unlimited'} size='small' color='primary' variant='tonal' icon={<i className='tabler-gauge text-sm' />} />
                    </TableCell>
                    <TableCell><Typography variant='body2'>{p.sharedUsers}</Typography></TableCell>
                    <TableCell><Typography variant='body2'>{p.sessionTimeout || '—'}</Typography></TableCell>
                    <TableCell><Typography variant='body2'>{p.idleTimeout || '—'}</Typography></TableCell>
                    <TableCell>
                      <Chip label={p._count.users} size='small' color='info' variant='tonal' />
                    </TableCell>
                    <TableCell>
                      <Chip label={p._count.vouchers} size='small' color='warning' variant='tonal' />
                    </TableCell>
                    <TableCell align='center'>
                      <div className='flex items-center justify-center gap-1'>
                        <Tooltip title='Edit'>
                          <IconButton size='small' onClick={() => { setEditProfile(p); setDrawerOpen(true) }}>
                            <i className='tabler-edit text-lg' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete'>
                          <IconButton size='small' color='error' onClick={() => handleDelete(p.id)}>
                            <i className='tabler-trash text-lg' />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        routerId={selectedRouter}
        editProfile={editProfile}
        onSaved={() => loadProfiles(selectedRouter)}
      />
    </div>
  )
}

export default ProfilesPageClient
