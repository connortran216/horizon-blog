import { Image, type ImageProps, useColorModeValue } from '@chakra-ui/react'

type BrandLogoVariant = 'full' | 'icon'

interface BrandLogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  variant?: BrandLogoVariant
}

const LOGO_SOURCES: Record<BrandLogoVariant, { light: string; dark: string }> = {
  full: {
    light: '/branding/horizon-logo-light.png',
    dark: '/branding/horizon-logo-dark.png',
  },
  icon: {
    light: '/branding/horizon-icon-light.png',
    dark: '/branding/horizon-icon-dark.png',
  },
}

const BrandLogo = ({ variant = 'full', h, maxW, mixBlendMode, ...rest }: BrandLogoProps) => {
  const src = useColorModeValue(LOGO_SOURCES[variant].light, LOGO_SOURCES[variant].dark)
  const defaultBlendMode = useColorModeValue('multiply', 'screen')

  return (
    <Image
      src={src}
      alt="Horizon"
      h={h ?? (variant === 'full' ? { base: '34px', md: '38px' } : { base: '32px', md: '34px' })}
      w="auto"
      maxW={maxW ?? (variant === 'full' ? { base: '164px', md: '220px' } : '34px')}
      objectFit="contain"
      display="block"
      mixBlendMode={mixBlendMode ?? defaultBlendMode}
      draggable={false}
      {...rest}
    />
  )
}

export default BrandLogo
