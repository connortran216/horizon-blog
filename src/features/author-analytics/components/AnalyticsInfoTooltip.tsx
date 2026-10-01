import { Tooltip } from '@chakra-ui/react'
import { FiInfo } from 'react-icons/fi'

import { IconButton } from '../../../design-system'

interface AnalyticsInfoTooltipProps {
  label: string
  ariaLabel?: string
}

const AnalyticsInfoTooltip = ({ label, ariaLabel }: AnalyticsInfoTooltipProps) => (
  <Tooltip
    label={label}
    hasArrow
    placement="top"
    bg="bg.elevated"
    color="text.primary"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="card"
    px={3}
    py={2}
    maxW="xs"
    fontSize="sm"
  >
    <IconButton
      label={ariaLabel || 'More information'}
      icon={<FiInfo />}
      size="sm"
      color="text.muted"
    />
  </Tooltip>
)

export default AnalyticsInfoTooltip
