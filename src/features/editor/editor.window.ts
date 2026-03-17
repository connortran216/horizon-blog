export interface EditorWindowState {
  title: string
  content_markdown: string
  handlePublish: () => Promise<boolean>
}

declare global {
  interface Window {
    editorState?: EditorWindowState
  }
}

export {}
