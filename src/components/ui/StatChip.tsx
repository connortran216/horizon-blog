import { Box, Text, WrapItem } from '@chakra-ui/react'

interface StatChipProps {
  label: string
  value: string
  minWidth?: string | Record<string, string>
}

const StatChip = ({ label, value, minWidth = { base: 'auto', md: '148px' } }: StatChipProps) => (
  <WrapItem>
    <Box
      px={4}
      py={3}
      bg="bg.elevated"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="full"
      minW={minWidth}
    >
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="text.tertiary">
        {label}
      </Text>
      <Text mt={1} fontSize="sm" fontWeight="semibold" color="text.primary">
        {value}
      </Text>
    </Box>
  </WrapItem>
)

export default StatChip
