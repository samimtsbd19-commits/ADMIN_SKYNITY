'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type Router = {
  id: string
  name: string
  host: string
  port: number
  username: string
  useHttps: boolean
  isActive: boolean
  createdAt: string
}

type FormData = {
  name: string
  host: string
  port: number
  username: string
  password: string
  useHttps: boolean
}

type TestResult = { ok: boolean; version?: string; error?: string }

const RouterDrawer = ({
  open,
  onClose,
  editRouter,
  onSaved
}: {
  open: boolean
  onClose: () => void
  editRouter?: Router | null
  onSaved: () => void
}) => {
  const isEdit = Boolean(editRouter)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [testing, setTesting] = useState(false)

  const { control, handleSubmit, reset, getValues, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: { name: '', host: '', port: 8728, username: 'admin', password: '', useHttps: false }
  })

  useEffect(() => {
    setTestResult(null)
    if (editRouter) {
      reset({
        name: editRouter.name,
        host: editRouter.host,
        port: editRouter.port,
        username: editRouter.username,
        password: '',
        useHttps: editRouter.useHttps
      })
    } else {
      reset({ name: '', host: '', port: 8728, username: 'admin', password: '', useHttps: false })
    }
  }, [editRouter, reset])

  const handleTest = async () => {
    if (!editRouter) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(`/api/hotspot/routers/${editRouter.id}`, { method: 'PATCH' })
      const data = await res.json()
      setTestResult(data)
    } finally {
      setTesting(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `/api/hotspot/routers/${editRouter!.id}` : '/api/hotspot/routers'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, port: Number(data.port) })
    })
    if (res.ok) { onSaved(); onClose() }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}>
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{isEdit ? 'Edit Router' : 'Add MikroTik Router'}</Typography>
        <IconButton onClick={onClose} size='small'><i className='tabler-x text-xl' /></IconButton>
      </div>
      <Divider />

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6'>
        <Controller name='name' control={control} rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Router Name' placeholder='Main Office Router'
              error={Boolean(errors.name)} helperText={errors.name?.message} />
          )}
        />
        <Controller name='host' control={control} rules={{ required: 'Host is required' }}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='IP Address / Hostname' placeholder='192.168.88.1'
              error={Boolean(errors.host)} helperText={errors.host?.message} />
          )}
        />
        <div className='flex gap-4'>
          <Controller name='port' control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth type='number' label='REST API Port'
                inputProps={{ min: 1, max: 65535 }}
                helperText='Default: 80 (HTTP) or 443 (HTTPS)' />
            )}
          />
          <Controller name='useHttps' control={control}
            render={({ field }) => (
              <div className='flex items-start pt-2'>
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label='HTTPS'
                />
              </div>
            )}
          />
        </div>
        <Controller name='username' control={control} rules={{ required: 'Username is required' }}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='Username'
              error={Boolean(errors.username)} helperText={errors.username?.message} />
          )}
        />
        <Controller name='password' control={control}
          rules={{ required: !isEdit ? 'Password is required' : false }}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth type='password'
              label={isEdit ? 'Password (leave blank to keep)' : 'Password'}
              error={Boolean(errors.password)} helperText={errors.password?.message} />
          )}
        />

        {testResult && (
          <Alert severity={testResult.ok ? 'success' : 'error'}>
            {testResult.ok
              ? `Connected! RouterOS v${testResult.version}`
              : `Connection failed: ${testResult.error}`}
          </Alert>
        )}

        <div className='flex gap-3 mt-2'>
          <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}>
            {isEdit ? 'Save Changes' : 'Add Router'}
          </Button>
          {isEdit && (
            <Button variant='outlined' color='info' onClick={handleTest} disabled={testing}
              startIcon={testing ? <CircularProgress size={16} /> : <i className='tabler-plug text-lg' />}>
              Test
            </Button>
          )}
          <Button variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Drawer>
  )
}

const RoutersPageClient = () => {
  const [routers, setRouters] = useState<Router[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRouter, setEditRouter] = useState<Router | null>(null)

  const loadRouters = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hotspot/routers')
      const data = await res.json()
      if (Array.isArray(data)) setRouters(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRouters() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this router? All associated users, profiles and vouchers will be removed.')) return
    await fetch(`/api/hotspot/routers/${id}`, { method: 'DELETE' })
    setRouters(prev => prev.filter(r => r.id !== id))
  }

  const handleSetActive = async (id: string) => {
    // Deactivate all, then activate selected
    await Promise.all(
      routers.map(r =>
        fetch(`/api/hotspot/routers/${r.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: r.id === id })
        })
      )
    )
    setRouters(prev => prev.map(r => ({ ...r, isActive: r.id === id })))
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <Typography variant='h5'>MikroTik Routers</Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage your router connections
          </Typography>
        </div>
        <div className='flex items-center gap-3'>
          {loading && <CircularProgress size={20} />}
          <Button variant='contained' startIcon={<i className='tabler-plus text-lg' />}
            onClick={() => { setEditRouter(null); setDrawerOpen(true) }}>
            Add Router
          </Button>
        </div>
      </div>

      <Card>
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Added</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' className='py-10'>
                    <div className='flex flex-col items-center gap-2'>
                      <i className='tabler-server-off text-4xl text-textDisabled' />
                      <Typography color='text.disabled'>No routers configured</Typography>
                      <Button variant='outlined' size='small'
                        onClick={() => { setEditRouter(null); setDrawerOpen(true) }}>
                        Add your first router
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                routers.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <i className='tabler-router text-primary text-xl' />
                        <Typography className='font-medium' color='text.primary'>{r.name}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' className='font-mono'>{r.host}</Typography>
                    </TableCell>
                    <TableCell><Typography variant='body2'>{r.port}</Typography></TableCell>
                    <TableCell><Typography variant='body2'>{r.username}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        label={r.useHttps ? 'HTTPS' : 'HTTP'}
                        size='small'
                        color={r.useHttps ? 'success' : 'default'}
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.isActive ? 'Active' : 'Inactive'}
                        size='small'
                        color={r.isActive ? 'primary' : 'default'}
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{new Date(r.createdAt).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <div className='flex items-center justify-center gap-1'>
                        {!r.isActive && (
                          <Tooltip title='Set as active router'>
                            <IconButton size='small' color='primary' onClick={() => handleSetActive(r.id)}>
                              <i className='tabler-check text-lg' />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title='Edit'>
                          <IconButton size='small' onClick={() => { setEditRouter(r); setDrawerOpen(true) }}>
                            <i className='tabler-edit text-lg' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete'>
                          <IconButton size='small' color='error' onClick={() => handleDelete(r.id)}>
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

      <RouterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editRouter={editRouter}
        onSaved={loadRouters}
      />
    </div>
  )
}

export default RoutersPageClient
