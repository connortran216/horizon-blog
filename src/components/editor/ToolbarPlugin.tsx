import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import {
  Box, 
  Button, 
  ButtonGroup, 
  IconButton, 
  Tooltip, 
  Divider,
  HStack
} from '@chakra-ui/react';
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, $getSelection, $isRangeSelection } from 'lexical';
import { 
  $createHeadingNode, 
  $isHeadingNode, 
  HeadingTagType 
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode } from 'lexical';
import { BiBold, BiItalic, BiUnderline, BiStrikethrough } from 'react-icons/bi';
import { 
  MdFormatListBulleted, 
  MdFormatListNumbered, 
  MdFormatQuote,
  MdTitle, 
  MdShortText, 
  MdTextFields, 
  MdSubject 
} from 'react-icons/md';

// Button sizes and style defaults
const BUTTON_PROPS = {
  size: 'sm',
  variant: 'ghost',
  colorScheme: 'gray',
};

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    h1: false,
    h2: false,
    h3: false,
    paragraph: false,
    ul: false,
    ol: false,
    quote: false,
  });

  // Update toolbar state based on editor selection
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    // Check selected format
    setActiveStyles({
      bold: selection.hasFormat('bold'),
      italic: selection.hasFormat('italic'),
      underline: selection.hasFormat('underline'),
      strikethrough: selection.hasFormat('strikethrough'),
      h1: false, // Will be updated below
      h2: false,
      h3: false,
      paragraph: false,
      ul: false,
      ol: false,
      quote: false,
    });

    // More complex node selections will be added here
  }, []);

  // Register for selection changes
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  // Format text handlers
  const formatText = (format: string) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  // Format block handlers
  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createParagraphNode());
    });
  };

  const formatBulletList = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'bullet');
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'number');
  };

  const formatQuote = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'quote');
  };

  return (
    <Box p={2} borderBottom="1px solid" borderColor="gray.200">
      <HStack spacing={2}>
        <ButtonGroup size="sm" isAttached variant="outline">
          <Tooltip label="Bold">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Bold"
              icon={<BiBold />}
              onClick={() => formatText('bold')}
              colorScheme={activeStyles.bold ? 'blue' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Italic">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Italic"
              icon={<BiItalic />}
              onClick={() => formatText('italic')}
              colorScheme={activeStyles.italic ? 'blue' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Underline">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Underline"
              icon={<BiUnderline />}
              onClick={() => formatText('underline')}
              colorScheme={activeStyles.underline ? 'blue' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Strikethrough">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Strikethrough"
              icon={<BiStrikethrough />}
              onClick={() => formatText('strikethrough')}
              colorScheme={activeStyles.strikethrough ? 'blue' : 'gray'}
            />
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" h="24px" />

        <ButtonGroup size="sm" isAttached variant="outline">
          <Tooltip label="Heading 1">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Heading 1"
              icon={<MdTitle />}
              onClick={() => formatHeading('h1')}
              colorScheme={activeStyles.h1 ? 'blue' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Heading 2">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Heading 2"
              icon={<MdShortText />}
              onClick={() => formatHeading('h2')}
              colorScheme={activeStyles.h2 ? 'blue' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Heading 3">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Heading 3"
              icon={<MdTextFields />}
              onClick={() => formatHeading('h3')}
              colorScheme={activeStyles.h3 ? 'blue' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Paragraph">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Paragraph"
              icon={<MdSubject />}
              onClick={formatParagraph}
              colorScheme={activeStyles.paragraph ? 'blue' : 'gray'}
            />
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" h="24px" />

        <ButtonGroup size="sm" isAttached variant="outline">
          <Tooltip label="Bulleted List">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Bulleted List"
              icon={<MdFormatListBulleted />}
              onClick={formatBulletList}
              colorScheme={activeStyles.ul ? 'blue' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Numbered List">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Numbered List"
              icon={<MdFormatListNumbered />}
              onClick={formatNumberedList}
              colorScheme={activeStyles.ol ? 'blue' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Quote">
            <IconButton
              {...BUTTON_PROPS}
              aria-label="Quote"
              icon={<MdFormatQuote />}
              onClick={formatQuote}
              colorScheme={activeStyles.quote ? 'blue' : 'gray'}
            />
          </Tooltip>
        </ButtonGroup>
      </HStack>
    </Box>
  );
};

export default ToolbarPlugin; 