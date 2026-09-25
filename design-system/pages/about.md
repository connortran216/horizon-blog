# About

## Intent

The About page explains the person and philosophy behind Horizon.

It should feel personal and designed, not corporate.

## Covered Routes

- `/about`

## Primary Actions

- understand who is behind the blog
- understand the principles behind the writing and product
- move toward reading or getting in touch

## Layout

- one clear intro section: a full-bleed field band, no card around it
- the editorial track directly under the band
- supporting signal/principle cards
- optional founder note section

## Hierarchy

- page intro
- signal or principle group
- founder or personal note
- optional external links

## Core Components

- `AboutStatCard`
- standard editorial card and section patterns

## Motion

- the hero is unboxed: a full-bleed `SynapseField` band under a header with no bar at the top of
  the page (as on Home), the copy in the content frame on its left, the network gathering on its
  right; the field writes the headline, "quieter interface." carries the drawn rule, and the lede
  and calls to action follow as on Home
- the editorial track sits under the band: each thread stands on a quiet rule, and the current
  thread's rule draws in the action colour with a signal at its tip (`SignalLine drawn`)
- the editorial track leans the field towards the current thread (`threadFocus`)
- the Signals band is a `SignalRoute`: one rule draws over it and writes each figure as it passes

## Accessibility Notes

- cards must remain readable in both modes
- decorative icon color must never reduce contrast

## Content Notes

- talk about the blog, the writing, and the craft
- avoid archive/notebook framing
- avoid startup-style metric bragging
