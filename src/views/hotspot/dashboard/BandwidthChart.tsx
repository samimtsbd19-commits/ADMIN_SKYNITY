'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import type { ApexOptions } from 'apexcharts'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type TabCategory = 'download' | 'upload' | 'combined' | 'users'

type TabType = {
  type: TabCategory
  avatarIcon: string
  label: string
  series: { data: number[] }[]
}

// Last 9 time-window labels
const hours = Array.from({ length: 9 }, (_, i) => {
  const h = new Date()
  h.setHours(h.getHours() - (8 - i) * 3, 0, 0, 0)
  return h.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const tabData: TabType[] = [
  {
    type: 'download',
    avatarIcon: 'tabler-arrow-bar-to-down',
    label: 'Download',
    series: [{ data: [120, 80, 200, 150, 90, 180, 250, 210, 170] }]
  },
  {
    type: 'upload',
    avatarIcon: 'tabler-arrow-bar-to-up',
    label: 'Upload',
    series: [{ data: [45, 30, 85, 60, 40, 70, 95, 80, 65] }]
  },
  {
    type: 'combined',
    avatarIcon: 'tabler-arrows-transfer-up-down',
    label: 'Combined',
    series: [{ data: [165, 110, 285, 210, 130, 250, 345, 290, 235] }]
  },
  {
    type: 'users',
    avatarIcon: 'tabler-wifi',
    label: 'Sessions',
    series: [{ data: [8, 5, 12, 10, 7, 14, 18, 15, 11] }]
  }
]

const BandwidthChart = () => {
  const [value, setValue] = useState<TabCategory>('download')
  const theme = useTheme()
  const disabledText = 'var(--mui-palette-text-disabled)'

  const handleChange = (_event: SyntheticEvent, newValue: TabCategory) => {
    setValue(newValue)
  }

  const colors = Array(9).fill('var(--mui-palette-primary-lightOpacity)')

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        distributed: true,
        columnWidth: '33%',
        borderRadiusApplication: 'end',
        dataLabels: { position: 'top' }
      }
    },
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: {
      offsetY: -11,
      formatter: (val: number) => (value === 'users' ? `${val}` : `${val}MB`),
      style: {
        fontWeight: 500,
        colors: ['var(--mui-palette-text-primary)'],
        fontSize: theme.typography.body1.fontSize as string
      }
    },
    colors,
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    grid: {
      show: false,
      padding: { top: -19, left: -4, right: 0, bottom: -11 }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { color: 'var(--mui-palette-divider)' },
      categories: hours,
      labels: {
        style: {
          colors: disabledText,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -18,
        formatter: (val: number) => (value === 'users' ? `${val}` : `${val}MB`),
        style: {
          colors: disabledText,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    responsive: [
      {
        breakpoint: 1450,
        options: { plotOptions: { bar: { columnWidth: '45%' } } }
      },
      {
        breakpoint: 600,
        options: { plotOptions: { bar: { columnWidth: '58%' } } }
      }
    ]
  }

  const renderTabs = () =>
    tabData.map((item, index) => (
      <Tab
        key={index}
        value={item.type}
        className='mie-4'
        label={
          <div
            className={classnames(
              'flex flex-col items-center justify-center gap-2 is-[110px] bs-[100px] border rounded-xl',
              item.type === value ? 'border-solid border-[var(--mui-palette-primary-main)]' : 'border-dashed'
            )}
          >
            <CustomAvatar
              variant='rounded'
              skin='light'
              size={38}
              {...(item.type === value && { color: 'primary' })}
            >
              <i
                className={classnames('text-[22px]', { 'text-textSecondary': item.type !== value }, item.avatarIcon)}
              />
            </CustomAvatar>
            <Typography className='font-medium capitalize' color='text.primary'>
              {item.label}
            </Typography>
          </div>
        }
      />
    ))

  const renderTabPanels = () =>
    tabData.map((item, index) => {
      const max = Math.max(...item.series[0].data)
      const seriesIndex = item.series[0].data.indexOf(max)
      const finalColors = colors.map((color, i) =>
        seriesIndex === i ? 'var(--mui-palette-primary-main)' : color
      )

      return (
        <TabPanel key={index} value={item.type} className='!p-0'>
          <AppReactApexCharts
            type='bar'
            height={233}
            width='100%'
            options={{ ...options, colors: finalColors }}
            series={item.series}
          />
        </TabPanel>
      )
    })

  return (
    <Card>
      <CardHeader
        title='Hotspot Traffic'
        subheader='Last 24-Hour Overview'
        action={<OptionMenu options={['Last 24h', 'Last 7 days', 'Last 30 days']} />}
      />
      <CardContent>
        <TabContext value={value}>
          <TabList
            variant='scrollable'
            scrollButtons='auto'
            onChange={handleChange}
            aria-label='hotspot traffic tabs'
            className='!border-0 mbe-10'
            sx={{
              '& .MuiTabs-indicator': { display: 'none !important' },
              '& .MuiTab-root': { padding: '0 !important', border: '0 !important' }
            }}
          >
            {renderTabs()}
          </TabList>
          {renderTabPanels()}
        </TabContext>
      </CardContent>
    </Card>
  )
}

export default BandwidthChart
