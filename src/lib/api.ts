import type { ZodError } from 'zod'

export const buildValidationErrors = (
  error: ZodError,
  fieldNames: { [key: string]: string }
): string[] => {
  const errors: string[] = []

  const fieldErrors = error.flatten().fieldErrors

  Object.keys(fieldErrors).forEach((key) => {
    const fieldName = fieldNames[key] || key
    const fieldError = fieldErrors[key]

    if (!fieldError) {
      throw new Error(`${key} is not found in fieldError`)
    }

    if (fieldError.length !== 1) {
      throw new Error(
        `Error for key ${key} has unexpected number of errors: ${fieldError.length}`
      )
    }

    const errorMessage = `${fieldName}: ${fieldError[0]}`
    errors.push(errorMessage)
  })

  return errors
}
