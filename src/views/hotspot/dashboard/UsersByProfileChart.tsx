'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type Profile = {
  name: string
  count: number
}

type Props = {
  profiles: Profile[]
}

const COLORS = [
  'var(--mui-palette-primary-main)',
  'var(--mui-palette-success-main)',
  'var(--mui-palette-warning-main)',
  'var(--mui-palette-info-main)',
  'var(--mui-palette-error-main)'
]

const UsersByProfileChart = ({ profiles }: Props) => {
  const theme = useTheme()

  const labels = profiles.map(p => p.name)
  const series = profiles.map(p => p.count)
  const total = series.reduce((a, b) => a + b, 0)

  const options: ApexOptions = {
    chart: { type: 'donut', parentHeightOffset: 0 },
    labels,
    colors: COLORS.slice(0, profiles.length),
    legend: {
      position: 'bottom',
      labels: { colors: 'var(--mui-palette-text-secondary)' }
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Users',
              fontSize: '13px',
              color: 'var(--mui-palette-text-secondary)',
              fontFamily: theme.typography.fontFamily,
              formatter: () => String(total)
            },
            value: {
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--mui-palette-text-primary)',
              fontFamily: theme.typography.fontFamily
            }
          }
        }
      }
    },
    stroke: { width: 0 },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    }
  }

  return (
    <Card className='bs-full'>
      <CardHeader title='Users by Profile' subheader='Distribution across plans' />
      <CardContent>
        {profiles.length === 0 ? (
          <div className='flex items-center justify-center h-48'>
            <Typography color='text.disabled'>No profiles configured</Typography>
          </div>
        ) : (
          <AppReactApexCharts type='donut' height={250} width='100%' series={series} options={options} />
        )}
      </CardContent>
    </Card>
  )
}

export default UsersByProfileChart
