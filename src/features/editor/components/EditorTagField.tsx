import { Box, Input, Tag, TagCloseButton, TagLabel, Wrap, WrapItem } from '@chakra-ui/react'

interface EditorTagFieldProps {
  tagInput: string
  tags: string[]
  isDisabled: boolean
  onTagInputChange: (value: string) => void
  onTagKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onRemoveTag: (tag: string) => void
}

const EditorTagField = ({
  tagInput,
  tags,
  isDisabled,
  onTagInputChange,
  onTagKeyDown,
  onRemoveTag,
}: EditorTagFieldProps) => {
  return (
    <Box>
      <Input
        id="blog-tags"
        name="blogTags"
        placeholder="Add tags (press Enter)"
        size="sm"
        value={tagInput}
        onChange={(event) => onTagInputChange(event.target.value)}
        onKeyDown={onTagKeyDown}
        isDisabled={isDisabled}
      />
      <Wrap mt={2} spacing={2}>
        {tags.map((tag) => (
          <WrapItem key={tag}>
            <Tag size="md" colorScheme="blue" borderRadius="full">
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => onRemoveTag(tag)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}

export default EditorTagField
