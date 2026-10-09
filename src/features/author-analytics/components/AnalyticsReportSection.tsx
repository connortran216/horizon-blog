import { Box, Flex } from '@chakra-ui/react'
import { ReactNode, useId } from 'react'
import { Heading, Stack, Text } from '../../../design-system'

export default function AnalyticsReportSection({
  number,
  title,
  detail,
  controls,
  children,
}: {
  number: string
  title: string
  detail: string
  controls?: ReactNode
  children: ReactNode
}) {
  const id = useId()
  return (
    <Stack
      as="section"
      aria-labelledby={id}
      gap={6}
      borderTop="1px solid"
      borderColor="border.subtle"
      pt={6}
      minW={0}
    >
      <Flex gap={4} justify="space-between" align="start" wrap="wrap">
        <Flex gap={4} align="start">
          <Text
            aria-hidden="true"
            fontSize={{ base: '2xl', md: '3xl' }}
            color="action.primary"
            fontWeight="semibold"
            lineHeight={1.2}
            flexShrink={0}
            whiteSpace="nowrap"
          >
            {number}
          </Text>
          <Box>
            <Heading as="h2" id={id} recipe="cardTitle" fontSize="lg">
              {title}
            </Heading>
            <Text recipe="metadata" mt={1}>
              {detail}
            </Text>
          </Box>
        </Flex>
        {controls}
      </Flex>
      {children}
    </Stack>
  )
}
