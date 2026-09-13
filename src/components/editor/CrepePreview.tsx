/**
 * CrepePreview - the rendered article inside the workspace.
 *
 * A read-only `CrepeEditor` over the same markdown the author is writing, with
 * media tokens resolved first. Crepe still does the rendering.
 *
 * Release M6 put it inside `Prose`, which is the frame the reader already uses
 * around this exact renderer. That is what makes the preview a preview: the
 * same measure, the same rhythm, the same link and code contrast and the same
 * containment the published article gets, instead of a second editor surface
 * pretending to be an article.
 *
 * It also brings the part that could not be done here. `Prose` sweeps the
 * rendered output for wide `pre` and `table` containers and gives them the
 * focusable-region attributes `CodeBlock` writes by hand, so a keyboard-only
 * author can reach and scroll a wide code block in the preview. A descendant
 * CSS rule can add overflow and cannot add attributes, which is why this is
 * worth composing rather than restyling.
 *
 * `CodeBlock` and `DiagramFrame` themselves are not adopted, and cannot be:
 * inside Crepe both the fenced block and the mermaid preview are ProseMirror
 * node views built with `document.createElement`, not React subtrees. See the
 * release report.
 */

import React from 'react'
import { Box } from '@chakra-ui/react'
import { Prose } from '../../design-system'
import { useResolvedMarkdown } from '../../features/media/useResolvedMarkdown'
import CrepeEditor from './CrepeEditor'
import { CREPE_LOCAL_SCROLL } from './crepe.presentation'

interface CrepePreviewProps {
  content: string
}

export const CrepePreview: React.FC<CrepePreviewProps> = ({ content }) => {
  const resolvedContent = useResolvedMarkdown(content)

  return (
    <Prose emptyMessage="Start writing and the reading experience appears here.">
      {resolvedContent.trim() ? (
        <Box minW={0} sx={CREPE_LOCAL_SCROLL}>
          <CrepeEditor
            initialContent={resolvedContent}
            readOnly
            inputId="blog-content-preview"
            inputName="blogContentPreview"
          />
        </Box>
      ) : null}
    </Prose>
  )
}

export default CrepePreview
