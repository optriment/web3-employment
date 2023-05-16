import type { Company } from '@prisma/client'

export class GroupDTO {
  id: string
  display_name: string
  comment: string | null
  created_at: string
  updated_at: string | null
  archived_at: string | null

  constructor(
    id: string,
    display_name: string,
    comment: string | null,
    createdAt: Date,
    updatedAt: Date | null,
    archivedAt: Date | null
  ) {
    this.id = id
    this.display_name = display_name
    this.comment = comment
    this.created_at = createdAt.toISOString()
    this.updated_at = updatedAt ? updatedAt.toISOString() : null
    this.archived_at = archivedAt ? archivedAt.toISOString() : null
  }

  static fromModel(model: Company): GroupDTO {
    return new GroupDTO(
      model.id,
      model.display_name,
      model.comment,
      model.created_at,
      model.updated_at,
      model.archived_at
    )
  }
}
