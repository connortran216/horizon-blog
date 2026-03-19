import {
  PublicAuthor,
  PublicAuthorArchive,
  PublicAuthorPostsPage,
} from '../../core/types/blog.types'

export type AuthorArchiveData = PublicAuthorArchive
export type AuthorArchiveUser = PublicAuthor
export type AuthorPostsPage = PublicAuthorPostsPage

export interface AuthorArchiveErrorState {
  statusCode?: number
  title: string
  description: string
}
