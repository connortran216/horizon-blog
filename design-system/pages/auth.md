# Auth

## Intent

Auth pages should feel trustworthy, calm, and minimal. Their job is to remove friction, not to showcase visual effects.

## Covered Routes

- login
- register
- forgot-password
- reset-password

## Primary Actions

- complete the form
- move to the adjacent auth route when needed

## Layout

- centered `FormShell`
- single `FormCard`
- restrained copy
- no unnecessary secondary visuals

## Hierarchy

- clear form title
- short helper text
- form controls
- primary submit action
- secondary link below or above the form

## Components

- `PageHeader`
- `FormCard`
- shared field groups
- inline validation and status messaging

## Motion

- almost none beyond default page entry and button feedback
- no particles, glass effects, or attention-grabbing transitions in normal flows

## Accessibility Notes

- every field needs a label
- validation copy must be explicit
- success and error states must not rely on color alone
