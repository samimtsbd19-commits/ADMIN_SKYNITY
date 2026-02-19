'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

type Props = { totalBytes: number; download: number; upload: number }

const TrafficSparkCard = ({ totalBytes, download, upload }: Props) => {
  const theme = useTheme()
  const infoColor = theme.palette.info.main

  // Sparkline area chart — sample trend data
  const series = [{ data: [40, 10, 65, 45, 30, 55, 70] }]

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' },
    grid: {
      show: false,
      padding: { top: 10, bottom: 15 }
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityTo: 0,
        opacityFrom: 1,
        shadeIntensity: 1,
        stops: [0, 100],
        colorStops: [
          [
            { offset: 0, opacity: 0.4, color: infoColor },
            { opacity: 0, offset: 100, color: 'var(--mui-palette-background-paper)' }
          ]
        ]
      }
    },
    theme: {
      monochrome: { enabled: true, shadeTo: 'light', shadeIntensity: 1, color: infoColor }
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
      <CardHeader title='Traffic Today' subheader='Download + Upload' className='pbe-0' />
      <AppReactApexCharts type='area' height={84} width='100%' options={options} series={series} />
      <CardContent className='flex flex-col pbs-0'>
        <div className='flex items-center justify-between flex-wrap gap-x-4 gap-y-0.5'>
          <Typography variant='h4' color='text.primary'>
            {formatBytes(totalBytes)}
          </Typography>
          <Typography variant='body2' color='info.main'>
            ↓{formatBytes(download)} ↑{formatBytes(upload)}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrafficSparkCard
