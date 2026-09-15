import type { CopyEvent } from '../../design-system'

export const CONTACT_EMAIL = 'canhtran210699@gmail.com'
export const CONTACT_PHONE = '+84 96 345 2909'
export const CONTACT_PHONE_HREF = 'tel:+84963452909'
export const CONTACT_LOCATION = 'Ho Chi Minh City, Vietnam'

export type ClipboardWriter = (value: string) => Promise<void>

interface ClipboardPort {
  writeText(value: string): Promise<void>
}

export const writeWithClipboard = (
  clipboard: ClipboardPort | undefined,
  value: string,
): Promise<void> => {
  if (!clipboard) {
    return Promise.reject(new Error('This browser has no clipboard API.'))
  }

  return clipboard.writeText(value)
}

export const writeToBrowserClipboard: ClipboardWriter = (value) =>
  writeWithClipboard(typeof navigator === 'undefined' ? undefined : navigator.clipboard, value)

export const copyContactEmail = async (write: ClipboardWriter): Promise<CopyEvent> => {
  try {
    await write(CONTACT_EMAIL)
    return { type: 'succeeded' }
  } catch {
    return { type: 'failed' }
  }
}
