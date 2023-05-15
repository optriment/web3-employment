import React, { useState } from 'react'
import { Modal, Message } from 'semantic-ui-react'
import api, { APIError } from '@/lib/api'
import { CompanyForm } from '../company-form'
import type { ValidationSchema } from '../company-form'
import type { Company } from '@prisma/client'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  company: Company
  onCompanyUpdated: () => void
}

const Component = ({ company, open, setOpen, onCompanyUpdated }: Props) => {
  const [updateError, setUpdateError] = useState<string>('')
  const [updateValidationErrors, setUpdateValidationErrors] = useState<
    string[]
  >([])

  const handleUpdateCompany = async (data: ValidationSchema) => {
    if (!company) return

    try {
      setUpdateError('')
      setUpdateValidationErrors([])

      await api.updateCompany(company.id, JSON.stringify(data))

      onCompanyUpdated()
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
      <Modal.Header>Edit Company {company.display_name}</Modal.Header>
      <Modal.Content>
        {updateError && (
          <Message error size="big">
            <Message.Header content="Unable to update company" />
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

        <CompanyForm onFormSubmitted={handleUpdateCompany} company={company} />
      </Modal.Content>
    </Modal>
  )
}

export default Component
