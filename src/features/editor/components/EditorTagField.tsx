/**
 * The draft's tags - migrated onto Horizon Design System v2 (release M6).
 *
 * `TagField` owns the input, the chips, the per-tag remove buttons and the
 * Enter/comma/Backspace behaviour. What stays here is the one rule the design
 * system has no business knowing: Horizon tags are stored lower case, because
 * that is what `tag_names` has always carried to the backend. Normalising on
 * the way out keeps the request byte-identical to the legacy field's.
 *
 * The legacy field added a tag on Enter only. `TagField` also adds on comma and
 * on blur, which is a strictly larger set - a tag the author typed and walked
 * away from is no longer silently dropped.
 */

import { TagField } from '../../../design-system'

interface EditorTagFieldProps {
  tags: string[]
  onChange: (tags: string[]) => void
  isDisabled?: boolean
}

/** The backend's own limit on a tag name. */
const MAX_TAG_LENGTH = 32

const EditorTagField = ({ tags, onChange, isDisabled = false }: EditorTagFieldProps) => {
  return (
    <TagField
      tags={tags}
      isDisabled={isDisabled}
      maxLength={MAX_TAG_LENGTH}
      hint="Short labels that group related writing. Press Enter or comma to add one."
      onChange={(next) => onChange(next.map((tag) => tag.toLowerCase()))}
    />
  )
}

export default EditorTagField
