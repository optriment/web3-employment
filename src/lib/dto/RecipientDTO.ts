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
    display_name: string,
    comment: string | null,
    contacts: string | null,
    wallet_address: string | null,
    salary: number | null,
    createdAt: Date,
    updatedAt: Date | null,
    archivedAt: Date | null
  ) {
    this.id = id
    this.display_name = display_name
    this.comment = comment
    this.contacts = contacts
    this.wallet_address = wallet_address
    this.salary = salary
    this.created_at = createdAt.toISOString()
    this.updated_at = updatedAt ? updatedAt.toISOString() : null
    this.archived_at = archivedAt ? archivedAt.toISOString() : null
  }

  static fromModel(model: Recipient): RecipientDTO {
    return new RecipientDTO(
      model.id,
      model.display_name,
      model.comment,
      model.contacts,
      model.wallet_address,
      model.salary,
      model.created_at,
      model.updated_at,
      model.archived_at
    )
  }
}
