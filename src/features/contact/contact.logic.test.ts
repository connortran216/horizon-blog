import { describe, expect, it, vi } from 'vitest'

import { CONTACT_EMAIL, copyContactEmail, writeWithClipboard } from './contact.logic'

describe('contact clipboard behavior', () => {
  it('writes the exact approved address and reports success', async () => {
    const write = vi.fn().mockResolvedValue(undefined)

    await expect(copyContactEmail(write)).resolves.toEqual({ type: 'succeeded' })
    expect(write).toHaveBeenCalledOnce()
    expect(write).toHaveBeenCalledWith(CONTACT_EMAIL)
  })

  it('reports failure when clipboard writing rejects', async () => {
    const write = vi.fn().mockRejectedValue(new Error('denied'))

    await expect(copyContactEmail(write)).resolves.toEqual({ type: 'failed' })
  })

  it('rejects cleanly when the browser exposes no clipboard API', async () => {
    await expect(writeWithClipboard(undefined, CONTACT_EMAIL)).rejects.toThrow(
      'This browser has no clipboard API.',
    )
  })
})
