export const MINIMUM_PASSWORD_LENGTH = 12
export const MAXIMUM_PASSWORD_LENGTH = 128

export const getPasswordPolicyError = (password: string): string | null => {
  const length = Array.from(password).length
  if (length < MINIMUM_PASSWORD_LENGTH || length > MAXIMUM_PASSWORD_LENGTH) {
    return `Password must be between ${MINIMUM_PASSWORD_LENGTH} and ${MAXIMUM_PASSWORD_LENGTH} characters`
  }
  return null
}
