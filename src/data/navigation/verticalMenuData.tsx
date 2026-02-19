// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (_dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  // ── SKYNITY Hotspot Manager ───────────────────────────────────────────
  {
    label: 'Overview',
    isSection: true,
    children: [
      {
        label: 'Dashboard',
        icon: 'tabler-layout-dashboard',
        href: '/hotspot'
      }
    ]
  },
  {
    label: 'Management',
    isSection: true,
    children: [
      {
        label: 'Users',
        icon: 'tabler-users',
        href: '/hotspot/users'
      },
      {
        label: 'Active Sessions',
        icon: 'tabler-activity',
        href: '/hotspot/sessions'
      },
      {
        label: 'Profiles',
        icon: 'tabler-gauge',
        href: '/hotspot/profiles'
      },
      {
        label: 'Vouchers',
        icon: 'tabler-ticket',
        href: '/hotspot/vouchers'
      }
    ]
  },
  {
    label: 'Infrastructure',
    isSection: true,
    children: [
      {
        label: 'Routers',
        icon: 'tabler-router',
        href: '/hotspot/routers'
      }
    ]
  }
]

export default verticalMenuData
