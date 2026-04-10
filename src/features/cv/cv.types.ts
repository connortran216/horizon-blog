import { IconType } from 'react-icons'

export interface CvLinkItem {
  label: string
  href?: string
  to?: string
  icon: IconType
  isExternal?: boolean
}

export interface CvCompetencyGroup {
  title: string
  items: string[]
}

export interface CvExperience {
  company: string
  role: string
  period: string
  productionUrl?: string
  highlights: string[]
  stack: string[]
}

export interface CvProject {
  title: string
  period?: string
  githubUrl?: string
  publicationUrl?: string
  description: string
  stack: string[]
}

export interface CvEducation {
  school: string
  degree: string
  period: string
  details: string[]
}

export interface CvProfile {
  name: string
  title: string
  location: string
  email: string
  summary: string
  competencies: CvCompetencyGroup[]
  links: CvLinkItem[]
  experience: CvExperience[]
  projects: CvProject[]
  education: CvEducation[]
}
