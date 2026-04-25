import { CrepeFeature } from '@milkdown/crepe'
import type { BlockEditFeatureConfig } from '@milkdown/crepe/feature/block-edit'
import type { CodeMirrorFeatureConfig } from '@milkdown/crepe/feature/code-mirror'
import type { ToolbarFeatureConfig } from '@milkdown/crepe/feature/toolbar'
import { editorViewCtx, schemaCtx } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'
import type { NodeType } from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import DOMPurify from 'dompurify'
import type { Mermaid as MermaidInstance, MermaidConfig } from 'mermaid'

const MERMAID_LANGUAGE = 'mermaid'
const FALLBACK_TEMPLATE = 'flowchart TD\n  A[Start] --> B[End]'

let mermaidImportPromise: Promise<MermaidInstance> | null = null
let configuredTheme: MermaidTheme | null = null
let mermaidRenderSequence = 0

type PreviewValue = null | string | HTMLElement

interface MermaidRenderResult {
  preview: HTMLElement
  targetId: string
  svg: string
}

export type MermaidTheme = 'dark' | 'neutral'

export interface MermaidInsertOptions {
  defaultTemplate: string
}

export interface MermaidPreviewRendererOptions {
  previewLoadingText: string
  readOnly: boolean
  theme: MermaidTheme
}

export interface MermaidCrepeFeatureConfigOptions extends MermaidPreviewRendererOptions {
  defaultTemplate: string
}

export const MERMAID_ICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M4 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h1.59l1.7-1.71L16.7 5.7L13.41 9H12v1a2 2 0 0 1-2 2H8v2h2a2 2 0 0 1 2 2v3H6v-3a2 2 0 0 1 2-2h1v-2H6a2 2 0 0 1-2-2V5Zm2 0v5h4V5H6Zm2 11v1h2v-1H8Zm8-5a2 2 0 0 1 2 2v6h-6v-6a2 2 0 0 1 2-2h2Zm-2 2v4h2v-4h-2Z"
    />
  </svg>
`

const getMermaidModule = async (): Promise<MermaidInstance> => {
  if (!mermaidImportPromise) {
    mermaidImportPromise = import('mermaid/dist/mermaid.esm.mjs').then((module) => module.default)
  }

  return mermaidImportPromise
}

const ensureMermaidConfigured = async (theme: MermaidTheme): Promise<MermaidInstance> => {
  const mermaid = await getMermaidModule()

  if (configuredTheme !== theme) {
    const config: MermaidConfig = {
      startOnLoad: false,
      securityLevel: 'strict',
      theme,
    }

    mermaid.initialize(config)
    configuredTheme = theme
  }

  return mermaid
}

const createPreviewShell = (className: string, title: string, body: string): HTMLElement => {
  const shell = document.createElement('div')
  shell.className = `mermaid-preview ${className}`.trim()

  const titleElement = document.createElement('p')
  titleElement.className = 'mermaid-preview__title'
  titleElement.textContent = title

  const bodyElement = document.createElement('p')
  bodyElement.className = 'mermaid-preview__body'
  bodyElement.textContent = body

  shell.append(titleElement, bodyElement)

  return shell
}

const createMermaidErrorPreview = (error: unknown): HTMLElement => {
  const message =
    error instanceof Error && error.message.trim().length > 0
      ? error.message
      : 'Invalid Mermaid syntax.'

  return createPreviewShell('mermaid-preview--error', 'Diagram error', message)
}

const createMermaidLoadingPreview = (message: string): HTMLElement =>
  createPreviewShell('mermaid-preview--loading', 'Diagram preview', message)

export const sanitizeMermaidSvg = (svg: string): string =>
  DOMPurify.sanitize(svg, {
    USE_PROFILES: {
      html: true,
      svg: true,
      svgFilters: true,
    },
    ADD_TAGS: ['foreignObject', 'foreignobject', 'div', 'span', 'p', 'br'],
    ADD_ATTR: [
      'alignment-baseline',
      'aria-label',
      'aria-roledescription',
      'background-color',
      'class',
      'clip-path',
      'color',
      'd',
      'data-id',
      'dominant-baseline',
      'dx',
      'dy',
      'fill',
      'font-family',
      'font-size',
      'font-weight',
      'height',
      'href',
      'id',
      'lengthAdjust',
      'marker-end',
      'marker-mid',
      'marker-start',
      'markerHeight',
      'markerUnits',
      'markerWidth',
      'orient',
      'preserveAspectRatio',
      'refX',
      'refY',
      'role',
      'rx',
      'ry',
      'stroke',
      'stroke-dasharray',
      'stroke-dashoffset',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-width',
      'style',
      'text-anchor',
      'transform',
      'viewBox',
      'width',
      'x',
      'x1',
      'x2',
      'xlink:href',
      'xmlns',
      'xmlns:xlink',
      'y',
      'y1',
      'y2',
    ],
  })

const createMermaidZoomButton = (): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'mermaid-preview__zoom-button'
  button.dataset.mermaidZoomTrigger = 'true'
  button.textContent = 'Zoom'
  button.setAttribute('aria-label', 'Open Mermaid diagram zoom view')

  return button
}

const createMermaidPreview = (targetId: string, readOnly: boolean): HTMLElement => {
  const shell = document.createElement('div')
  shell.className = 'mermaid-preview'

  if (readOnly) {
    shell.classList.add('mermaid-preview--read')
  }

  const diagram = document.createElement('div')
  diagram.className = 'mermaid-preview__diagram'
  diagram.id = targetId
  diagram.dataset.mermaidPreviewTarget = 'true'

  if (readOnly) {
    const toolbar = document.createElement('div')
    toolbar.className = 'mermaid-preview__toolbar'
    toolbar.append(createMermaidZoomButton())
    shell.append(toolbar, diagram)
  } else {
    shell.append(diagram)
  }

  return shell
}

const mountSanitizedMermaidSvg = (targetId: string, svg: string, attempts = 12): void => {
  const target = document.getElementById(targetId)

  if (target) {
    target.innerHTML = sanitizeMermaidSvg(svg)
    return
  }

  if (attempts <= 0) {
    return
  }

  requestAnimationFrame(() => {
    mountSanitizedMermaidSvg(targetId, svg, attempts - 1)
  })
}

const getMermaidCursorOffset = (template: string): number => {
  const normalizedTemplate = template.replace(/\r\n?/g, '\n')
  const firstLineBreak = normalizedTemplate.indexOf('\n')

  if (firstLineBreak === -1) {
    return normalizedTemplate.length
  }

  let cursorOffset = firstLineBreak + 1

  while (normalizedTemplate[cursorOffset] === ' ') {
    cursorOffset += 1
  }

  return cursorOffset
}

const getCodeBlockType = (ctx: Ctx): NodeType | null => {
  const schema = ctx.get(schemaCtx) as { nodes: Record<string, NodeType> }
  return schema.nodes.code_block ?? null
}

const focusMermaidCodeEditor = (view: EditorView, nodeStartPos: number): void => {
  requestAnimationFrame(() => {
    const blockDom = view.nodeDOM(nodeStartPos)

    if (!(blockDom instanceof HTMLElement)) {
      view.focus()
      return
    }

    const codeMirrorContent = blockDom.querySelector<HTMLElement>('.cm-content')

    if (codeMirrorContent) {
      codeMirrorContent.focus()
      return
    }

    view.focus()
  })
}

const renderMermaidSvg = async (
  source: string,
  theme: MermaidTheme,
  readOnly: boolean,
): Promise<MermaidRenderResult> => {
  const mermaid = await ensureMermaidConfigured(theme)
  const renderId = `horizon-mermaid-${++mermaidRenderSequence}`
  const { svg } = await mermaid.render(renderId, source)

  return {
    preview: createMermaidPreview(`${renderId}-preview`, readOnly),
    targetId: `${renderId}-preview`,
    svg,
  }
}

export const isMermaidLanguage = (language: string | null | undefined): boolean =>
  (language ?? '').trim().toLowerCase() === MERMAID_LANGUAGE

export const isMermaidSelection = (view: EditorView): boolean => {
  const parent = view.state.selection.$from.parent

  return parent.type.name === 'code_block' && isMermaidLanguage(parent.attrs.language as string)
}

export const insertMermaidBlock = (ctx: Ctx, { defaultTemplate }: MermaidInsertOptions): void => {
  const view = ctx.get(editorViewCtx) as EditorView
  const codeBlock = getCodeBlockType(ctx)

  if (!codeBlock) {
    return
  }

  const template = (defaultTemplate || FALLBACK_TEMPLATE).replace(/\r\n?/g, '\n')
  const blockNode = codeBlock.create(
    { language: MERMAID_LANGUAGE },
    view.state.schema.text(template),
  )
  const { selection } = view.state
  const currentBlockIsEmpty =
    selection.empty &&
    selection.$from.parent.isTextblock &&
    selection.$from.parent.textContent.trim().length === 0

  let tr = view.state.tr
  let nodeStartPos = selection.from

  if (currentBlockIsEmpty) {
    nodeStartPos = selection.$from.before()
    tr = tr.replaceWith(nodeStartPos, selection.$from.after(), blockNode)
  } else {
    nodeStartPos = selection.from
    tr = tr.replaceSelectionWith(blockNode, false)
  }

  const cursorPos = Math.min(
    nodeStartPos + 1 + getMermaidCursorOffset(template),
    tr.doc.content.size,
  )

  tr = tr.setSelection(TextSelection.create(tr.doc, cursorPos)).scrollIntoView()
  view.dispatch(tr)
  focusMermaidCodeEditor(view, nodeStartPos)
}

export const createMermaidPreviewRenderer = ({
  previewLoadingText,
  readOnly,
  theme,
}: MermaidPreviewRendererOptions) => {
  return (
    language: string,
    content: string,
    applyPreview: (value: PreviewValue) => void,
  ): void | null => {
    if (!isMermaidLanguage(language)) {
      return null
    }

    const source = content.trim()

    if (!source) {
      applyPreview(
        createPreviewShell(
          'mermaid-preview--loading',
          'Diagram preview',
          'Add Mermaid syntax to render a diagram.',
        ),
      )
      return
    }

    applyPreview(createMermaidLoadingPreview(previewLoadingText))

    void renderMermaidSvg(source, theme, readOnly)
      .then(({ preview, targetId, svg }) => {
        applyPreview(preview)
        mountSanitizedMermaidSvg(targetId, svg)
      })
      .catch((error) => {
        applyPreview(createMermaidErrorPreview(error))
      })
  }
}

export const createMermaidFeatureConfigs = ({
  defaultTemplate,
  previewLoadingText,
  readOnly,
  theme,
}: MermaidCrepeFeatureConfigOptions) => {
  const insertDefaultMermaidBlock = (ctx: Ctx): void => {
    insertMermaidBlock(ctx, { defaultTemplate })
  }
  const codeMirrorConfig: CodeMirrorFeatureConfig = {
    renderPreview: createMermaidPreviewRenderer({
      previewLoadingText,
      readOnly,
      theme,
    }),
    previewLabel: 'Diagram',
    previewLoading: previewLoadingText,
    previewOnlyByDefault: readOnly,
    previewToggleText: (previewOnlyMode) => (previewOnlyMode ? 'Show code' : 'Show diagram'),
  }
  const blockEditConfig: BlockEditFeatureConfig = {
    buildMenu: (builder) => {
      builder.getGroup('advanced').addItem('mermaid', {
        label: 'Mermaid',
        icon: MERMAID_ICON,
        onRun: insertDefaultMermaidBlock,
      })
    },
  }
  const toolbarConfig: ToolbarFeatureConfig = {
    buildToolbar: (builder) => {
      builder.getGroup('function').addItem('mermaid', {
        icon: MERMAID_ICON,
        active: (ctx) => {
          const view = ctx.get(editorViewCtx) as EditorView
          return isMermaidSelection(view)
        },
        onRun: insertDefaultMermaidBlock,
      })
    },
  }

  return {
    [CrepeFeature.CodeMirror]: codeMirrorConfig,
    [CrepeFeature.BlockEdit]: blockEditConfig,
    [CrepeFeature.Toolbar]: toolbarConfig,
  }
}
