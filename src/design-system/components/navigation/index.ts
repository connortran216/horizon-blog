export { NavItem } from './NavItem'
export type { NavItemProps } from './NavItem'

export { NavTrack, useInNavTrack } from './NavTrack'
export type { NavTrackProps } from './NavTrack'

export { ThemeToggle } from './ThemeToggle'
export type { ThemeToggleProps } from './ThemeToggle'

export { RailControl } from './RailControl'
export type { RailControlProps } from './RailControl'

export {
  currentItemSignals,
  navItemElement,
  navItemState,
  nextThemeMode,
  railControlAria,
  themeToggleOptions,
} from './navigation.logic'
export { spanWithin, trackIndicator, trackLead } from './navTrack.logic'
export type { TrackIndicator, TrackLead, TrackSpan } from './navTrack.logic'
export type {
  NavItemElement,
  NavItemStateInput,
  NavItemStateStyle,
  RailControlAria,
  RailDirection,
  ThemeMode,
  ThemeToggleOption,
} from './navigation.logic'
