import { ReactNode } from 'react'
import { Button } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'

interface NavLinkButtonProps {
  to: string
  children: ReactNode
}

const NavLinkButton = ({ to, children }: NavLinkButtonProps) => {
  const { pathname } = useLocation()
  const active = pathname === to || pathname.startsWith(to + '/')
  return (
    <Button
      as={RouterLink}
      to={to}
      aria-current={active ? 'page' : undefined}
      variant="ghost"
      fontSize="sm"
      fontWeight={active ? 600 : 400}
      px={2}
      borderRadius={0}
      borderBottom="2px solid"
      borderColor={active ? 'action.primary' : 'transparent'}
    >
      {children}
    </Button>
  )
}
export default NavLinkButton
