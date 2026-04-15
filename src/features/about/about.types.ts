import { IconType } from 'react-icons'

export interface AboutStatItem {
  label: string
  value: string
  description?: string
  icon: IconType
}

export interface AboutPrinciple {
  icon: IconType
  title: string
  description: string
}

export interface AboutFocusThread {
  label: string
  title: string
  description: string
}
