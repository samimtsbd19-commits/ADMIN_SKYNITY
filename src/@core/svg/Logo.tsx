// React Imports
import type { SVGAttributes } from 'react'

/**
 * SKYNITY Logo Mark
 * A stylised hotspot / sky-node icon:
 *  - Three concentric arc "signal" rings (hotspot)
 *  - A diamond node at centre
 *  - Subtle diagonal "sky" slash for depth
 */
const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      {/* Outer arc */}
      <path
        d='M3.515 6.343a12 12 0 0 1 16.97 0'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        opacity='0.35'
      />
      {/* Middle arc */}
      <path
        d='M6.343 9.172a8 8 0 0 1 11.314 0'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        opacity='0.65'
      />
      {/* Inner arc */}
      <path
        d='M9.172 12a4 4 0 0 1 5.656 0'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
      {/* Centre node (diamond) */}
      <rect
        x='10.5'
        y='13.5'
        width='3'
        height='3'
        rx='0.5'
        transform='rotate(45 12 15)'
        fill='currentColor'
      />
      {/* Sky slash accent */}
      <path
        d='M18 18 L21 21'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        opacity='0.4'
      />
    </svg>
  )
}

export default Logo
