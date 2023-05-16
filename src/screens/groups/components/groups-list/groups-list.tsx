import React from 'react'
import { Button, Table } from 'semantic-ui-react'
import type { GroupDTO } from '@/lib/dto/GroupDTO'

interface Props {
  groups: GroupDTO[]
  onEditClicked: (_group: GroupDTO) => void
}

const Component = ({ groups, onEditClicked }: Props) => (
  <Table size="large">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Display Name</Table.HeaderCell>
        <Table.HeaderCell>Comment</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
        <Table.HeaderCell />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {groups.map((group) => (
        <Table.Row key={group.id} warning={!!group.archived_at}>
          <Table.Cell>{group.display_name}</Table.Cell>
          <Table.Cell>{group.comment}</Table.Cell>
          <Table.Cell collapsing>
            {group.archived_at ? 'Archived' : 'Active'}
          </Table.Cell>
          <Table.Cell collapsing textAlign="right">
            <Button
              as="a"
              href={`/groups/${group.id}`}
              icon="users"
              title="Recipients"
            />
            <Button
              as="a"
              href={`/groups/${group.id}/payments`}
              icon="dollar"
              title="Payments"
            />
            <Button icon="pencil" onClick={() => onEditClicked(group)} />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
)

export default Component
