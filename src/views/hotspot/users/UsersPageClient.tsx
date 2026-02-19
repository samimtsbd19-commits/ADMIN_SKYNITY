'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Component Imports
import UsersTable from './UsersTable'
import Link from 'next/link'

type Router = { id: string; name: string; host: string; isActive: boolean }

const UsersPageClient = () => {
  const [routers, setRouters] = useState<Router[]>([])
  const [selectedRouter, setSelectedRouter] = useState<string>('')

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

  if (routers.length === 0) {
    return (
      <Alert
        severity='info'
        action={
          <Button component={Link} href='/hotspot/routers' size='small' variant='outlined' color='info'>
            Add Router
          </Button>
        }
      >
        <AlertTitle>No routers configured</AlertTitle>
        Add a MikroTik router first.
      </Alert>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <Typography variant='h5'>Hotspot Users</Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage users on your MikroTik hotspot
          </Typography>
        </div>
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Router</InputLabel>
          <Select label='Router' value={selectedRouter} onChange={e => setSelectedRouter(e.target.value)}>
            {routers.map(r => (
              <MenuItem key={r.id} value={r.id}>
                {r.name} — {r.host}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {selectedRouter && <UsersTable routerId={selectedRouter} />}
    </div>
  )
}

export default UsersPageClient
