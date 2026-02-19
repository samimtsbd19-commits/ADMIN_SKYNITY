'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import CustomTextField from '@core/components/mui/TextField'

type Settings = Record<string, string>

const DEFAULTS: Settings = {
  app_name: 'SKYNITY',
  company_name: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  currency: 'USD',
  currency_symbol: '$',
  timezone: 'UTC',
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_pass: '',
  smtp_from: '',
  sms_gateway: '',
  sms_api_key: ''
}

const TIMEZONES = ['UTC', 'Asia/Kuala_Lumpur', 'Asia/Jakarta', 'Asia/Singapore', 'Asia/Bangkok', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris']
const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'MYR', symbol: 'RM' },
  { code: 'IDR', symbol: 'Rp' },
  { code: 'THB', symbol: '฿' }
]

const SettingsPageClient = () => {
  const [tab, setTab] = useState(0)
  const [settings, setSettings] = useState<Settings>({ ...DEFAULTS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/hotspot/settings')
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/hotspot/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof typeof DEFAULTS, label: string, type = 'text', helperText?: string) => (
    <Grid size={{ xs: 12, sm: 6 }}>
      <CustomTextField
        fullWidth
        label={label}
        type={type}
        value={settings[key] ?? ''}
        onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
        helperText={helperText}
      />
    </Grid>
  )

  if (loading) return <div className='flex justify-center py-16'><CircularProgress /></div>

  return (
    <Card>
      <CardHeader title='System Settings' />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
        <Tab label='General' icon={<i className='tabler-settings text-lg' />} iconPosition='start' />
        <Tab label='Email / SMS' icon={<i className='tabler-mail text-lg' />} iconPosition='start' />
      </Tabs>

      <CardContent>
        {saved && <Alert severity='success' sx={{ mb: 3 }}>Settings saved successfully.</Alert>}

        {/* Tab 0 — General */}
        {tab === 0 && (
          <Grid container spacing={4}>
            {field('app_name', 'App Name')}
            {field('company_name', 'Company Name')}
            {field('company_email', 'Company Email', 'email')}
            {field('company_phone', 'Company Phone')}
            <Grid size={{ xs: 12 }}>
              {field('company_address', 'Company Address')}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth select
                label='Currency'
                value={settings.currency ?? 'USD'}
                onChange={e => {
                  const cur = CURRENCIES.find(c => c.code === e.target.value)
                  setSettings(prev => ({ ...prev, currency: e.target.value, currency_symbol: cur?.symbol ?? '$' }))
                }}
              >
                {CURRENCIES.map(c => <MenuItem key={c.code} value={c.code}>{c.code} ({c.symbol})</MenuItem>)}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth select
                label='Timezone'
                value={settings.timezone ?? 'UTC'}
                onChange={e => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              >
                {TIMEZONES.map(tz => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
              </CustomTextField>
            </Grid>
          </Grid>
        )}

        {/* Tab 1 — Email / SMS */}
        {tab === 1 && (
          <div className='flex flex-col gap-6'>
            <div>
              <Typography variant='subtitle2' className='mb-3 font-semibold'>Email (SMTP)</Typography>
              <Grid container spacing={4}>
                {field('smtp_host', 'SMTP Host')}
                {field('smtp_port', 'SMTP Port', 'number')}
                {field('smtp_user', 'SMTP Username')}
                {field('smtp_pass', 'SMTP Password', 'password')}
                {field('smtp_from', 'From Email', 'email')}
              </Grid>
            </div>
            <div>
              <Typography variant='subtitle2' className='mb-3 font-semibold'>SMS Gateway</Typography>
              <Grid container spacing={4}>
                {field('sms_gateway', 'Gateway URL')}
                {field('sms_api_key', 'API Key', 'password')}
              </Grid>
            </div>
          </div>
        )}
      </CardContent>

      <CardActions sx={{ px: 4, pb: 4 }}>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : <i className='tabler-device-floppy text-lg' />}
        >
          Save Settings
        </Button>
      </CardActions>
    </Card>
  )
}

export default SettingsPageClient
