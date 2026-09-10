import { ReactNode } from 'react'
import { Button } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

interface NavLinkButtonProps {
  to: string
  children: ReactNode
}

const NavLinkButton = ({ to, children }: NavLinkButtonProps) => (
  <RouterLink to={to}>
    <Button variant="ghost" px={2} py={1} rounded="md">
      {children}
    </Button>
  </RouterLink>
)

export default NavLinkButton
