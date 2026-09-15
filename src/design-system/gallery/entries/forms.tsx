/**
 * Horizon Design System v2 - form entries.
 *
 * Every control is mounted inside a real `Field` wherever the field is what
 * gives it a name, because that is the only arrangement production is allowed
 * to use. The bare mounts that follow are the documented exception - a control
 * carrying its own `aria-label`.
 */

import { useContext, useState } from 'react'
import { Box, RadioGroup } from '@chakra-ui/react'

import {
  Checkbox,
  Field,
  FieldContext,
  Input,
  Radio,
  Select,
  Switch,
  Textarea,
  useFieldAria,
} from '../../index'
import { space } from '../../../theme/tokens'
import { useGallery } from '../GalleryContext'
import { longCopy } from '../content'
import { ReadOut, type EntryRenderer } from './support'

const HINT = 'We only use this to send the confirmation link.'
const ERROR = 'That address is missing an @ sign.'

function FieldEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const label = gallery.copy('Email address', longCopy.label)

  if (state === 'group') {
    return (
      <Field label="Sample notifications" control="group" hint="Choose as many as you like.">
        <Box display="flex" flexDirection="column" gap={space[2]}>
          <Checkbox defaultChecked>New comments on my sample posts</Checkbox>
          <Checkbox>Weekly sample digest</Checkbox>
        </Box>
      </Field>
    )
  }

  if (state === 'invalid') {
    return (
      <Field label={label} id="gallery-field-invalid" hint={HINT} error={ERROR}>
        <Input defaultValue="sample.author" />
      </Field>
    )
  }

  if (state === 'required with hint') {
    return (
      <Field label={label} id="gallery-field-required" hint={HINT} isRequired>
        <Input placeholder="sample.author@example.com" />
      </Field>
    )
  }

  return (
    <Field label={label} id="gallery-field-ready">
      <Input placeholder="sample.author@example.com" />
    </Field>
  )
}

function InputEntry({ state }: { readonly state: string }) {
  if (state === 'invalid') {
    return (
      <Field label="Email address" id="gallery-input-invalid" error={ERROR}>
        <Input defaultValue="sample.author" />
      </Field>
    )
  }

  if (state === 'disabled') {
    return (
      <Field label="Email address" id="gallery-input-disabled" isDisabled>
        <Input defaultValue="sample.author@example.com" />
      </Field>
    )
  }

  return <Input aria-label="Sample search" placeholder="Search sample posts" />
}

function TextareaEntry({ state }: { readonly state: string }) {
  if (state === 'invalid') {
    return (
      <Field
        label="Biography"
        id="gallery-textarea-invalid"
        error="That biography is longer than the server accepts."
      >
        <Textarea defaultValue={longCopy.excerpt} rows={3} />
      </Field>
    )
  }

  return (
    <Field label="Biography" id="gallery-textarea" hint="Two or three sentences is plenty.">
      <Textarea placeholder="Sample biography" rows={3} />
    </Field>
  )
}

function SelectEntry({ state }: { readonly state: string }) {
  return (
    <Field
      label="Sort sample posts by"
      id={state === 'disabled' ? 'gallery-select-disabled' : 'gallery-select'}
      isDisabled={state === 'disabled'}
    >
      <Select placeholder="Choose an order">
        <option value="newest">Latest first</option>
        <option value="shortest">Quick reads first</option>
      </Select>
    </Field>
  )
}

function CheckboxEntry({ state }: { readonly state: string }) {
  if (state === 'invalid') {
    return (
      <Field
        label="Sample agreement"
        control="group"
        id="gallery-checkbox-invalid"
        error="You have to accept the sample terms before continuing."
      >
        <Checkbox>I accept the sample terms</Checkbox>
      </Field>
    )
  }

  if (state === 'disabled') {
    return <Checkbox isDisabled>Unavailable sample option</Checkbox>
  }

  return <Checkbox defaultChecked={state === 'checked'}>Weekly sample digest</Checkbox>
}

function RadioEntry({ state }: { readonly state: string }) {
  const [value, setValue] = useState('member')

  return (
    <Field label="Sample role" control="group" hint="Only one applies.">
      <RadioGroup value={value} onChange={setValue} name="gallery-sample-role">
        <Box display="flex" flexDirection="column" gap={space[2]}>
          <Radio value="member" isDisabled={state === 'disabled'}>
            Member
          </Radio>
          <Radio value="author" isDisabled={state === 'disabled'}>
            Author
          </Radio>
          <Radio value="admin" isDisabled={state === 'disabled'}>
            Admin
          </Radio>
        </Box>
      </RadioGroup>
    </Field>
  )
}

function SwitchEntry({ state }: { readonly state: string }) {
  return (
    <Switch
      label="Public profile"
      hint="Anyone with the link can see the sample profile."
      defaultChecked={state === 'on'}
      isDisabled={state === 'disabled'}
    />
  )
}

function FieldContextReader() {
  const value = useContext(FieldContext)

  return (
    <ReadOut>
      {value === undefined
        ? 'No Field above this reader.'
        : `control id: ${value.control.id}\nstate: ${value.state}\naria-describedby: ${
            value.control['aria-describedby'] ?? '(none)'
          }`}
    </ReadOut>
  )
}

function FieldContextEntry() {
  return (
    <Field label="Email address" id="gallery-field-context" hint={HINT} error={ERROR}>
      <Box display="flex" flexDirection="column" gap={space[2]}>
        <Input defaultValue="sample.author" />
        <FieldContextReader />
      </Box>
    </Field>
  )
}

function FieldAriaReader() {
  const aria = useFieldAria()

  return <ReadOut>{JSON.stringify(aria ?? null, null, 2)}</ReadOut>
}

function UseFieldAriaEntry({ state }: { readonly state: string }) {
  if (state === 'outside a Field') {
    return <FieldAriaReader />
  }

  return (
    <Field label="Email address" id="gallery-use-field-aria" hint={HINT} isRequired>
      <Box display="flex" flexDirection="column" gap={space[2]}>
        <Input placeholder="sample.author@example.com" />
        <FieldAriaReader />
      </Box>
    </Field>
  )
}

export const formEntries = {
  Field: FieldEntry,
  Input: InputEntry,
  Textarea: TextareaEntry,
  Select: SelectEntry,
  Checkbox: CheckboxEntry,
  Radio: RadioEntry,
  Switch: SwitchEntry,
  FieldContext: FieldContextEntry,
  useFieldAria: UseFieldAriaEntry,
} satisfies Record<string, EntryRenderer>
