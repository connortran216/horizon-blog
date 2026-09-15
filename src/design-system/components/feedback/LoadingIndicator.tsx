/**
 * Horizon Design System v2 - the loading indicator and its three scopes.
 *
 * `PageLoading` blocks a route, `PanelLoading` blocks a region, `InlineLoading`
 * sits next to an action. They differ only in what they reserve, which is the
 * distinction the design contract draws between route loading and content
 * loading - content-shaped loading is `Skeleton`, not any of these.
 *
 * Each one names its task. `LoadingIndicator` takes `task` as a required prop
 * and `loadingMessage` rejects a blank one, so a spinner with no explanation is
 * not a state this component can reach.
 */

import { Flex, Spinner, Text, VisuallyHidden, type FlexProps } from '@chakra-ui/react'

import { componentTokens } from '../../../theme/tokens'
import { spinnerSpeed, useMotionPolicy } from '../../motion'
import {
  liveRegionFor,
  loadingLayoutFor,
  loadingMessage,
  type LoadingScope,
} from './feedback.logic'

export interface LoadingIndicatorProps extends Omit<FlexProps, 'children'> {
  /** A noun phrase: "the article", "your drafts". */
  task: string
  scope: LoadingScope
  /** Hide the label visually while keeping it in the live region. */
  hideLabel?: boolean
}

export function LoadingIndicator({
  task,
  scope,
  hideLabel = false,
  ...rest
}: LoadingIndicatorProps) {
  const policy = useMotionPolicy()
  const layout = loadingLayoutFor(scope)
  const message = loadingMessage(task)

  return (
    <Flex
      {...liveRegionFor('loading')}
      direction={scope === 'inline' ? 'row' : 'column'}
      align="center"
      justify="center"
      gap={layout.gap}
      minHeight={layout.minHeight}
      width="100%"
      {...rest}
    >
      <Spinner
        size={layout.spinnerSize}
        emptyColor={componentTokens.reader.progressTrack}
        color={componentTokens.reader.progressIndicator}
        // Reduced motion keeps the ring but stops the turn. The label, not the
        // rotation, is what tells the reader something is happening.
        speed={policy.loadingRhythm ? spinnerSpeed() : '0s'}
        aria-hidden="true"
      />
      {hideLabel ? (
        // Hidden from sight, not from the live region - the announcement is the
        // whole point of naming the task.
        <VisuallyHidden>{message}</VisuallyHidden>
      ) : (
        <Text textStyle={layout.textStyle} color="text.secondary">
          {message}
        </Text>
      )}
    </Flex>
  )
}

export type ScopedLoadingProps = Omit<LoadingIndicatorProps, 'scope'>

/** A route the reader cannot use yet. Reserves the viewport. */
export function PageLoading(props: ScopedLoadingProps) {
  return <LoadingIndicator scope="route" {...props} />
}

/** A region of an otherwise usable page. Reserves the region. */
export function PanelLoading(props: ScopedLoadingProps) {
  return <LoadingIndicator scope="panel" {...props} />
}

/** Feedback beside an action. Reserves nothing and must not move text. */
export function InlineLoading(props: ScopedLoadingProps) {
  return <LoadingIndicator scope="inline" {...props} />
}
