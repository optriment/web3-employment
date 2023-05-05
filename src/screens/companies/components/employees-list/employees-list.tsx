import React, { useContext } from 'react'
import { Header, Table, Button } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'
import type { Employee } from '@prisma/client'

interface Props {
  isCompanyArchived: boolean
  employees: Employee[]
  onPaymentClicked: (_employee: Employee) => void
  onEditClicked: (_employee: Employee) => void
}

const Component = ({
  isCompanyArchived,
  employees,
  onPaymentClicked,
  onEditClicked,
}: Props) => {
  const { connected } = useContext(Web3Context)

  return (
    <Table size="large">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Display Name</Table.HeaderCell>
          <Table.HeaderCell>Wallet</Table.HeaderCell>
          <Table.HeaderCell>Salary</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {employees.map((employee) => (
          <Table.Row key={employee.id}>
            <Table.Cell>
              <Header as="h3">
                <Header.Content>
                  {employee.display_name}
                  <Header.Subheader>{employee.comment}</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell collapsing>{employee.wallet_address}</Table.Cell>
            <Table.Cell collapsing>{employee.salary}</Table.Cell>
            <Table.Cell collapsing>
              {employee.archived_at ? 'Archived' : 'Active'}
            </Table.Cell>
            <Table.Cell collapsing textAlign="right">
              <Button
                positive
                icon="dollar"
                content="Pay"
                disabled={
                  !connected || !!isCompanyArchived || !employee.wallet_address
                }
                onClick={() => onPaymentClicked(employee)}
              />
              <Button
                icon="pencil"
                disabled={!!isCompanyArchived}
                onClick={() => onEditClicked(employee)}
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default Component
