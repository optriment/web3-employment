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
    transaction_hash: string,
    amount: number,
    wallet_address: string,
    recipient_id: string,
    createdAt: Date
  ) {
    this.id = id
    this.transaction_hash = transaction_hash
    this.amount = amount
    this.wallet_address = wallet_address
    this.recipient_id = recipient_id
    this.created_at = createdAt.toISOString()
  }

  static fromModel(model: Payment): PaymentDTO {
    return new PaymentDTO(
      model.id,
      model.transaction_hash,
      model.amount,
      model.wallet_address,
      model.recipient_id,
      model.created_at
    )
  }
}
