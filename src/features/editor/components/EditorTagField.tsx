import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'

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
    <FormControl>
      <FormLabel
        htmlFor="blog-tags"
        mb={1.5}
        fontSize="sm"
        fontWeight="semibold"
        color="text.primary"
      >
        Tags
      </FormLabel>
      <FormHelperText mt={0} mb={3} color="text.tertiary">
        Use short labels to group related writing. Press Enter to add each tag.
      </FormHelperText>

      <Box
        border="1px solid"
        borderColor="border.default"
        borderRadius="2xl"
        bg="bg.page"
        px={4}
        py={4}
        transition="border-color 0.2s ease, box-shadow 0.2s ease"
        _focusWithin={{
          borderColor: 'action.primary',
          boxShadow: '0 0 0 1px var(--chakra-colors-action-primary)',
        }}
      >
        <Input
          id="blog-tags"
          name="blogTags"
          placeholder="Add a tag and press Enter"
          variant="unstyled"
          size="md"
          value={tagInput}
          onChange={(event) => onTagInputChange(event.target.value)}
          onKeyDown={onTagKeyDown}
          isDisabled={isDisabled}
          color="text.primary"
          _placeholder={{ color: 'text.tertiary' }}
        />

        {tags.length > 0 ? (
          <Wrap mt={4} spacing={2}>
            {tags.map((tag) => (
              <WrapItem key={tag}>
                <Tag
                  size="md"
                  borderRadius="full"
                  bg="action.subtle"
                  color="action.primary"
                  border="1px solid"
                  borderColor="border.subtle"
                >
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton
                    onClick={() => onRemoveTag(tag)}
                    isDisabled={isDisabled}
                    color="text.secondary"
                    _hover={{ bg: 'transparent', color: 'text.primary' }}
                  />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        ) : null}
      </Box>
    </FormControl>
  )
}

export default EditorTagField
