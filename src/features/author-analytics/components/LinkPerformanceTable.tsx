import {
  Badge,
  Box,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { AnalyticsLinkMetric } from '../author-analytics.types'
import { formatAnalyticsInteger, formatAnalyticsPercent } from '../author-analytics.format'

interface LinkPerformanceTableProps {
  links: AnalyticsLinkMetric[]
}

const LinkPerformanceTable = ({ links }: LinkPerformanceTableProps) => {
  return (
    <Box border="1px solid" borderColor="border.subtle" bg="bg.secondary" borderRadius="2xl" p={5}>
      <HStack justify="space-between" mb={4} align="start">
        <Box>
          <Text fontWeight="semibold" color="text.primary">
            Link performance
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Links readers clicked from this blog.
          </Text>
        </Box>
      </HStack>

      {links.length === 0 ? (
        <Text color="text.tertiary" fontSize="sm">
          No link clicks in this range.
        </Text>
      ) : (
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Link</Th>
                <Th>Kind</Th>
                <Th isNumeric>Clicks</Th>
                <Th isNumeric>CTR</Th>
              </Tr>
            </Thead>
            <Tbody>
              {links.map((link) => (
                <Tr key={link.linkKey}>
                  <Td>
                    <Text color="text.primary" fontWeight="medium" noOfLines={1}>
                      {link.label || link.url}
                    </Text>
                    <Text color="text.tertiary" fontSize="xs" noOfLines={1}>
                      {link.url}
                    </Text>
                  </Td>
                  <Td>
                    <Badge bg="bg.tertiary" color="text.secondary">
                      {link.kind}
                    </Badge>
                  </Td>
                  <Td isNumeric>{formatAnalyticsInteger(link.clicks)}</Td>
                  <Td isNumeric>{formatAnalyticsPercent(link.ctr)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default LinkPerformanceTable
