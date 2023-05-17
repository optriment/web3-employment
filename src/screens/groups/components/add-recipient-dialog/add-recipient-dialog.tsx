import React, { useState } from 'react'
import { Modal, Message } from 'semantic-ui-react'
import api, { APIError } from '@/lib/api'
import { RecipientForm } from '../recipient-form'
import type { ValidationSchema } from '../recipient-form'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  groupId: string
  onRecipientCreated: () => void
}

const Component = ({ groupId, open, setOpen, onRecipientCreated }: Props) => {
  const [createError, setCreateError] = useState<string>('')
  const [createValidationErrors, setCreateValidationErrors] = useState<
    string[]
  >([])

  const handleCreateRecipient = async (data: ValidationSchema) => {
    try {
      setCreateError('')
      setCreateValidationErrors([])

      await api.addRecipientToGroup(groupId, JSON.stringify(data))

      onRecipientCreated()
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
      <Modal.Header>Add New Recipient</Modal.Header>
      <Modal.Content>
        {createError && (
          <Message error size="big">
            <Message.Header content="Unable to create recipient" />
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

        <RecipientForm onFormSubmitted={handleCreateRecipient} />
      </Modal.Content>
    </Modal>
  )
}

export default Component
