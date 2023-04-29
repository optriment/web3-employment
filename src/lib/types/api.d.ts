export type ApiResponse<T> = {
  success: boolean
  status?: string
  message?: string
  data?: T
}
