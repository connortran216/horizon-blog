import { createContext, useContext } from 'react'

import type { FieldAriaOutput } from './field.logic'

/**
 * The wiring a `Field` computed, handed down to whichever control it wraps.
 *
 * A control reads it instead of receiving eight props, which is what stops a
 * caller from wiring `aria-describedby` on the `Input` and forgetting it on the
 * `Textarea` beside it. A control used outside a Field gets `undefined` and must
 * carry its own label - that is allowed, but it is then the caller's problem.
 */
export const FieldContext = createContext<FieldAriaOutput | undefined>(undefined)

export function useFieldAria(): FieldAriaOutput | undefined {
  return useContext(FieldContext)
}
