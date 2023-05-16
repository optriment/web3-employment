import React, { useState } from 'react'
import { Modal, Message } from 'semantic-ui-react'
import api, { APIError } from '@/lib/api'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { RecipientForm } from '../recipient-form'
import type { ValidationSchema } from '../recipient-form'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  groupId: string
  recipient: RecipientDTO
  onRecipientUpdated: () => void
}

const Component = ({
  groupId,
  recipient,
  open,
  setOpen,
  onRecipientUpdated,
}: Props) => {
  const [updateError, setUpdateError] = useState<string>('')
  const [updateValidationErrors, setUpdateValidationErrors] = useState<
    string[]
  >([])

  const handleUpdateRecipient = async (data: ValidationSchema) => {
    if (!recipient) return

    try {
      setUpdateError('')
      setUpdateValidationErrors([])

      await api.updateRecipient(groupId, recipient.id, JSON.stringify(data))

      onRecipientUpdated()
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
      <Modal.Header>Edit Recipient {recipient.display_name}</Modal.Header>
      <Modal.Content>
        {updateError && (
          <Message error size="big">
            <Message.Header content="Unable to update recipient" />
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

        <RecipientForm
          onFormSubmitted={handleUpdateRecipient}
          recipient={recipient}
        />
      </Modal.Content>
    </Modal>
  )
}

export default Component
