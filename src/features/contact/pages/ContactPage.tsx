import { Box, Flex, Grid as ChakraGrid } from '@chakra-ui/react'

import {
  ContentContainer,
  Divider,
  Eyebrow,
  Heading,
  Section,
  Stack,
  Text,
} from '../../../design-system'
import { space } from '../../../theme/tokens'
import { ContactRail } from '../components'

const topics = ['Writing feedback', 'Frontend architecture', 'Product conversations'] as const

const ContactPage = () => (
  <ContentContainer>
    <Section density="comfortable" aria-labelledby="contact-title">
      <ChakraGrid
        templateColumns={{
          base: 'minmax(0, 1fr)',
          lg: 'minmax(0, 1.14fr) minmax(0, 0.86fr)',
        }}
        gap={{ base: space[12], lg: space[12] }}
        alignItems="start"
      >
        <Stack gap={8} minW={0}>
          <Stack gap={6}>
            <Eyebrow as="p">Contact Horizon</Eyebrow>

            <Heading recipe="display" as="h1" id="contact-title">
              A quieter inbox
              <Box as="br" display={{ base: 'none', lg: 'block' }} /> for deeper
              <Box as="br" display={{ base: 'none', lg: 'block' }} />{' '}
              <Box
                as="span"
                textDecorationLine="underline"
                textDecorationColor="accent.lime"
                textDecorationThickness={space[1]}
                textUnderlineOffset={space[2]}
              >
                conversations.
              </Box>
            </Heading>
          </Stack>

          <Stack gap={6} maxW="prose">
            <Text recipe="prose" color="text.secondary">
              If you have a question, an idea, or just want to share your thoughts, I&apos;d love to
              hear from you. Email is the best place to reach me, whether it&apos;s about a blog,
              frontend architecture, or where the web is headed.
            </Text>

            <Text recipe="prose" color="text.secondary">
              A little context goes a long way.
            </Text>

            <Text recipe="prose" color="text.muted" fontStyle="italic">
              - Canh
            </Text>
          </Stack>

          <Divider />

          <Stack gap={3}>
            <Eyebrow as="p">Some things people often write about</Eyebrow>
            <Flex gap={space[4]} flexWrap="wrap">
              {topics.map((topic, index) => (
                <Text
                  key={topic}
                  as="span"
                  recipe="body"
                  color="text.secondary"
                  paddingRight={index === topics.length - 1 ? 0 : space[4]}
                  borderRight={index === topics.length - 1 ? '0' : '1px solid'}
                  borderColor="border.subtle"
                >
                  {topic}
                </Text>
              ))}
            </Flex>
          </Stack>
        </Stack>

        <Box
          minW={0}
          paddingLeft={{ base: 0, lg: space[12] }}
          borderLeftWidth={{ base: 0, lg: '1px' }}
          borderLeftStyle="solid"
          borderLeftColor="border.subtle"
        >
          <ContactRail />
        </Box>
      </ChakraGrid>
    </Section>
  </ContentContainer>
)

export default ContactPage
