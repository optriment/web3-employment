import React, { useState } from 'react'
import { Modal, Message } from 'semantic-ui-react'
import api, { APIError } from '@/lib/api'
import { EmployeeForm } from '../employee-form'
import type { ValidationSchema as EmployeeValidationSchema } from '../employee-form'
import type { Employee } from '@prisma/client'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  companyId: string
  employee: Employee
  onEmployeeUpdated: () => void
}

const Component = ({
  companyId,
  employee,
  open,
  setOpen,
  onEmployeeUpdated,
}: Props) => {
  const [updateError, setUpdateError] = useState<string>('')
  const [updateValidationErrors, setUpdateValidationErrors] = useState<
    string[]
  >([])

  const handleUpdateEmployee = async (data: EmployeeValidationSchema) => {
    if (!employee) return

    try {
      setUpdateError('')
      setUpdateValidationErrors([])

      await api.updateEmployee(companyId, employee.id, JSON.stringify(data))

      onEmployeeUpdated()
    } catch (e) {
      if (e instanceof APIError) {
        setUpdateError(e.message)
        setUpdateValidationErrors(e.validationErrors)
      } else {
        setUpdateError(`${e}`)
      }
    }
  }

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      <Modal.Header>Edit Employee {employee.display_name}</Modal.Header>
      <Modal.Content>
        {updateError && (
          <Message error size="big">
            <Message.Header content="Unable to update employee" />
            <p>{updateError}</p>
          </Message>
        )}

        {updateValidationErrors.length > 0 && (
          <Message
            error
            size="big"
            header="Validation errors"
            list={updateValidationErrors}
          />
        )}

        <EmployeeForm
          onFormSubmitted={handleUpdateEmployee}
          employee={employee}
        />
      </Modal.Content>
    </Modal>
  )
}

export default Component
