import React, { useState } from 'react'
import { Modal, Message } from 'semantic-ui-react'
import api, { APIError } from '@/lib/api'
import { CompanyForm } from '../company-form'
import type { ValidationSchema } from '../company-form'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onCompanyCreated: (_companyId: string) => void
}

const Component = ({ open, setOpen, onCompanyCreated }: Props) => {
  const [createError, setCreateError] = useState<string>('')
  const [createValidationErrors, setCreateValidationErrors] = useState<
    string[]
  >([])

  const handleCreateCompany = async (data: ValidationSchema) => {
    try {
      setCreateError('')
      setCreateValidationErrors([])

      const company = await api.addCompany(JSON.stringify(data))

      if (!company.data) {
        throw new Error('There is no data in API response')
      }

      onCompanyCreated(company.data.id)
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
      <Modal.Header>Add New Company</Modal.Header>
      <Modal.Content>
        {createError && (
          <Message error size="big">
            <Message.Header content="Unable to create company" />
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

        <CompanyForm onFormSubmitted={handleCreateCompany} />
      </Modal.Content>
    </Modal>
  )
}

export default Component
