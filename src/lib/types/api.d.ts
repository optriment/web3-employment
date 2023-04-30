export type ApiResponse<T> = {
  success: boolean
  message?: string
  validation_errors?: string[]
  data?: T
}
