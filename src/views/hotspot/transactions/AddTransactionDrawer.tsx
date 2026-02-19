'use client'

import { useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from '@core/components/mui/TextField'

type Customer = { id: string; username: string; fullName: string }
type Plan = { id: string; name: string; price: number }

type FormData = {
  customerId: string
  planId: string
  amount: string
  paymentMethod: string
  status: string
  note: string
  expiresAt: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const AddTransactionDrawer = ({ open, onClose, onSaved }: Props) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      customerId: '', planId: '', amount: '', paymentMethod: 'Cash',
      status: 'Paid', note: '', expiresAt: ''
    }
  })

  useEffect(() => {
    fetch('/api/hotspot/customers').then(r => r.json()).then(d => { if (Array.isArray(d)) setCustomers(d) })
    fetch('/api/hotspot/plans').then(r => r.json()).then(d => { if (Array.isArray(d)) setPlans(d) })
  }, [])

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/hotspot/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        amount: parseFloat(data.amount) || 0,
        planId: data.planId || null,
        expiresAt: data.expiresAt || null
      })
    })
    if (res.ok) {
      onSaved()
      onClose()
      reset()
      setSelectedCustomer(null)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>Add Transaction</Typography>
        <IconButton onClick={onClose} size='small'><i className='tabler-x text-xl' /></IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-6'>
        <Controller name='customerId' control={control} rules={{ required: 'Customer is required' }}
          render={({ field }) => (
            <Autocomplete
              options={customers}
              getOptionLabel={c => `${c.fullName} (${c.username})`}
              value={selectedCustomer}
              onChange={(_, val) => {
                setSelectedCustomer(val)
                field.onChange(val?.id || '')
              }}
              renderInput={params => (
                <TextField {...params} label='Customer' error={Boolean(errors.customerId)} helperText={errors.customerId?.message} size='small' />
              )}
            />
          )} />
        <Controller name='planId' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Plan'
              onChange={e => {
                field.onChange(e)
                const plan = plans.find(p => p.id === e.target.value)
                if (plan) setValue('amount', String(plan.price))
              }}>
              <MenuItem value=''>— None —</MenuItem>
              {plans.map(p => <MenuItem key={p.id} value={p.id}>{p.name} (${p.price})</MenuItem>)}
            </CustomTextField>
          )} />
        <Controller name='amount' control={control} rules={{ required: 'Amount is required' }}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Amount ($)' type='number' slotProps={{ htmlInput: { min: 0, step: 0.01 } }} error={Boolean(errors.amount)} helperText={errors.amount?.message} />} />
        <Controller name='paymentMethod' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Payment Method'>
              <MenuItem value='Cash'>Cash</MenuItem>
              <MenuItem value='Balance'>Balance (Wallet)</MenuItem>
              <MenuItem value='Online'>Online</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='status' control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Status'>
              <MenuItem value='Paid'>Paid</MenuItem>
              <MenuItem value='Unpaid'>Unpaid</MenuItem>
            </CustomTextField>
          )} />
        <Controller name='expiresAt' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth label='Expires At' type='date' slotProps={{ inputLabel: { shrink: true } }} helperText='Optional — plan expiry date' />} />
        <Controller name='note' control={control}
          render={({ field }) => <CustomTextField {...field} fullWidth multiline rows={2} label='Note' />} />
        <div className='flex gap-4 mt-2'>
          <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}>
            Create Transaction
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>Cancel</Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddTransactionDrawer
