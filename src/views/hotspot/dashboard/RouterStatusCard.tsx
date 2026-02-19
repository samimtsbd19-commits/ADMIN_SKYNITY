'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

// Component Imports
import OptionMenu from '@core/components/option-menu'

type Router = { id: string; name: string; host: string; isActive: boolean }

type Props = {
  routers: Router[]
  selectedRouter: string
  onSelect: (id: string) => void
}

const RouterStatusCard = ({ routers, selectedRouter, onSelect }: Props) => {
  const activeCount = routers.filter(r => r.isActive).length

  return (
    <Card className='bs-full'>
      <CardHeader
        title='Router Status'
        subheader={`${activeCount} of ${routers.length} active`}
        action={<OptionMenu options={['Refresh', 'Manage Routers']} />}
      />
      <CardContent className='flex flex-col gap-4'>
        {routers.length === 0 ? (
          <div className='flex flex-col items-center gap-3 py-6'>
            <i className='tabler-server-off text-[48px] text-textDisabled' />
            <Typography color='text.disabled' variant='body2' textAlign='center'>
              No routers configured yet
            </Typography>
            <Button component={Link} href='/en/hotspot/routers' variant='outlined' size='small'>
              Add Router
            </Button>
          </div>
        ) : (
          routers.map(router => (
            <div
              key={router.id}
              className='flex items-center gap-4 cursor-pointer rounded-lg px-2 py-1 transition-colors'
              style={{
                backgroundColor:
                  router.id === selectedRouter
                    ? 'var(--mui-palette-action-selected)'
                    : 'transparent'
              }}
              onClick={() => onSelect(router.id)}
            >
              <div
                className='flex items-center justify-center rounded-full'
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: router.isActive
                    ? 'var(--mui-palette-success-lightOpacity)'
                    : 'var(--mui-palette-error-lightOpacity)'
                }}
              >
                <i
                  className='tabler-router text-[20px]'
                  style={{ color: router.isActive ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)' }}
                />
              </div>
              <div className='flex flex-wrap justify-between items-center gap-x-4 gap-y-1 flex-1'>
                <div className='flex flex-col'>
                  <Typography className='font-medium' color='text.primary'>
                    {router.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {router.host}
                  </Typography>
                </div>
                <Chip
                  label={router.isActive ? 'Active' : 'Inactive'}
                  color={router.isActive ? 'success' : 'error'}
                  variant='tonal'
                  size='small'
                />
              </div>
            </div>
          ))
        )}
        {routers.length > 0 && (
          <Button
            component={Link}
            href='/en/hotspot/routers'
            variant='outlined'
            size='small'
            fullWidth
            startIcon={<i className='tabler-settings text-base' />}
            sx={{ mt: 1 }}
          >
            Manage Routers
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default RouterStatusCard
