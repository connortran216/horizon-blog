import { CommentsService } from './comments.service'

let commentsService: CommentsService | undefined

export const getCommentsService = (): CommentsService => {
  commentsService ??= new CommentsService()
  return commentsService
}
