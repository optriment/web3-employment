import type { User } from '@prisma/client'

export class UserDTO {
  id: string
  name: string | null
  email: string | null
  created_at: string
  updated_at: string | null

  constructor(
    id: string,
    name: string | null,
    email: string | null,
    createdAt: Date,
    updatedAt: Date | null
  ) {
    this.id = id
    this.name = name
    this.email = email
    this.created_at = createdAt.toISOString()
    this.updated_at = updatedAt ? updatedAt.toISOString() : null
  }

  static fromModel(model: User): UserDTO {
    return new UserDTO(
      model.id,
      model.name,
      model.email,
      model.createdAt,
      model.updatedAt
    )
  }
}
