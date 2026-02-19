// React Imports
import type { SVGAttributes } from 'react'

/**
 * SKYNITY Logo Mark
 * Professional hotspot network icon:
 *  - Bold WiFi signal arcs (outer, mid, inner)
 *  - Solid circular base node
 *  - Clean geometric style
 */
const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 32 32'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      {/* Outer signal arc */}
      <path
        d='M4 12.5C7.2 8.2 11.8 5.5 16 5.5C20.2 5.5 24.8 8.2 28 12.5'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
        opacity='0.3'
      />
      {/* Mid signal arc */}
      <path
        d='M7.5 16C9.8 12.8 12.8 11 16 11C19.2 11 22.2 12.8 24.5 16'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
        opacity='0.6'
      />
      {/* Inner signal arc */}
      <path
        d='M11 19.5C12.4 17.5 14.1 16.5 16 16.5C17.9 16.5 19.6 17.5 21 19.5'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
      />
      {/* Center node */}
      <circle cx='16' cy='23' r='2.5' fill='currentColor' />
    </svg>
  )
}

export default Logo
