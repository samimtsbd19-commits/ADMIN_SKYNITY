'use client'

// React Imports
import { useEffect } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Hook Form Imports
import { useForm, Controller } from 'react-hook-form'

// Custom Component Imports
import CustomTextField from '@core/components/mui/TextField'

type Profile = { id: string; name: string; rateLimit: string }

type FormData = {
  username: string
  password: string
  profileId: string
  macAddress: string
  ipAddress: string
  limitUptime: string
  comment: string
}

type Props = {
  open: boolean
  onClose: () => void
  routerId: string
  profiles: Profile[]
  editUser?: any
  onSaved: () => void
}

const AddEditUserDrawer = ({ open, onClose, routerId, profiles, editUser, onSaved }: Props) => {
  const isEdit = Boolean(editUser)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      username: '',
      password: '',
      profileId: '',
      macAddress: '',
      ipAddress: '',
      limitUptime: '',
      comment: ''
    }
  })

  useEffect(() => {
    if (editUser) {
      reset({
        username: editUser.username || '',
        password: '',
        profileId: editUser.profileId || '',
        macAddress: editUser.macAddress || '',
        ipAddress: editUser.ipAddress || '',
        limitUptime: editUser.limitUptime || '',
        comment: editUser.comment || ''
      })
    } else {
      reset({ username: '', password: '', profileId: '', macAddress: '', ipAddress: '', limitUptime: '', comment: '' })
    }
  }, [editUser, reset])

  const onSubmit = async (data: FormData) => {
    const url = isEdit ? `/api/hotspot/users/${editUser.id}` : '/api/hotspot/users'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, routerId })
    })

    if (res.ok) {
      onSaved()
      onClose()
    }
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
    >
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{isEdit ? 'Edit User' : 'Add Hotspot User'}</Typography>
        <IconButton onClick={onClose} size='small'>
          <i className='tabler-x text-xl' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6'>
        <Controller
          name='username'
          control={control}
          rules={{ required: 'Username is required' }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Username'
              disabled={isEdit}
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
            />
          )}
        />
        <Controller
          name='password'
          control={control}
          rules={{ required: !isEdit ? 'Password is required' : false }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              type='password'
              label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
          )}
        />
        <Controller
          name='profileId'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Profile'>
              <MenuItem value=''>— None —</MenuItem>
              {profiles.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.rateLimit})
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
        <Controller
          name='macAddress'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='MAC Address'
              placeholder='AA:BB:CC:DD:EE:FF'
              helperText='Optional — bind user to a specific device'
            />
          )}
        />
        <Controller
          name='ipAddress'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='IP Address' placeholder='192.168.88.100' />
          )}
        />
        <Controller
          name='limitUptime'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Uptime Limit'
              placeholder='1h, 1d, 7d'
              helperText='Optional — e.g. 2h for 2 hours'
            />
          )}
        />
        <Controller
          name='comment'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth multiline rows={2} label='Comment' />
          )}
        />

        <div className='flex gap-4 mt-2'>
          <Button
            type='submit'
            variant='contained'
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
            fullWidth
          >
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddEditUserDrawer
