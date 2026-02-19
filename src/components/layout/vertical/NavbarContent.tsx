// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'
import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Vars
const shortcuts: ShortcutsType[] = [
  {
    url: '/hotspot',
    icon: 'tabler-layout-dashboard',
    title: 'Dashboard',
    subtitle: 'Overview & Stats'
  },
  {
    url: '/hotspot/users',
    icon: 'tabler-users',
    title: 'Users',
    subtitle: 'Manage Hotspot Users'
  },
  {
    url: '/hotspot/sessions',
    icon: 'tabler-activity',
    title: 'Active Sessions',
    subtitle: 'Live Connections'
  },
  {
    url: '/hotspot/profiles',
    icon: 'tabler-gauge',
    title: 'Profiles',
    subtitle: 'Bandwidth Plans'
  },
  {
    url: '/hotspot/vouchers',
    icon: 'tabler-ticket',
    title: 'Vouchers',
    subtitle: 'Generate Codes'
  },
  {
    url: '/hotspot/routers',
    icon: 'tabler-router',
    title: 'Routers',
    subtitle: 'MikroTik Devices'
  }
]

const notifications: NotificationsType[] = [
  {
    avatarIcon: 'tabler-wifi',
    title: 'Hotspot is running',
    subtitle: 'All routers are online and operational',
    avatarColor: 'success',
    time: 'Just now',
    read: false
  },
  {
    avatarIcon: 'tabler-users',
    title: 'New users registered',
    subtitle: 'Multiple new hotspot accounts created today',
    avatarColor: 'primary',
    time: '2h ago',
    read: false
  },
  {
    avatarIcon: 'tabler-ticket',
    title: 'Vouchers low',
    subtitle: 'Less than 10 unused vouchers remaining',
    avatarColor: 'warning',
    time: '5h ago',
    read: true
  },
  {
    avatarIcon: 'tabler-chart-bar',
    title: 'Traffic report ready',
    subtitle: 'Daily bandwidth usage report is available',
    avatarColor: 'info',
    time: 'Yesterday',
    read: true
  }
]

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center'>
        <LanguageDropdown />
        <ModeDropdown />
        <ShortcutsDropdown shortcuts={shortcuts} />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
