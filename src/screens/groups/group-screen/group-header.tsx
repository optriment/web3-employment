import React from 'react'
import { Header } from 'semantic-ui-react'
import type { GroupDTO } from '@/lib/dto/GroupDTO'

type Props = {
  group: GroupDTO
}

export const GroupHeader = ({ group }: Props) => (
  <>
    <Header as="h1">{group.display_name}</Header>

    {group.comment && <Header as="h3">{group.comment}</Header>}

    {group.archived_at && (
      <Header as="h3">
        Archived: {new Date(group.archived_at).toLocaleString()}
      </Header>
    )}
  </>
)
