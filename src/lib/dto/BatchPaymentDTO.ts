import type { BatchPayment } from '@prisma/client'

export class BatchPaymentDTO {
  id: string
  transaction_hash: string
  recipients_count: number
  total_amount: number
  group_id: string
  created_at: string

  constructor(
    id: string,
    transactionHash: string,
    recipientsCount: number,
    totalAmount: number,
    groupId: string,
    createdAt: Date
  ) {
    this.id = id
    this.transaction_hash = transactionHash
    this.recipients_count = recipientsCount
    this.total_amount = totalAmount
    this.group_id = groupId
    this.created_at = createdAt.toISOString()
  }

  static fromModel(model: BatchPayment): BatchPaymentDTO {
    return new BatchPaymentDTO(
      model.id,
      model.transactionHash,
      model.recipientsCount,
      model.totalAmount,
      model.groupId,
      model.createdAt
    )
  }
}
