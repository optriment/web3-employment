import router from 'next/router'
import React, { useState, useContext, useEffect } from 'react'
import { Header, Table, Button } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'
import type { EmployeeArchiveApiResponse } from '@/pages/api/companies/[id]/employees/[employee_id]'
import type { EmployeeUnarchiveApiResponse } from '@/pages/api/companies/[id]/employees/[employee_id]/unarchive'
import type { Employee } from '@prisma/client'

interface Props {
  isCompanyArchived: boolean
  employee: Employee
  onPaymentClicked: (_employee: Employee) => void
  onEditClicked: (_employee: Employee) => void
  setArchiveError: (_error: string) => void
  setUnarchiveError: (_error: string) => void
}

const EmployeeInfo = ({
  isCompanyArchived,
  employee,
  onPaymentClicked,
  onEditClicked,
  setArchiveError,
  setUnarchiveError,
}: Props) => {
  const { connected } = useContext(Web3Context)

  const [isEmployeeArchived, setIsEmployeeArchived] = useState<boolean>(false)

  const companyId = router.query.id as string

  const handleArchive = async () => {
    try {
      setArchiveError('')

      const res = await fetch(
        `/api/companies/${companyId}/employees/${employee.id}`,
        {
          method: 'DELETE',
        }
      )
      const response: EmployeeArchiveApiResponse = await res.json()

      if (!res.ok) {
        const { message } = response

        if (message) setArchiveError(message)

        return
      }

      setIsEmployeeArchived(true)
    } catch (e) {
      setArchiveError(`${e}`)
    }
  }

  const handleUnarchive = async () => {
    try {
      setUnarchiveError('')

      const res = await fetch(
        `/api/companies/${companyId}/employees/${employee.id}/unarchive`,
        {
          method: 'POST',
        }
      )
      const response: EmployeeUnarchiveApiResponse = await res.json()

      if (!res.ok) {
        const { message } = response

        if (message) setUnarchiveError(message)

        return
      }

      setIsEmployeeArchived(false)
    } catch (error) {
      setUnarchiveError(`${error}`)
    }
  }

  useEffect(() => {
    if (employee.archived_at) {
      setIsEmployeeArchived(true)
    } else {
      setIsEmployeeArchived(false)
    }
  }, [employee.archived_at])

  return (
    <>
      <Table.Row>
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
          {isEmployeeArchived ? 'Archived' : 'Active'}
        </Table.Cell>
        <Table.Cell collapsing textAlign="right">
          <Button
            positive
            icon="dollar"
            content="Pay"
            disabled={
              !connected ||
              !!isCompanyArchived ||
              !employee.wallet_address ||
              isEmployeeArchived
            }
            onClick={() => onPaymentClicked(employee)}
          />
          <Button
            icon="pencil"
            disabled={!!isCompanyArchived}
            onClick={() => onEditClicked(employee)}
          />
          <Button
            icon={isEmployeeArchived ? 'undo' : 'archive'}
            disabled={!!isCompanyArchived}
            onClick={isEmployeeArchived ? handleUnarchive : handleArchive}
          />
        </Table.Cell>
      </Table.Row>
    </>
  )
}

export default EmployeeInfo
