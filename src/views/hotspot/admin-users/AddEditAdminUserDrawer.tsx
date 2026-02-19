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
  username: string
  email: string
  password: string
  fullName: string
  role: string
  isActive: string
}

type Props = {
  open: boolean
  onClose: () => void
  editUser?: any
  onSaved: () => void
}

const AddEditAdminUserDrawer = ({ open, onClose, editUser, onSaved }: Props) => {
  const isEdit = Boolean(editUser)
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { username: '', email: '', password: '', fullName: '', role: 'Admin', isActive: 'true' }
  })

  useEffect(() => {
    if (editUser) {
      reset({
        username: editUser.username || '',
        email: editUser.email || '',
        password: '',
        fullName: editUser.fullName || '',
        role: editUser.role || 'Admin',
        isActive: String(editUser.isActive ?? true)
      })
    } else {
      reset({ username: '', email: '', password: '', fullName: '', role: 'Admin', isActive: 'true' })
    }
  }, [editUser, reset])

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `/api/hotspot/admin-users/${editUser.id}` : '/api/hotspot/admin-users'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, isActive: data.isActive === 'true' })
    })
    if (res.ok) { onSaved(); onClose() }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{isEdit ? 'Edit Admin User' : 'Add Admin User'}</Typography>
        <IconButton onClick={onClose} size='small'><i className='tabler-x text-xl' /></IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6'>
        <Controller name='fullName' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Full Name' />} />
        <Controller name='username' control={control} rules={{ required: 'Username is required' }}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Username' disabled={isEdit} error={Boolean(errors.username)} helperText={errors.username?.message} />} />
        <Controller name='email' control={control} rules={{ required: 'Email is required' }}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Email' type='email' error={Boolean(errors.email)} helperText={errors.email?.message} />} />
        <Controller name='password' control={control} rules={{ required: !isEdit ? 'Password is required' : false }}
          render={({ field }) => <CustomTextField {...field} fullWidth type='password' label={isEdit ? 'New Password (blank to keep)' : 'Password'} error={Boolean(errors.password)} helperText={errors.password?.message} />} />
        <Controller name='role' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Role'>
              <MenuItem value='SuperAdmin'>SuperAdmin</MenuItem>
              <MenuItem value='Admin'>Admin</MenuItem>
              <MenuItem value='Agent'>Agent</MenuItem>
              <MenuItem value='Sales'>Sales</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='isActive' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Status'>
              <MenuItem value='true'>Active</MenuItem>
              <MenuItem value='false'>Inactive</MenuItem>
            </CustomTextField>
          )} />
        <div className='flex gap-4 mt-2'>
          <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}>
            {isEdit ? 'Save Changes' : 'Create Admin'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>Cancel</Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddEditAdminUserDrawer
