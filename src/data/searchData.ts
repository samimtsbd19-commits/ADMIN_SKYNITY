type SearchData = {
  id: string
  name: string
  url: string
  excludeLang?: boolean
  icon: string
  section: string
  shortcut?: string
}

const data: SearchData[] = [
  {
    id: '1',
    name: 'Dashboard',
    url: '/hotspot',
    icon: 'tabler-layout-dashboard',
    section: 'Hotspot Manager'
  },
  {
    id: '2',
    name: 'Users',
    url: '/hotspot/users',
    icon: 'tabler-users',
    section: 'Hotspot Manager'
  },
  {
    id: '3',
    name: 'Active Sessions',
    url: '/hotspot/sessions',
    icon: 'tabler-activity',
    section: 'Hotspot Manager'
  },
  {
    id: '4',
    name: 'Bandwidth Profiles',
    url: '/hotspot/profiles',
    icon: 'tabler-gauge',
    section: 'Hotspot Manager'
  },
  {
    id: '5',
    name: 'Vouchers',
    url: '/hotspot/vouchers',
    icon: 'tabler-ticket',
    section: 'Hotspot Manager'
  },
  {
    id: '6',
    name: 'MikroTik Routers',
    url: '/hotspot/routers',
    icon: 'tabler-router',
    section: 'Infrastructure'
  }
]

export default data
