export const SITE_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

/**
 * Where the footer's social icons actually go.
 *
 * They had no destination at all: three `IconButton`s with an `aria-label` and
 * no `href`, so a reader clicking the GitHub mark got nothing and a screen
 * reader announced a button that does nothing. These are the owner's real
 * profiles, already written down twice - in `cv.data.ts` and on the About page -
 * and this is the third copy only because the shell may not import from
 * `features`. If a fourth appears, they belong in one module under `core`.
 *
 * There is deliberately no X/Twitter entry: no account for it exists anywhere
 * in the site's own data, and an icon linking nowhere is worse than an icon
 * that is absent.
 */
export const SOCIAL_LINKS = [
  { name: 'GitHub', href: 'https://github.com/connortran216' },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/c%E1%BA%A3nh-tr%E1%BA%A7n-tu%E1%BA%A5n-b57564162/',
  },
] as const
