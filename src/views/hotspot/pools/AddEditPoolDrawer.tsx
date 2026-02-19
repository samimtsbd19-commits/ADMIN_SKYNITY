'use client'

import { useEffect } from 'react'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from '@core/components/mui/TextField'

type Router = { id: string; name: string }

type FormData = {
  name: string
  range: string
  routerId: string
}

type Props = {
  open: boolean
  onClose: () => void
  editPool?: any
  routers: Router[]
  onSaved: () => void
}

const AddEditPoolDrawer = ({ open, onClose, editPool, routers, onSaved }: Props) => {
  const isEdit = Boolean(editPool)
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { name: '', range: '', routerId: '' }
  })

  useEffect(() => {
    if (editPool) {
      reset({ name: editPool.name || '', range: editPool.range || '', routerId: editPool.routerId || '' })
    } else {
      reset({ name: '', range: '', routerId: '' })
    }
  }, [editPool, reset])

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `/api/hotspot/pools/${editPool.id}` : '/api/hotspot/pools'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) { onSaved(); onClose() }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 380 } } }}>
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{isEdit ? 'Edit IP Pool' : 'Add IP Pool'}</Typography>
        <IconButton onClick={onClose} size='small'><i className='tabler-x text-xl' /></IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6'>
        <Controller name='name' control={control} rules={{ required: 'Pool name is required' }}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Pool Name' error={Boolean(errors.name)} helperText={errors.name?.message} />} />
        <Controller name='range' control={control} rules={{ required: 'IP range is required' }}
          render={({ field }) => <CustomTextField {...field} fullWidth label='IP Range' placeholder='192.168.1.2-192.168.1.254'
            helperText='Format: start-end e.g. 192.168.1.2-192.168.1.254'
            error={Boolean(errors.range)} />} />
        <Controller name='routerId' control={control} rules={{ required: 'Router is required' }}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Router' error={Boolean(errors.routerId)} helperText={errors.routerId?.message}>
              <MenuItem value=''>— Select Router —</MenuItem>
              {routers.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </CustomTextField>
          )} />
        <div className='flex gap-4 mt-2'>
          <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}>
            {isEdit ? 'Save Changes' : 'Create Pool'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>Cancel</Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddEditPoolDrawer
