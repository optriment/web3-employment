import React from 'react'
import { Table, Button } from 'semantic-ui-react'
import type { Employee } from '@prisma/client'

interface Props {
  isCompanyArchived: boolean
  employees: Employee[]
}

const Component = ({ isCompanyArchived, employees }: Props) => (
  <Table size="large">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Display Name</Table.HeaderCell>
        <Table.HeaderCell>Wallet</Table.HeaderCell>
        <Table.HeaderCell>Comment</Table.HeaderCell>
        <Table.HeaderCell />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {employees.map((employee) => (
        <Table.Row key={employee.id}>
          <Table.Cell>{employee.display_name}</Table.Cell>
          <Table.Cell>{employee.wallet_address}</Table.Cell>
          <Table.Cell>{employee.comment}</Table.Cell>
          <Table.Cell textAlign="right">
            <Button
              positive
              icon="dollar"
              content="Pay"
              disabled={!!isCompanyArchived || !employee.wallet_address}
            />
            <Button icon="pencil" />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
)

export default Component
