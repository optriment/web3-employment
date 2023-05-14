import React, { useState } from 'react'
import { Modal, Message } from 'semantic-ui-react'
import api, { APIError } from '@/lib/api'
import { EmployeeForm } from '../employee-form'
import type { ValidationSchema as EmployeeValidationSchema } from '../employee-form'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  companyId: string
  onEmployeeCreated: () => void
}

const Component = ({ companyId, open, setOpen, onEmployeeCreated }: Props) => {
  const [createError, setCreateError] = useState<string>('')
  const [createValidationErrors, setCreateValidationErrors] = useState<
    string[]
  >([])

  const handleCreateEmployee = async (data: EmployeeValidationSchema) => {
    try {
      setCreateError('')
      setCreateValidationErrors([])

      await api.addEmployeeToCompany(companyId, JSON.stringify(data))

      onEmployeeCreated()
    } catch (e) {
      if (e instanceof APIError) {
        setCreateError(e.message)
        setCreateValidationErrors(e.validationErrors)
      } else {
        setCreateError(`${e}`)
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
      <Modal.Header>Add New Employee</Modal.Header>
      <Modal.Content>
        {createError && (
          <Message error size="big">
            <Message.Header content="Unable to create employee" />
            <p>{createError}</p>
          </Message>
        )}

        {createValidationErrors.length > 0 && (
          <Message
            error
            size="big"
            header="Validation errors"
            list={createValidationErrors}
          />
        )}

        <EmployeeForm onFormSubmitted={handleCreateEmployee} />
      </Modal.Content>
    </Modal>
  )
}

export default Component
