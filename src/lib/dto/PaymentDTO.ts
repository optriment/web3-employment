import type { Payment } from '@prisma/client'

export class PaymentDTO {
  id: string
  transaction_hash: string
  amount: number
  wallet_address: string
  recipient_id: string
  created_at: string

  constructor(
    id: string,
    transactionHash: string,
    amount: number,
    walletAddress: string,
    recipientId: string,
    createdAt: Date
  ) {
    this.id = id
    this.transaction_hash = transactionHash
    this.amount = amount
    this.wallet_address = walletAddress
    this.recipient_id = recipientId
    this.created_at = createdAt.toISOString()
  }

  static fromModel(model: Payment): PaymentDTO {
    return new PaymentDTO(
      model.id,
      model.transactionHash,
      +model.amount.toString(),
      model.walletAddress,
      model.recipientId,
      model.createdAt
    )
  }
}
