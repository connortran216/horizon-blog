import { Box, Button, Collapse, Heading, Link, Text, VStack, useDisclosure } from '@chakra-ui/react'
import type { HeadingAnchor } from '../../../core'

interface TableOfContentsProps {
  items: HeadingAnchor[]
  variant?: 'rail' | 'collapse'
}

const TableOfContents = ({ items, variant = 'rail' }: TableOfContentsProps) => {
  const { isOpen, onToggle } = useDisclosure()

  if (items.length === 0) {
    return null
  }

  if (variant === 'collapse') {
    return (
      <Box
        as="nav"
        aria-label="Table of contents"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="md"
        bg="bg.secondary"
      >
        <Button
          type="button"
          variant="ghost"
          w="full"
          justifyContent="space-between"
          onClick={onToggle}
          px={4}
          py={3}
          h="auto"
          borderRadius="md"
        >
          <Text fontSize="sm" fontWeight="semibold">
            On this page
          </Text>
          <Text as="span" fontSize="sm" color="text.tertiary">
            {isOpen ? 'Hide' : 'Show'}
          </Text>
        </Button>
        <Collapse in={isOpen} animateOpacity>
          <Box px={4} pb={4}>
            <TocLinks items={items} />
          </Box>
        </Collapse>
      </Box>
    )
  }

  return (
    <VStack as="nav" aria-label="Table of contents" align="stretch" spacing={4}>
      <Heading as="h2" size="sm" color="text.primary" lineHeight="1.2">
        On this page
      </Heading>
      <TocLinks items={items} />
    </VStack>
  )
}

const TocLinks = ({ items }: { items: HeadingAnchor[] }) => (
  <VStack align="stretch" spacing={2}>
    {items.map((item) => (
      <Link
        key={item.id}
        href={`#${item.id}`}
        color="text.secondary"
        fontSize="sm"
        lineHeight="1.35"
        pl={item.depth > 2 ? 4 : 0}
        _hover={{ color: 'action.primary', textDecoration: 'none' }}
      >
        {item.text}
      </Link>
    ))}
  </VStack>
)

export default TableOfContents
