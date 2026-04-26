import { getBlogService } from '../../core'
import { BlogPost, PublicPostRecord } from '../../core/types/blog.types'
import { BlogServicePostInput, IBlogService } from '../../core/types/blog-service.types'

export interface EditorPostInput {
  title: string
  content_markdown: string
  content_json?: string
  tag_names?: string[]
}

export interface SavedEditorPost {
  post: BlogPost
  id: string
}

const toBlogServiceInput = (input: EditorPostInput): BlogServicePostInput => ({
  title: input.title,
  content_markdown: input.content_markdown,
  content_json: input.content_json,
  tag_names: input.tag_names,
})

export class EditorPostService {
  constructor(private readonly blogService: IBlogService = getBlogService()) {}

  async loadEditablePost(id: string, currentUserId: number): Promise<PublicPostRecord> {
    return this.blogService.getEditablePostById(id, currentUserId)
  }

  async saveDraft(id: string | null, input: EditorPostInput): Promise<SavedEditorPost> {
    const post = id
      ? await this.blogService.updateDraft(id, toBlogServiceInput(input))
      : await this.blogService.createDraft(toBlogServiceInput(input))

    return {
      post,
      id: post.id,
    }
  }

  async publish(id: string | null, input: EditorPostInput): Promise<BlogPost> {
    return this.blogService.publishPost(id, toBlogServiceInput(input))
  }
}

export const editorPostService = new EditorPostService()

export const getEditorPostService = (): EditorPostService => editorPostService
