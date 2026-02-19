'use client'

import { useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from '@core/components/mui/TextField'

type Plan = { id: string; name: string; rateLimit: string; price: number }
type Router = { id: string; name: string }

type FormData = {
  username: string
  password: string
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  serviceType: string
  accountType: string
  status: string
  balance: string
  autoRenew: string
  planId: string
  routerId: string
}

type Props = {
  open: boolean
  onClose: () => void
  editCustomer?: any
  onSaved: () => void
}

const AddEditCustomerDrawer = ({ open, onClose, editCustomer, onSaved }: Props) => {
  const isEdit = Boolean(editCustomer)
  const [plans, setPlans] = useState<Plan[]>([])
  const [routers, setRouters] = useState<Router[]>([])

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      username: '', password: '', fullName: '', email: '', phone: '',
      address: '', city: '', serviceType: 'Hotspot', accountType: 'Personal',
      status: 'Active', balance: '0', autoRenew: 'false', planId: '', routerId: ''
    }
  })

  useEffect(() => {
    fetch('/api/hotspot/plans').then(r => r.json()).then(d => { if (Array.isArray(d)) setPlans(d) })
    fetch('/api/hotspot/routers').then(r => r.json()).then(d => { if (Array.isArray(d)) setRouters(d) })
  }, [])

  useEffect(() => {
    if (editCustomer) {
      reset({
        username: editCustomer.username || '',
        password: '',
        fullName: editCustomer.fullName || '',
        email: editCustomer.email || '',
        phone: editCustomer.phone || '',
        address: editCustomer.address || '',
        city: editCustomer.city || '',
        serviceType: editCustomer.serviceType || 'Hotspot',
        accountType: editCustomer.accountType || 'Personal',
        status: editCustomer.status || 'Active',
        balance: String(editCustomer.balance ?? 0),
        autoRenew: String(editCustomer.autoRenew ?? false),
        planId: editCustomer.planId || '',
        routerId: editCustomer.routerId || ''
      })
    } else {
      reset({
        username: '', password: '', fullName: '', email: '', phone: '',
        address: '', city: '', serviceType: 'Hotspot', accountType: 'Personal',
        status: 'Active', balance: '0', autoRenew: 'false', planId: '', routerId: ''
      })
    }
  }, [editCustomer, reset])

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `/api/hotspot/customers/${editCustomer.id}` : '/api/hotspot/customers'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        balance: parseFloat(data.balance) || 0,
        autoRenew: data.autoRenew === 'true'
      })
    })
    if (res.ok) { onSaved(); onClose() }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 460 } } }}>
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{isEdit ? 'Edit Customer' : 'Add Customer'}</Typography>
        <IconButton onClick={onClose} size='small'><i className='tabler-x text-xl' /></IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6 overflow-y-auto'>
        <Controller name='fullName' control={control} rules={{ required: 'Full name is required' }}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Full Name' error={Boolean(errors.fullName)} helperText={errors.fullName?.message} />} />
        <Controller name='username' control={control} rules={{ required: 'Username is required' }}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Username' disabled={isEdit} error={Boolean(errors.username)} helperText={errors.username?.message} />} />
        <Controller name='password' control={control} rules={{ required: !isEdit ? 'Password is required' : false }}
          render={({ field }) => <CustomTextField {...field} fullWidth type='password' label={isEdit ? 'New Password (blank to keep)' : 'Password'} error={Boolean(errors.password)} helperText={errors.password?.message} />} />
        <Controller name='email' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Email' type='email' />} />
        <Controller name='phone' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Phone' />} />
        <Controller name='address' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Address' />} />
        <Controller name='city' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='City' />} />
        <Controller name='serviceType' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Service Type'>
              <MenuItem value='Hotspot'>Hotspot</MenuItem>
              <MenuItem value='PPPoE'>PPPoE</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='accountType' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Account Type'>
              <MenuItem value='Personal'>Personal</MenuItem>
              <MenuItem value='Business'>Business</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='status' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Status'>
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Inactive'>Inactive</MenuItem>
              <MenuItem value='Suspended'>Suspended</MenuItem>
              <MenuItem value='Banned'>Banned</MenuItem>
              <MenuItem value='Disabled'>Disabled</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='planId' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Plan'>
              <MenuItem value=''>— None —</MenuItem>
              {plans.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (${p.price})</MenuItem>)}
            </CustomTextField>
          )} />
        <Controller name='routerId' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Router'>
              <MenuItem value=''>— None —</MenuItem>
              {routers.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </CustomTextField>
          )} />
        <Controller name='balance' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Wallet Balance ($)' type='number' />} />
        <Controller name='autoRenew' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Auto Renew'>
              <MenuItem value='false'>No</MenuItem>
              <MenuItem value='true'>Yes</MenuItem>
            </CustomTextField>
          )} />
        <div className='flex gap-4 mt-2'>
          <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}>
            {isEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>Cancel</Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddEditCustomerDrawer
