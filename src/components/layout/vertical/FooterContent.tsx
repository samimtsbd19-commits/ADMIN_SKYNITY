'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()} `}</span>
        <span className='text-primary font-semibold'>SKYNITY</span>
        <span className='text-textSecondary'>{` — MikroTik Hotspot Manager`}</span>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-1 text-textDisabled text-sm'>
          <i className='tabler-router text-base' />
          <span>Powered by RouterOS API</span>
        </div>
      )}
    </div>
  )
}

export default FooterContent
