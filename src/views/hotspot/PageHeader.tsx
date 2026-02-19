// MUI Imports
import Typography from '@mui/material/Typography'

type Props = {
  title: string
  subtitle: string
  breadcrumbs?: { label: string; href?: string }[]
}

const PageHeader = ({ title, subtitle }: Props) => {
  return (
    <div className='flex flex-col gap-1'>
      <Typography variant='h5' className='font-semibold'>
        {title}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {subtitle}
      </Typography>
    </div>
  )
}

export default PageHeader
