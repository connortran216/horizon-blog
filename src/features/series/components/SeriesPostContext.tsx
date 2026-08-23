import { HStack, Text } from '@chakra-ui/react'
import { BlogSeriesContext } from '../../../core/types/blog.types'

interface SeriesPostContextProps {
  series?: BlogSeriesContext | null
}

const SeriesPostContext = ({ series }: SeriesPostContextProps) => {
  if (!series) return null

  return (
    <HStack spacing={2} color="action.primary" fontSize="sm" fontWeight="semibold" flexWrap="wrap">
      <Text noOfLines={1}>{series.title}</Text>
      <Text color="text.tertiary" aria-hidden>
        /
      </Text>
      <Text color="text.secondary">
        Part {series.position} of {series.total}
      </Text>
    </HStack>
  )
}

export default SeriesPostContext
