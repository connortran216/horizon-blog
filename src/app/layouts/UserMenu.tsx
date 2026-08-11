import { Avatar, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from 'react-router-dom'
import { User } from '../../core'
import { can } from '../../core/authorization/authorization'

interface UserMenuProps {
  user: User
  colorMode: string
  onToggleColorMode: () => void
  onLogout: () => Promise<void>
  isLoggingOut: boolean
}

const UserMenu = ({
  user,
  colorMode,
  onToggleColorMode,
  onLogout,
  isLoggingOut,
}: UserMenuProps) => {
  const canReadAnalytics = can(user.authorization, 'analytics:read:own')
  const canAssignRoles = can(user.authorization, 'roles:assign')

  return (
    <Menu>
      <MenuButton>
        <Avatar size="sm" src={user.avatar} name={user.username} />
      </MenuButton>
      <MenuList>
        <MenuItem as={RouterLink} to={`/profile/${user.username}`}>
          Profile
        </MenuItem>
        {canReadAnalytics ? (
          <MenuItem as={RouterLink} to="/analytics">
            Analytics
          </MenuItem>
        ) : null}
        {canAssignRoles ? (
          <MenuItem as={RouterLink} to="/admin/access">
            Access management
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={onToggleColorMode}
          icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        >
          {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
        <MenuItem onClick={() => void onLogout()} isDisabled={isLoggingOut}>
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default UserMenu
