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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import TablePagination from '@mui/material/TablePagination'
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
type Profile = { id: string; name: string; rateLimit: string }
type Voucher = {
  id: string
  code: string
  usedBy: string | null
  usedAt: string | null
  expiresAt: string | null
  createdAt: string
  profile: { name: string; rateLimit: string }
}

type GenerateForm = {
  profileId: string
  count: number
  expiresAt: string
}

const GenerateDialog = ({
  open,
  onClose,
  routerId,
  profiles,
  onGenerated
}: {
  open: boolean
  onClose: () => void
  routerId: string
  profiles: Profile[]
  onGenerated: (codes: string[]) => void
}) => {
  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<GenerateForm>({
    defaultValues: { profileId: '', count: 10, expiresAt: '' }
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = async (data: GenerateForm) => {
    const res = await fetch('/api/hotspot/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routerId,
        profileId: data.profileId,
        count: Number(data.count),
        expiresAt: data.expiresAt || null
      })
    })
    if (res.ok) {
      const result = await res.json()
      onGenerated(result.codes)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Generate Vouchers</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='flex flex-col gap-5'>
          <Controller
            name='profileId'
            control={control}
            rules={{ required: 'Please select a profile' }}
            render={({ field }) => (
              <CustomTextField {...field} select fullWidth label='Profile'
                error={Boolean(errors.profileId)} helperText={errors.profileId?.message}>
                <MenuItem value=''>— Select profile —</MenuItem>
                {profiles.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.rateLimit})</MenuItem>
                ))}
              </CustomTextField>
            )}
          />
          <Controller
            name='count'
            control={control}
            rules={{ required: true, min: 1, max: 100 }}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth type='number' label='Number of vouchers'
                inputProps={{ min: 1, max: 100 }}
                helperText='Maximum 100 vouchers per batch'
                error={Boolean(errors.count)} />
            )}
          />
          <Controller
            name='expiresAt'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth type='datetime-local' label='Expiry Date'
                InputLabelProps={{ shrink: true }}
                helperText='Optional — leave blank for no expiry' />
            )}
          />
        </DialogContent>
        <DialogActions className='px-6 pb-4'>
          <Button variant='outlined' color='secondary' onClick={onClose}>Cancel</Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <i className='tabler-ticket text-lg' />}>
            Generate
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

const VouchersPageClient = () => {
  const [routers, setRouters] = useState<Router[]>([])
  const [selectedRouter, setSelectedRouter] = useState<string>('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'used' | 'unused'>('all')
  const [page, setPage] = useState(0)
  const rowsPerPage = 20

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

  const loadVouchers = async (routerId: string) => {
    setLoading(true)
    const qs = new URLSearchParams({ routerId })
    if (statusFilter !== 'all') qs.set('status', statusFilter)
    try {
      const [vRes, pRes] = await Promise.all([
        fetch(`/api/hotspot/vouchers?${qs}`).then(r => r.json()),
        fetch(`/api/hotspot/profiles?routerId=${routerId}`).then(r => r.json())
      ])
      if (Array.isArray(vRes)) setVouchers(vRes)
      if (Array.isArray(pRes)) setProfiles(pRes)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRouter) loadVouchers(selectedRouter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRouter, statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this voucher?')) return
    await fetch(`/api/hotspot/vouchers/${id}`, { method: 'DELETE' })
    setVouchers(prev => prev.filter(v => v.id !== id))
  }

  const handlePrint = () => {
    const unused = vouchers.filter(v => !v.usedAt)
    const content = unused
      .map(v => `Code: ${v.code} | Profile: ${v.profile.name} | Rate: ${v.profile.rateLimit}`)
      .join('\n')
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(`<pre style="font-family:monospace;font-size:14px">${content}</pre>`)
      win.print()
    }
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

  const paginated = vouchers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <Typography variant='h5'>Vouchers</Typography>
          <Typography variant='body2' color='text.secondary'>
            {vouchers.filter(v => !v.usedAt).length} unused · {vouchers.filter(v => v.usedAt).length} used
          </Typography>
        </div>
        <div className='flex items-center gap-3 flex-wrap'>
          {loading && <CircularProgress size={20} />}
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select label='Status' value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='unused'>Unused</MenuItem>
              <MenuItem value='used'>Used</MenuItem>
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Router</InputLabel>
            <Select label='Router' value={selectedRouter} onChange={e => setSelectedRouter(e.target.value)}>
              {routers.map(r => <MenuItem key={r.id} value={r.id}>{r.name} — {r.host}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant='outlined' startIcon={<i className='tabler-printer text-lg' />} onClick={handlePrint}>
            Print
          </Button>
          <Button variant='contained' startIcon={<i className='tabler-ticket text-lg' />}
            onClick={() => setGenerateOpen(true)}>
            Generate
          </Button>
        </div>
      </div>

      <Card>
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Used By</TableCell>
                <TableCell>Used At</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align='center'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' className='py-10'>
                    <div className='flex flex-col items-center gap-2'>
                      <i className='tabler-ticket-off text-4xl text-textDisabled' />
                      <Typography color='text.disabled'>No vouchers found</Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(v => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <Typography className='font-mono font-bold tracking-widest' color='text.primary'>
                        {v.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <Typography variant='body2' className='font-medium'>{v.profile.name}</Typography>
                        <Typography variant='caption' color='text.disabled'>{v.profile.rateLimit}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={v.usedAt ? 'Used' : 'Unused'}
                        color={v.usedAt ? 'default' : 'success'}
                        variant='tonal'
                        size='small'
                      />
                    </TableCell>
                    <TableCell><Typography variant='body2'>{v.usedBy || '—'}</Typography></TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {v.usedAt ? new Date(v.usedAt).toLocaleString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{new Date(v.createdAt).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => handleDelete(v.id)}>
                          <i className='tabler-trash text-lg' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component='div'
          count={vouchers.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </Card>

      <GenerateDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        routerId={selectedRouter}
        profiles={profiles}
        onGenerated={() => loadVouchers(selectedRouter)}
      />
    </div>
  )
}

export default VouchersPageClient
