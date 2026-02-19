'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

const WelcomeBanner = () => {
  const theme = useTheme()
  const [time, setTime] = useState('')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      const h = now.getHours()
      setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '40px solid rgba(255,255,255,0.08)',
          top: -60,
          right: -40
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '25px solid rgba(255,255,255,0.06)',
          bottom: -40,
          right: 80
        }}
      />

      <CardContent sx={{ position: 'relative', zIndex: 1, py: 5, px: 6 }}>
        <div className='flex items-center justify-between gap-4 flex-wrap'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h4' color='inherit' className='font-bold'>
              {greeting}, Admin!
            </Typography>
            <Typography color='rgba(255,255,255,0.85)' variant='body1'>
              Welcome to SKYNITY Hotspot Manager
            </Typography>
            <Typography color='rgba(255,255,255,0.65)' variant='body2' className='mt-1'>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {time && <span className='ml-3 font-mono'>{time}</span>}
            </Typography>
          </div>
          <div className='flex items-center gap-2 opacity-80'>
            <i className='tabler-router text-[80px]' style={{ color: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default WelcomeBanner
