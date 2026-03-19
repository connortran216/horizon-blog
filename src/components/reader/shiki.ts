import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from 'shiki/dist/langs/bash.mjs'
import css from 'shiki/dist/langs/css.mjs'
import go from 'shiki/dist/langs/go.mjs'
import html from 'shiki/dist/langs/html.mjs'
import javascript from 'shiki/dist/langs/javascript.mjs'
import json from 'shiki/dist/langs/json.mjs'
import jsx from 'shiki/dist/langs/jsx.mjs'
import markdown from 'shiki/dist/langs/markdown.mjs'
import python from 'shiki/dist/langs/python.mjs'
import shellscript from 'shiki/dist/langs/shellscript.mjs'
import sql from 'shiki/dist/langs/sql.mjs'
import tsx from 'shiki/dist/langs/tsx.mjs'
import typescript from 'shiki/dist/langs/typescript.mjs'
import yaml from 'shiki/dist/langs/yaml.mjs'
import zsh from 'shiki/dist/langs/zsh.mjs'
import githubDark from 'shiki/dist/themes/github-dark.mjs'
import githubLight from 'shiki/dist/themes/github-light.mjs'

export type ReaderCodeTheme = 'github-light' | 'github-dark'

const THEMES = [githubLight, githubDark] as const
const LANGUAGES = [
  javascript,
  typescript,
  jsx,
  tsx,
  json,
  bash,
  shellscript,
  zsh,
  go,
  sql,
  markdown,
  yaml,
  python,
  html,
  css,
] as const

const SUPPORTED_LANGUAGES = new Set([
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'json',
  'bash',
  'shellscript',
  'zsh',
  'go',
  'sql',
  'markdown',
  'yaml',
  'python',
  'html',
  'css',
])

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  cjs: 'javascript',
  mjs: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  mdx: 'markdown',
  md: 'markdown',
  yml: 'yaml',
  sh: 'bash',
  shell: 'shellscript',
  console: 'bash',
  py: 'python',
  text: '',
  plaintext: '',
  plain: '',
  txt: '',
}

let highlighterPromise: ReturnType<typeof createHighlighterCore> | null = null

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [...THEMES],
      langs: [...LANGUAGES],
      engine: createJavaScriptRegexEngine(),
    })
  }

  return highlighterPromise
}

const normalizeLanguage = (language?: string) => {
  if (!language) return ''

  const cleaned = language.trim().toLowerCase()
  const aliasResolved = LANGUAGE_ALIASES[cleaned] ?? cleaned

  if (!aliasResolved) return ''
  if (SUPPORTED_LANGUAGES.has(aliasResolved)) return aliasResolved

  return ''
}

const renderPlainCodeBlock = (code: string) =>
  `<pre tabindex="0"><code>${escapeHtml(code)}</code></pre>`

export const highlightCodeBlock = async (
  code: string,
  language: string | undefined,
  theme: ReaderCodeTheme,
) => {
  const normalizedLanguage = normalizeLanguage(language)

  if (!normalizedLanguage) {
    return renderPlainCodeBlock(code)
  }

  try {
    const highlighter = await getHighlighter()

    return highlighter.codeToHtml(code, {
      lang: normalizedLanguage,
      theme,
    })
  } catch (error) {
    console.error('Failed to highlight code block with Shiki:', error)
    return renderPlainCodeBlock(code)
  }
}

export const highlightMarkdownCodeBlocks = async (html: string, theme: ReaderCodeTheme) => {
  if (!html.includes('<pre><code')) return html

  const parser = new DOMParser()
  const documentFragment = parser.parseFromString(html, 'text/html')
  const codeBlocks = Array.from(documentFragment.querySelectorAll('pre > code'))

  await Promise.all(
    codeBlocks.map(async (codeElement) => {
      const preElement = codeElement.parentElement
      if (!preElement) return

      const className = codeElement.getAttribute('class') || ''
      const language =
        className.match(/language-([\w-]+)/)?.[1] || className.match(/lang-([\w-]+)/)?.[1]
      const code = codeElement.textContent ?? ''

      const shikiHTML = await highlightCodeBlock(code, language, theme)
      const shikiDocument = parser.parseFromString(shikiHTML, 'text/html')
      const replacement = shikiDocument.body.firstElementChild

      if (!replacement) return

      preElement.replaceWith(replacement)
    }),
  )

  return documentFragment.body.innerHTML
}
