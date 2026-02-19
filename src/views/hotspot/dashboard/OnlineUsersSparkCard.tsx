'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type Props = { count: number }

const OnlineUsersSparkCard = ({ count }: Props) => {
  const actionSelectedColor = 'var(--mui-palette-action-selected)'

  // Sparkline: simulate a recent trend with current count as the peak
  const base = Math.max(1, count)
  const series = [{ data: [Math.round(base * 0.6), Math.round(base * 0.4), Math.round(base * 0.8), Math.round(base * 0.5), Math.round(base * 0.7), Math.round(base * 0.9), base] }]

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: false,
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    tooltip: { enabled: false },
    legend: { show: false },
    dataLabels: { enabled: false },
    colors: ['var(--mui-palette-success-main)'],
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        horizontal: false,
        columnWidth: '32%',
        colors: {
          backgroundBarRadius: 5,
          backgroundBarColors: Array(7).fill(actionSelectedColor)
        }
      }
    },
    grid: {
      show: false,
      padding: { left: -3, right: 5, top: 15, bottom: 18 }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: { show: false }
  }

  return (
    <Card>
      <CardHeader title='Online Users' subheader='Right Now' className='pbe-0' />
      <CardContent className='flex flex-col'>
        <AppReactApexCharts type='bar' height={84} width='100%' options={options} series={series} />
        <div className='flex items-center justify-between flex-wrap gap-x-4 gap-y-0.5'>
          <Typography variant='h4' color='text.primary'>
            {count}
          </Typography>
          <Typography variant='body2' color='success.main'>
            Active
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default OnlineUsersSparkCard
