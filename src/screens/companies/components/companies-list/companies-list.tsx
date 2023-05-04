import React from 'react'
import { Table } from 'semantic-ui-react'
import type { Company } from '@prisma/client'

interface Props {
  companies: Company[]
}

const Component = ({ companies }: Props) => (
  <Table size="large">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Display Name</Table.HeaderCell>
        <Table.HeaderCell>Comment</Table.HeaderCell>
        <Table.HeaderCell>Created At</Table.HeaderCell>
        <Table.HeaderCell>Update At</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
        <Table.HeaderCell />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {companies.map((company) => (
        <Table.Row key={company.id}>
          <Table.Cell>{company.display_name}</Table.Cell>
          <Table.Cell>{company.comment}</Table.Cell>
          <Table.Cell>
            {new Date(company.created_at).toLocaleDateString()}{' '}
            {new Date(company.created_at).toLocaleTimeString()}
          </Table.Cell>
          <Table.Cell>
            {new Date(company.updated_at).toLocaleDateString()}{' '}
            {new Date(company.updated_at).toLocaleTimeString()}
          </Table.Cell>
          <Table.Cell>{company.archived_at ? 'Archived' : 'Active'}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
)

export default Component
