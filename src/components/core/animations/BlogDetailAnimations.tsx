/**
 * Shared Blog Detail Animation Components
 *
 * Provides consistent motion effects for both BlogDetail and ProfileBlogDetail pages
 * without duplicating animation logic.
 */

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { VStack, Heading, Divider, Avatar, Text, HStack, Box } from '@chakra-ui/react'
import { Glassmorphism } from './Glassmorphism'

interface BlogPost {
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

// Shared back button animation component
interface BackButtonAnimationProps {
  children: ReactNode
}

export const BackButtonAnimation = ({ children }: BackButtonAnimationProps) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    {children}
  </motion.div>
)

// Shared title animation component
interface TitleAnimationProps {
  title: string
  headingColor?: string
}

export const TitleAnimation = ({ title, headingColor = 'text.primary' }: TitleAnimationProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
  >
    <Heading as="h1" size="2xl" color={headingColor} lineHeight="1.2">
      {title}
    </Heading>
  </motion.div>
)

// Shared author info animation component
interface AuthorAnimationProps {
  post: BlogPost
  authorNameColor?: string
  dateColor?: string
}

export const AuthorAnimation = ({
  post,
  authorNameColor = 'text.primary',
  dateColor = 'text.tertiary',
}: AuthorAnimationProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.6 }}
  >
    <Glassmorphism p={4} borderRadius="lg">
      <HStack spacing={4}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Avatar size="md" name={post.user?.name || 'Anonymous'} />
        </motion.div>
        <Box>
          <Text fontWeight="bold" color={authorNameColor} fontSize="lg">
            {post.user?.name || 'Anonymous'}
          </Text>
          <Text fontSize="sm" color={dateColor}>
            Published on {new Date(post.created_at).toLocaleDateString()}
            {post.created_at !== post.updated_at &&
              ` • Updated on ${new Date(post.updated_at).toLocaleDateString()}`}
          </Text>
        </Box>
      </HStack>
    </Glassmorphism>
  </motion.div>
)

// Shared divider animation component
interface DividerAnimationProps {
  dividerColor?: string
}

export const DividerAnimation = ({ dividerColor = 'border.subtle' }: DividerAnimationProps) => (
  <motion.div
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    transition={{ duration: 0.6, delay: 0.8 }}
  >
    <Divider my={4} borderColor={dividerColor} />
  </motion.div>
)

// Shared content animation component
interface ContentAnimationProps {
  children: ReactNode
  hasPaddingBottom?: boolean
}

export const ContentAnimation = ({ children, hasPaddingBottom = false }: ContentAnimationProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 1 }}
    style={{
      paddingBottom: hasPaddingBottom ? '5vh' : undefined, // Extra space for reading progress
    }}
  >
    {children}
  </motion.div>
)

// Complete blog detail structure with all animations
interface BlogDetailStructureProps {
  post: BlogPost
  backButton: ReactNode
  additionalContent?: ReactNode
  hasPaddingBottom?: boolean
  headingColor?: string
  authorNameColor?: string
  dateColor?: string
  dividerColor?: string
}

export const BlogDetailStructure = ({
  post,
  backButton,
  additionalContent,
  headingColor = 'text.primary',
  authorNameColor = 'text.primary',
  dateColor = 'text.tertiary',
  dividerColor = 'border.subtle',
}: BlogDetailStructureProps) => (
  <VStack spacing={6} align="stretch">
    {/* Back Button */}
    <BackButtonAnimation>{backButton}</BackButtonAnimation>

    {/* Title */}
    <TitleAnimation title={post.title} headingColor={headingColor} />

    {/* Author Info */}
    <AuthorAnimation post={post} authorNameColor={authorNameColor} dateColor={dateColor} />

    {/* Additional content (like profile-specific messages) */}
    {additionalContent && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        {additionalContent}
      </motion.div>
    )}

    {/* Divider */}
    <DividerAnimation dividerColor={dividerColor} />

    {/* Content container - to be filled by page-specific content */}
    <div />
  </VStack>
)

export default {
  BackButtonAnimation,
  TitleAnimation,
  AuthorAnimation,
  DividerAnimation,
  ContentAnimation,
  BlogDetailStructure,
}
