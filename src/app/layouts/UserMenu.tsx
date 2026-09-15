/**
 * The signed-in reader's menu.
 *
 * Chakra's `Menu` stays: the design system has no menu of its own, and a
 * dismissible popup with roving focus and typeahead is not something to
 * reimplement in a shell component. What changed is that it no longer carries
 * the theme toggle. That control used to live here, which meant a reader who
 * was not signed in had no way to switch to dark at all - it is in the header
 * now, beside this menu, for everyone.
 *
 * `colorMode` and `onToggleColorMode` went with it, so this component no longer
 * takes them.
 */

import { Avatar, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

import { componentTokens, space } from '../../theme/tokens'
import { User } from '../../core'
import { can } from '../../core/authorization/authorization'

interface UserMenuProps {
  user: User
  onLogout: () => Promise<void>
  isLoggingOut: boolean
}

const UserMenu = ({ user, onLogout, isLoggingOut }: UserMenuProps) => {
  const canReadAnalytics = can(user.authorization, 'analytics:read:own')
  const canAssignRoles = can(user.authorization, 'roles:assign')

  return (
    <Menu>
      {/*
        The trigger is the avatar, so it needs a name of its own - the image has
        none a screen reader can use, and "open menu" would not say whose.
      */}
      <MenuButton
        aria-label={`Account menu for ${user.username}`}
        borderRadius="full"
        minH={componentTokens.control.minTouchTarget}
        minW={componentTokens.control.minTouchTarget}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
      >
        <Avatar size="sm" src={user.avatar} name={user.username} />
      </MenuButton>
      <MenuList bg="bg.surface" borderColor="border.subtle">
        <MenuItem
          as={RouterLink}
          to={`/profile/${user.username}`}
          bg="transparent"
          minH={componentTokens.control.minTouchTarget}
          px={space[4]}
          _hover={{ bg: 'action.subtle' }}
          _focus={{ bg: 'action.subtle' }}
        >
          Profile
        </MenuItem>
        {canReadAnalytics ? (
          <MenuItem
            as={RouterLink}
            to="/analytics"
            bg="transparent"
            minH={componentTokens.control.minTouchTarget}
            px={space[4]}
            _hover={{ bg: 'action.subtle' }}
            _focus={{ bg: 'action.subtle' }}
          >
            Analytics
          </MenuItem>
        ) : null}
        {canAssignRoles ? (
          <MenuItem
            as={RouterLink}
            to="/admin/access"
            bg="transparent"
            minH={componentTokens.control.minTouchTarget}
            px={space[4]}
            _hover={{ bg: 'action.subtle' }}
            _focus={{ bg: 'action.subtle' }}
          >
            Access management
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => void onLogout()}
          isDisabled={isLoggingOut}
          bg="transparent"
          minH={componentTokens.control.minTouchTarget}
          px={space[4]}
          _hover={{ bg: 'action.subtle' }}
          _focus={{ bg: 'action.subtle' }}
        >
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default UserMenu
