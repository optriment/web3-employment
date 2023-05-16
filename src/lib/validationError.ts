export class ValidationError extends Error {
  validationErrors: string[]

  constructor(validationErrors: string[]) {
    super()
    this.name = 'ValidationError'
    this.validationErrors = validationErrors
  }
}
