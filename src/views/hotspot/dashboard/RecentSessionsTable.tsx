'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Type Imports
import type { RosHotspotActive } from '@/libs/mikrotik/hotspot'
import { formatBytes } from '@/libs/mikrotik/hotspot'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type Props = {
  sessions: RosHotspotActive[]
  routerId: string
  onDisconnect?: (id: string) => void
}

const RecentSessionsTable = ({ sessions, routerId, onDisconnect }: Props) => {
  const handleDisconnect = async (id: string) => {
    try {
      await fetch(`/api/hotspot/sessions/${id}?routerId=${routerId}`, { method: 'DELETE' })
      onDisconnect?.(id)
    } catch {
      // handle silently
    }
  }

  return (
    <Card>
      <CardHeader title='Active Sessions' subheader={`${sessions.length} users online`} />
      <CardContent className='p-0'>
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>MAC</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Download</TableCell>
                <TableCell>Upload</TableCell>
                <TableCell align='center'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' className='py-8'>
                    <Typography color='text.disabled'>No active sessions</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.slice(0, 10).map(session => (
                  <TableRow key={session['.id']}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <i className='tabler-user text-lg text-textSecondary' />
                        <Typography className='font-medium' color='text.primary'>
                          {session.user}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{session.address}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' className='font-mono text-xs'>
                        {session['mac-address']}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={session.uptime} size='small' color='success' variant='tonal' />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{formatBytes(session['bytes-in'])}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{formatBytes(session['bytes-out'])}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Tooltip title='Disconnect'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDisconnect(session['.id'])}
                        >
                          <i className='tabler-logout text-lg' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default RecentSessionsTable
