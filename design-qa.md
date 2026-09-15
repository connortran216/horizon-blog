# Design QA: Contact Editorial Letter

## Source and implementation

- reference: `/var/folders/9j/36cty8qn5lgbl92w712p_7xm0000gp/T/codex-clipboard-a5078184-1c38-4cae-b227-c98b5cd593d0.png`
- implementation: `http://[::1]:5173/contact`
- source-of-truth behavior: `specs/021-contact-editorial-letter/spec.md`
- comparison: same-turn rendered comparison at the reference desktop size, plus focused light/dark and responsive captures

## Visual comparison

- hierarchy matches the selected Option 2: Editorial Letter invitation on the left, email-first contact rail on the right, one cobalt primary action, and one restrained lime underline
- the obsolete reason-card grid and contact-form direction are absent
- phone and location remain lower-emphasis rows with aligned icons and dividers
- the email is one line at 1440px and has one intentional break opportunity after `@` on narrow screens
- the implementation preserves Horizon's 1120px content frame and shared app footer instead of copying the generated reference's wider shell; this follows the spec's authority order and keeps unrelated routes unchanged

## Responsive and theme checks

Checked at 320, 375, 768, 1024, and 1440 CSS pixels in light and dark themes.

- horizontal overflow: 0px at every checked width in both themes
- 320px `Sign in`: one rendered text line
- 320px email: two lines, with all of `gmail.com` on one line
- action sizes at 320px: email 228x44, copy 48x48, phone 142x44
- mobile reading order: invitation and topics precede the email, phone, and location rail
- desktop 1440x1024: all essential contact content and the start of the shared footer fit in the viewport

## Interaction and accessibility checks

- one `h1`, followed by the `Get in touch` `h2`
- exact `mailto:canhtran210699@gmail.com` and `tel:+84963452909` destinations
- location remains plain text
- keyboard order reaches skip link, header controls, email action, copy control, phone action, then footer controls
- every observed keyboard target has the design-system 2px focus outline
- successful copy keeps focus on the copy button and changes visible/live text to `The email address is on your clipboard`
- success, rejected write, missing clipboard, and stale-result behavior have automated coverage

## Automated gates

- targeted Contact and copy tests: 73 passed
- complete Vitest suite: 1,672 passed; the 16 localhost SEO tests were rerun outside the restricted sandbox after the sandbox-only `listen EPERM` failure
- TypeScript, ESLint, Prettier, design-system coverage, and production build: passed
- design-system coverage: 126 legacy files, 126 ledger rows, 107/107 exports represented in the gallery

## Final result

passed
