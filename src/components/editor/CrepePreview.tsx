import React from 'react'
import { Flex, Text } from '@chakra-ui/react'
import { useResolvedMarkdown } from '../../features/media/useResolvedMarkdown'
import CrepeEditor from './CrepeEditor'

interface CrepePreviewProps {
  content: string
}

export const CrepePreview: React.FC<CrepePreviewProps> = ({ content }) => {
  const resolvedContent = useResolvedMarkdown(content)

  if (!resolvedContent.trim()) {
    return (
      <Flex minH="320px" align="center" justify="center">
        <Text color="text.tertiary">Start writing to preview the reading experience.</Text>
      </Flex>
    )
  }

  return (
    <CrepeEditor
      initialContent={resolvedContent}
      readOnly
      inputId="blog-content-preview"
      inputName="blogContentPreview"
    />
  )
}

export default CrepePreview
