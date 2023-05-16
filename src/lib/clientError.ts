export class ClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ClientError'
    this.status = status
  }
}
