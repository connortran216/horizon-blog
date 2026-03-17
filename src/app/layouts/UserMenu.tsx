import { Avatar, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from 'react-router-dom'
import { User } from '../../core'

interface UserMenuProps {
  user: User
  colorMode: string
  onToggleColorMode: () => void
  onLogout: () => void
}

const UserMenu = ({ user, colorMode, onToggleColorMode, onLogout }: UserMenuProps) => {
  return (
    <Menu>
      <MenuButton>
        <Avatar size="sm" src={user.avatar} name={user.username} />
      </MenuButton>
      <MenuList>
        <MenuItem as={RouterLink} to={`/profile/${user.username}`}>
          Profile
        </MenuItem>
        <MenuItem
          onClick={onToggleColorMode}
          icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        >
          {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
        <MenuItem onClick={onLogout}>Sign out</MenuItem>
      </MenuList>
    </Menu>
  )
}

export default UserMenu
