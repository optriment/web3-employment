import type { Recipient } from '@prisma/client'

export class RecipientDTO {
  id: string
  display_name: string
  comment: string | null
  contacts: string | null
  wallet_address: string | null
  salary: number | null
  created_at: string
  updated_at: string | null
  archived_at: string | null

  constructor(
    id: string,
    displayName: string,
    comment: string | null,
    contacts: string | null,
    walletAddress: string | null,
    salary: number | null,
    createdAt: Date,
    updatedAt: Date | null,
    archivedAt: Date | null
  ) {
    this.id = id
    this.display_name = displayName
    this.comment = comment
    this.contacts = contacts
    this.wallet_address = walletAddress
    this.salary = salary
    this.created_at = createdAt.toISOString()
    this.updated_at = updatedAt ? updatedAt.toISOString() : null
    this.archived_at = archivedAt ? archivedAt.toISOString() : null
  }

  static fromModel(model: Recipient): RecipientDTO {
    return new RecipientDTO(
      model.id,
      model.displayName,
      model.comment,
      model.contacts,
      model.walletAddress,
      typeof model.salary === 'bigint'
        ? +model.salary.toString()
        : model.salary,
      model.createdAt,
      model.updatedAt,
      model.archivedAt
    )
  }
}
