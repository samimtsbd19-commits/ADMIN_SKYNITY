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
  },
  {
    label: 'Billing',
    isSection: true,
    children: [
      {
        label: 'Customers',
        icon: 'tabler-users-group',
        href: '/hotspot/customers'
      },
      {
        label: 'Plans',
        icon: 'tabler-package',
        href: '/hotspot/plans'
      },
      {
        label: 'Transactions',
        icon: 'tabler-credit-card',
        href: '/hotspot/transactions'
      }
    ]
  },
  {
    label: 'Analytics',
    isSection: true,
    children: [
      {
        label: 'Reports',
        icon: 'tabler-chart-bar',
        href: '/hotspot/reports'
      },
      {
        label: 'System Logs',
        icon: 'tabler-clipboard-list',
        href: '/hotspot/logs'
      }
    ]
  },
  {
    label: 'Settings',
    isSection: true,
    children: [
      {
        label: 'Admin Users',
        icon: 'tabler-shield-check',
        href: '/hotspot/admin-users'
      },
      {
        label: 'IP Pools',
        icon: 'tabler-network',
        href: '/hotspot/pools'
      },
      {
        label: 'System Settings',
        icon: 'tabler-settings',
        href: '/hotspot/settings'
      }
    ]
  }
]

export default verticalMenuData
