import React, { useContext } from 'react'
import { Table, Button } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'
import type { Employee } from '@prisma/client'

interface Props {
  isCompanyArchived: boolean
  employees: Employee[]
  onPaymentClicked: (_employee: Employee) => void
}

const Component = ({
  isCompanyArchived,
  employees,
  onPaymentClicked,
}: Props) => {
  const { connected } = useContext(Web3Context)

  return (
    <Table size="large">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Display Name</Table.HeaderCell>
          <Table.HeaderCell>Wallet</Table.HeaderCell>
          <Table.HeaderCell>Comment</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {employees.map((employee) => (
          <Table.Row key={employee.id}>
            <Table.Cell>{employee.display_name}</Table.Cell>
            <Table.Cell>{employee.wallet_address}</Table.Cell>
            <Table.Cell>{employee.comment}</Table.Cell>
            <Table.Cell>
              {employee.archived_at ? 'Archived' : 'Active'}
            </Table.Cell>
            <Table.Cell textAlign="right">
              <Button
                positive
                icon="dollar"
                content="Pay"
                disabled={
                  !connected || !!isCompanyArchived || !employee.wallet_address
                }
                onClick={() => onPaymentClicked(employee)}
              />
              <Button icon="pencil" disabled={!!isCompanyArchived} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default Component