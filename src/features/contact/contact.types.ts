import { IconType } from 'react-icons'

export interface ContactInfoItem {
  icon: IconType
  title: string
  content: string
  href?: string
  description?: string
  actionLabel?: string
  variant?: 'primary' | 'secondary'
}

export interface ContactPromptItem {
  icon: IconType
  title: string
  description: string
}
