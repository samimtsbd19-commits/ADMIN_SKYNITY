'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type StatCard = {
  title: string
  value: string | number
  icon: string
  color: 'primary' | 'success' | 'warning' | 'info' | 'error'
  subtitle?: string
}

type Props = {
  totalUsers: number
  onlineUsers: number
  activeVouchers: number
  totalDownload: number
  totalUpload: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCard) => (
  <Card className='bs-full'>
    <CardContent>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <Typography variant='h4' className='font-bold'>
            {value}
          </Typography>
          <Typography variant='subtitle2' color='text.secondary' className='mt-1'>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='caption' color='text.disabled'>
              {subtitle}
            </Typography>
          )}
        </div>
        <CustomAvatar variant='rounded' color={color} skin='light' size={52}>
          <i className={`${icon} text-[28px]`} />
        </CustomAvatar>
      </div>
    </CardContent>
  </Card>
)

const StatsCards = ({ totalUsers, onlineUsers, activeVouchers, totalDownload, totalUpload }: Props) => {
  const cards: StatCard[] = [
    {
      title: 'Online Users',
      value: onlineUsers,
      icon: 'tabler-wifi',
      color: 'success',
      subtitle: 'Active right now'
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: 'tabler-users',
      color: 'primary',
      subtitle: 'Registered accounts'
    },
    {
      title: 'Traffic Today',
      value: formatBytes(totalDownload + totalUpload),
      icon: 'tabler-arrows-transfer-up-down',
      color: 'info',
      subtitle: `↓ ${formatBytes(totalDownload)} / ↑ ${formatBytes(totalUpload)}`
    },
    {
      title: 'Active Vouchers',
      value: activeVouchers,
      icon: 'tabler-ticket',
      color: 'warning',
      subtitle: 'Unused codes'
    }
  ]

  return (
    <>
      {cards.map((card, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard {...card} />
        </Grid>
      ))}
    </>
  )
}

export default StatsCards
