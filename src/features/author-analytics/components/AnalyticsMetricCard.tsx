import { Badge, Box, HStack, Stat, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/react'

interface AnalyticsMetricCardProps {
  label: string
  value: string
  helper?: string
  approximate?: boolean
}

const AnalyticsMetricCard = ({ label, value, helper, approximate }: AnalyticsMetricCardProps) => {
  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      bg="bg.secondary"
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
    >
      <Stat>
        <HStack justify="space-between" align="start" spacing={3}>
          <StatLabel color="text.secondary" fontSize="sm">
            {label}
          </StatLabel>
          {approximate ? (
            <Badge bg="bg.tertiary" color="text.secondary" borderRadius="full">
              Approx.
            </Badge>
          ) : null}
        </HStack>
        <StatNumber color="text.primary" fontSize={{ base: '2xl', md: '3xl' }}>
          {value}
        </StatNumber>
        {helper ? (
          <StatHelpText color="text.tertiary" mb={0}>
            {helper}
          </StatHelpText>
        ) : null}
      </Stat>
    </Box>
  )
}

export default AnalyticsMetricCard
