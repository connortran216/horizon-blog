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
      fontSize="md"
      minH="44px"
      fontWeight={active ? 600 : 400}
      px={4}
      borderRadius="14px"
      border="1px solid"
      borderColor={active ? 'action.primary' : 'transparent'}
      bg={active ? 'bg.tertiary' : 'transparent'}
      transition="transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease, border-color 200ms ease"
      _hover={{
        bg: 'bg.tertiary',
        color: 'text.primary',
        borderColor: 'action.primary',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px -6px rgba(100, 130, 230, 0.45)',
      }}
      _active={{ transform: 'translateY(0) scale(0.97)' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'action.primary', outlineOffset: '3px' }}
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          transform: 'none !important',
        },
      }}
    >
      {children}
    </Button>
  )
}
export default NavLinkButton
