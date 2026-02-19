'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Component Imports
import OptionMenu from '@core/components/option-menu'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Last 24 hours labels
const hours = Array.from({ length: 12 }, (_, i) => {
  const h = new Date()
  h.setHours(h.getHours() - (11 - i) * 2, 0, 0, 0)
  return h.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

// Sample data — replace with real API data when available
const downloadSeries = [12, 45, 30, 80, 55, 120, 95, 200, 145, 170, 130, 90]
const uploadSeries = [5, 20, 15, 35, 25, 60, 45, 85, 65, 75, 55, 40]

const BandwidthChart = () => {
  const theme = useTheme()

  const options: ApexOptions = {
    chart: {
      type: 'area',
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: 'var(--mui-palette-text-secondary)' }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.05,
        shadeIntensity: 0.5
      }
    },
    colors: ['var(--mui-palette-primary-main)', 'var(--mui-palette-success-main)'],
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      padding: { top: -20, left: 0, right: 0 }
    },
    xaxis: {
      categories: hours,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '12px' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: '12px' },
        formatter: (val: number) => `${val} MB`
      }
    },
    tooltip: {
      shared: true,
      y: { formatter: (val: number) => `${val} MB` }
    }
  }

  const series = [
    { name: 'Download', data: downloadSeries },
    { name: 'Upload', data: uploadSeries }
  ]

  return (
    <Card>
      <CardHeader
        title='Bandwidth Usage'
        subheader='Last 24 hours (MB)'
        action={<OptionMenu options={['Last 24h', 'Last 7 days', 'Last 30 days']} />}
      />
      <CardContent className='pbs-0'>
        <AppReactApexCharts type='area' height={250} width='100%' series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default BandwidthChart
