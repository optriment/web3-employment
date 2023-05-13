import React, { useState } from 'react'
import { Grid, Table } from 'semantic-ui-react'
import { ErrorMessage } from '@/components'
import EmployeeInfo from './employee-info'
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
  const [archiveError, setArchiveError] = useState<string>('')
  const [unarchiveError, setUnarchiveError] = useState<string>('')

  return (
    <>
      {archiveError && (
        <Grid.Column>
          <ErrorMessage
            header="Unable to archive employee"
            content={archiveError}
          />
        </Grid.Column>
      )}

      {unarchiveError && (
        <Grid.Column>
          <ErrorMessage
            header="Unable to unarchive employee"
            content={unarchiveError}
          />
        </Grid.Column>
      )}

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
            <EmployeeInfo
              key={employee.id}
              employee={employee}
              isCompanyArchived={isCompanyArchived}
              onPaymentClicked={onPaymentClicked}
              onEditClicked={onEditClicked}
              setArchiveError={setArchiveError}
              setUnarchiveError={setUnarchiveError}
            />
          ))}
        </Table.Body>
      </Table>
    </>
  )
}
export default Component
