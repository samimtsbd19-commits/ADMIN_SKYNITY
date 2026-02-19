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

type FormData = {
  name: string
  type: string
  price: string
  validity: string
  validityUnit: string
  rateLimit: string
  dataLimit: string
  sharedUsers: string
  autoRenew: string
  isActive: string
  description: string
}

type Props = {
  open: boolean
  onClose: () => void
  editPlan?: any
  onSaved: () => void
}

const AddEditPlanDrawer = ({ open, onClose, editPlan, onSaved }: Props) => {
  const isEdit = Boolean(editPlan)

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      name: '', type: 'Hotspot', price: '0', validity: '30', validityUnit: 'days',
      rateLimit: '1M/1M', dataLimit: '', sharedUsers: '1', autoRenew: 'false', isActive: 'true', description: ''
    }
  })

  useEffect(() => {
    if (editPlan) {
      reset({
        name: editPlan.name || '',
        type: editPlan.type || 'Hotspot',
        price: String(editPlan.price ?? 0),
        validity: String(editPlan.validity ?? 30),
        validityUnit: editPlan.validityUnit || 'days',
        rateLimit: editPlan.rateLimit || '1M/1M',
        dataLimit: editPlan.dataLimit ? String(editPlan.dataLimit) : '',
        sharedUsers: String(editPlan.sharedUsers ?? 1),
        autoRenew: String(editPlan.autoRenew ?? false),
        isActive: String(editPlan.isActive ?? true),
        description: editPlan.description || ''
      })
    } else {
      reset({
        name: '', type: 'Hotspot', price: '0', validity: '30', validityUnit: 'days',
        rateLimit: '1M/1M', dataLimit: '', sharedUsers: '1', autoRenew: 'false', isActive: 'true', description: ''
      })
    }
  }, [editPlan, reset])

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `/api/hotspot/plans/${editPlan.id}` : '/api/hotspot/plans'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        price: parseFloat(data.price) || 0,
        validity: parseInt(data.validity) || 30,
        sharedUsers: parseInt(data.sharedUsers) || 1,
        dataLimit: data.dataLimit ? parseInt(data.dataLimit) : null,
        autoRenew: data.autoRenew === 'true',
        isActive: data.isActive === 'true'
      })
    })
    if (res.ok) { onSaved(); onClose() }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}>
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{isEdit ? 'Edit Plan' : 'Add Plan'}</Typography>
        <IconButton onClick={onClose} size='small'><i className='tabler-x text-xl' /></IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6 overflow-y-auto'>
        <Controller name='name' control={control} rules={{ required: 'Name is required' }}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Plan Name' error={Boolean(errors.name)} helperText={errors.name?.message} />} />
        <Controller name='type' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Type'>
              <MenuItem value='Hotspot'>Hotspot</MenuItem>
              <MenuItem value='PPPoE'>PPPoE</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='price' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Price ($)' type='number' slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />} />
        <div className='flex gap-3'>
          <Controller name='validity' control={control}
            render={({ field }) => <CustomTextField {...field} fullWidth label='Validity' type='number' slotProps={{ htmlInput: { min: 1 } }} />} />
          <Controller name='validityUnit' control={control}
            render={({ field }) => (
              <CustomTextField {...field} select fullWidth label='Unit'>
                <MenuItem value='hours'>Hours</MenuItem>
                <MenuItem value='days'>Days</MenuItem>
                <MenuItem value='months'>Months</MenuItem>
              </CustomTextField>
            )} />
        </div>
        <Controller name='rateLimit' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Rate Limit' placeholder='2M/2M' helperText='Upload/Download e.g. 2M/5M' />} />
        <Controller name='dataLimit' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Data Limit (bytes)' placeholder='Empty = unlimited' type='number' />} />
        <Controller name='sharedUsers' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Shared Users' type='number' slotProps={{ htmlInput: { min: 1 } }} />} />
        <Controller name='isActive' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Status'>
              <MenuItem value='true'>Active</MenuItem>
              <MenuItem value='false'>Inactive</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='autoRenew' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Auto Renew'>
              <MenuItem value='false'>No</MenuItem>
              <MenuItem value='true'>Yes</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='description' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth multiline rows={2} label='Description' />} />
        <div className='flex gap-4 mt-2'>
          <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}>
            {isEdit ? 'Save Changes' : 'Create Plan'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>Cancel</Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddEditPlanDrawer
