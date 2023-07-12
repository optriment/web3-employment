import type { BatchPayment } from '@prisma/client'

export class BatchPaymentDTO {
  id: string
  transaction_hash: string
  user_id: string
  created_at: string

  constructor(
    id: string,
    transactionHash: string,
    userId: string,
    createdAt: Date
  ) {
    this.id = id
    this.transaction_hash = transactionHash
    this.user_id = userId
    this.created_at = createdAt.toISOString()
  }

  static fromModel(model: BatchPayment): BatchPaymentDTO {
    return new BatchPaymentDTO(
      model.id,
      model.transactionHash,
      model.userId,
      model.createdAt
    )
  }
}
