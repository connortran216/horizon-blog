import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from 'shiki/dist/langs/bash.mjs'
import css from 'shiki/dist/langs/css.mjs'
import go from 'shiki/dist/langs/go.mjs'
import html from 'shiki/dist/langs/html.mjs'
import java from 'shiki/dist/langs/java.mjs'
import javascript from 'shiki/dist/langs/javascript.mjs'
import json from 'shiki/dist/langs/json.mjs'
import jsx from 'shiki/dist/langs/jsx.mjs'
import markdown from 'shiki/dist/langs/markdown.mjs'
import python from 'shiki/dist/langs/python.mjs'
import rust from 'shiki/dist/langs/rust.mjs'
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
  java,
  sql,
  markdown,
  yaml,
  python,
  html,
  css,
  rust,
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
  'java',
  'sql',
  'markdown',
  'yaml',
  'python',
  'html',
  'css',
  'rust',
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
  rs: 'rust',
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

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  json: 'JSON',
  bash: 'Bash',
  shellscript: 'Shell',
  zsh: 'Zsh',
  go: 'Go',
  java: 'Java',
  sql: 'SQL',
  markdown: 'Markdown',
  yaml: 'YAML',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  rust: 'Rust',
}

const toLanguageLabel = (language?: string) => {
  const normalizedLanguage = normalizeLanguage(language)

  if (normalizedLanguage) {
    return LANGUAGE_LABELS[normalizedLanguage] ?? normalizedLanguage.toUpperCase()
  }

  const cleaned = language?.trim()
  if (!cleaned) return 'Plain text'

  return cleaned
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const ensureLineWrappers = (document: Document, codeElement: HTMLElement) => {
  const existingLines = codeElement.querySelectorAll(':scope > span.line')
  if (existingLines.length > 0) return

  const code = codeElement.textContent ?? ''
  const normalizedCode = code.endsWith('\n') ? code.slice(0, -1) : code
  const lines = normalizedCode.split('\n')

  codeElement.textContent = ''

  lines.forEach((line) => {
    const lineElement = document.createElement('span')
    lineElement.className = 'line'
    lineElement.textContent = line.length > 0 ? line : ' '
    codeElement.appendChild(lineElement)
  })
}

const decorateCodeBlock = (html: string, language?: string) => {
  const parser = new DOMParser()
  const document = parser.parseFromString(html, 'text/html')
  const preElement = document.querySelector('pre')
  const codeElement = document.querySelector('code')

  if (!preElement || !codeElement) return html

  ensureLineWrappers(document, codeElement)

  preElement.classList.add('preview-code-block__pre')
  preElement.setAttribute('tabindex', '0')
  codeElement.classList.add('preview-code-block__code')

  const shell = document.createElement('div')
  shell.className = 'preview-code-block'

  const header = document.createElement('div')
  header.className = 'preview-code-block__header'

  const chrome = document.createElement('div')
  chrome.className = 'preview-code-block__chrome'
  ;[
    'preview-code-block__dot--red',
    'preview-code-block__dot--amber',
    'preview-code-block__dot--green',
  ]
    .map((className) => {
      const dot = document.createElement('span')
      dot.className = `preview-code-block__dot ${className}`
      return dot
    })
    .forEach((dot) => chrome.appendChild(dot))

  const languageBadge = document.createElement('span')
  languageBadge.className = 'preview-code-block__language'
  languageBadge.textContent = toLanguageLabel(language)

  header.append(chrome, languageBadge)
  shell.append(header, preElement)

  return shell.outerHTML
}

export const highlightCodeBlock = async (
  code: string,
  language: string | undefined,
  theme: ReaderCodeTheme,
) => {
  const normalizedLanguage = normalizeLanguage(language)

  if (!normalizedLanguage) {
    return decorateCodeBlock(renderPlainCodeBlock(code), language)
  }

  try {
    const highlighter = await getHighlighter()

    const highlightedHtml = highlighter.codeToHtml(code, {
      lang: normalizedLanguage,
      theme,
    })

    return decorateCodeBlock(highlightedHtml, normalizedLanguage)
  } catch (error) {
    console.error('Failed to highlight code block with Shiki:', error)
    return decorateCodeBlock(renderPlainCodeBlock(code), language)
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
