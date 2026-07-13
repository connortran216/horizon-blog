# Data Model: Rewrite CV Achievements

## CV Profile

- **Role**: Public professional profile rendered by the CV page.
- **Fields preserved**: name, title, location, email, summary, competencies, links, experience, projects, education.
- **Validation**: Must remain compatible with the existing CV page data contract.

## Experience Highlight

- **Role**: A concise bullet describing professional value for a company and role.
- **Rewrite rules**:
  - Prefer achievement and outcome phrasing.
  - Keep facts traceable to the existing CV content or the owner's role interview.
  - Do not add invented metrics, customers, revenue claims, awards, or scope.
  - Keep tone concise and credible.

## Verified Fact

- **Role**: Existing resume source information that may be preserved or reframed.
- **Examples**: employers, roles, dates, production URLs, technologies, known domains, public project metrics, and owner-verified scope or outcomes.
- **Validation**: Must not be changed unless the user explicitly provides new facts.
