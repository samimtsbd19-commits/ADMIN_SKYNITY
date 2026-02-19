'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

type RevenueReport = {
  type: 'revenue'
  totalRevenue: number
  totalTransactions: number
  byDate: { date: string; total: number }[]
  byMethod: { method: string; total: number }[]
}

type ActivationReport = {
  type: 'activation'
  totalCustomers: number
  byDate: { date: string; count: number }[]
  byStatus: { status: string; count: number }[]
}

type Report = RevenueReport | ActivationReport

const ReportsPageClient = () => {
  const [reportType, setReportType] = useState('revenue')
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hotspot/reports?type=${reportType}&from=${from}&to=${to}`)
      const data = await res.json()
      setReport(data)
    } finally {
      setLoading(false)
    }
  }, [reportType, from, to])

  useEffect(() => { loadReport() }, [loadReport])

  const statusColors: Record<string, string> = {
    Active: '#72E128', Inactive: '#8592A3', Suspended: '#FFB400', Banned: '#FF4C51', Disabled: '#26C6F9'
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Filters */}
      <Card>
        <CardContent>
          <div className='flex flex-wrap items-end gap-4'>
            <FormControl size='small' sx={{ minWidth: 140 }}>
              <InputLabel>Report Type</InputLabel>
              <Select label='Report Type' value={reportType} onChange={e => setReportType(e.target.value)}>
                <MenuItem value='revenue'>Revenue</MenuItem>
                <MenuItem value='activation'>Customer Activation</MenuItem>
              </Select>
            </FormControl>
            <CustomTextField label='From' type='date' size='small' value={from}
              onChange={e => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <CustomTextField label='To' type='date' size='small' value={to}
              onChange={e => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <Button variant='contained' onClick={loadReport} disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <i className='tabler-refresh text-lg' />}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && report.type === 'revenue' && (
        <>
          {/* Stats */}
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <Typography variant='body2' color='text.secondary'>Total Revenue</Typography>
                  <Typography variant='h4' className='font-bold'>${(report as RevenueReport).totalRevenue.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <Typography variant='body2' color='text.secondary'>Transactions</Typography>
                  <Typography variant='h4' className='font-bold'>{(report as RevenueReport).totalTransactions}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Revenue Chart */}
          <Card>
            <CardHeader title='Revenue Over Time' />
            <CardContent>
              <AppReactApexCharts
                type='area'
                height={300}
                options={{
                  chart: { toolbar: { show: false }, zoom: { enabled: false } },
                  dataLabels: { enabled: false },
                  stroke: { curve: 'smooth', width: 2 },
                  xaxis: { categories: (report as RevenueReport).byDate.map(d => d.date), labels: { rotate: -45 } },
                  yaxis: { labels: { formatter: v => `$${v}` } },
                  tooltip: { y: { formatter: (v: number) => `$${v.toFixed(2)}` } },
                  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } }
                }}
                series={[{ name: 'Revenue', data: (report as RevenueReport).byDate.map(d => d.total) }]}
              />
            </CardContent>
          </Card>

          {/* Payment Method Breakdown */}
          <Card>
            <CardHeader title='By Payment Method' />
            <CardContent>
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead><tr><th>Method</th><th>Total</th></tr></thead>
                  <tbody>
                    {(report as RevenueReport).byMethod.map(m => (
                      <tr key={m.method}>
                        <td><Chip label={m.method} size='small' variant='tonal' /></td>
                        <td><Typography variant='body2' className='font-medium'>${m.total.toFixed(2)}</Typography></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {report && report.type === 'activation' && (
        <>
          {/* Stats */}
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <Typography variant='body2' color='text.secondary'>New Customers</Typography>
                  <Typography variant='h4' className='font-bold'>{(report as ActivationReport).totalCustomers}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Activation Chart */}
          <Card>
            <CardHeader title='Customer Activations Over Time' />
            <CardContent>
              <AppReactApexCharts
                type='bar'
                height={300}
                options={{
                  chart: { toolbar: { show: false } },
                  dataLabels: { enabled: false },
                  xaxis: { categories: (report as ActivationReport).byDate.map(d => d.date), labels: { rotate: -45 } },
                  plotOptions: { bar: { borderRadius: 4 } }
                }}
                series={[{ name: 'Customers', data: (report as ActivationReport).byDate.map(d => d.count) }]}
              />
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader title='Customer Status Breakdown' />
            <CardContent>
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead><tr><th>Status</th><th>Count</th></tr></thead>
                  <tbody>
                    {(report as ActivationReport).byStatus.map(s => (
                      <tr key={s.status}>
                        <td><Chip label={s.status} size='small' variant='tonal' /></td>
                        <td><Typography variant='body2' className='font-medium'>{s.count}</Typography></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {loading && !report && (
        <div className='flex justify-center py-12'><CircularProgress /></div>
      )}
    </div>
  )
}

export default ReportsPageClient
