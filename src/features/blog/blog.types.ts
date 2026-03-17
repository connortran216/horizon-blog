export interface BlogArchivePost {
  id: number
  title: string
  content_markdown: string
  content_json: string
  status: string
  user_id: number
  created_at: string
  updated_at: string
  user?: {
    name: string
    email: string
  }
}
