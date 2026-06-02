# Data Model: Redesign Contact Direct

## ContactMethod

- **Purpose**: Represents a direct way to contact the author.
- **Fields**:
  - `icon`: visual icon component.
  - `title`: short method label.
  - `content`: displayed contact detail.
  - `href`: optional action URL for clickable methods.
  - `description`: optional helper text explaining when to use the method.
  - `tone`: optional presentation role such as primary or secondary.
- **Validation rules**:
  - Email method must include a `mailto:` link.
  - Phone method should include a `tel:` link.
  - Location may omit `href`.

## OutreachPrompt

- **Purpose**: Explains useful reasons to reach out.
- **Fields**:
  - `icon`: visual icon component.
  - `title`: concise prompt title.
  - `description`: one short sentence of guidance.
- **Validation rules**:
  - Prompt copy should be personal and non-sales-oriented.
  - Prompt copy should remain short enough for mobile cards.
