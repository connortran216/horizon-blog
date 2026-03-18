# Auth

## Intent

Auth pages should feel trustworthy, clear, and low-friction.

They are not marketing pages.

## Covered Routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

## Primary Actions

- complete the form
- move to the adjacent auth route when necessary

## Layout

- centered auth shell
- one calm form card
- no loud promotional side content

## Hierarchy

- clear title
- short helper copy
- fields
- primary submit action
- secondary route link

## Core Components

- `AuthShell`
- Chakra `Input`
- Chakra `Textarea` when needed
- shared button variants

## Motion

- minimal
- default button and page-entry feedback is enough
- no decorative particles in normal auth flow

## Accessibility Notes

- every field has a visible label
- validation must be explicit
- success and error states cannot rely on color alone

## Content Notes

- keep copy direct and human
- avoid product slogan language
