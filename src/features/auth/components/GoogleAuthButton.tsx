import { useState } from 'react'
import { Button } from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc'
import { buildGoogleSsoStartUrl } from '../utils/googleSso'

interface GoogleAuthButtonProps {
  redirectTo?: string | null
  isDisabled?: boolean
}

const GoogleAuthButton = ({ redirectTo, isDisabled }: GoogleAuthButtonProps) => {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleClick = () => {
    if (isDisabled || isRedirecting) {
      return
    }

    setIsRedirecting(true)
    window.location.assign(buildGoogleSsoStartUrl(redirectTo))
  }

  return (
    <Button
      type="button"
      size="lg"
      w="full"
      minH="14"
      justifyContent="center"
      bg="bg.elevated"
      color="text.primary"
      borderWidth="1px"
      borderColor="border.default"
      boxShadow="sm"
      fontSize="md"
      fontWeight="semibold"
      leftIcon={<FcGoogle size="1.2rem" />}
      iconSpacing="3"
      onClick={handleClick}
      isDisabled={isDisabled || isRedirecting}
      isLoading={isRedirecting}
      loadingText="Redirecting"
      _hover={{ bg: 'bg.tertiary', borderColor: 'border.default' }}
      _active={{ bg: 'bg.tertiary' }}
    >
      Continue with Google
    </Button>
  )
}

export default GoogleAuthButton
