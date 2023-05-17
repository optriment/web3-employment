import React, { useState } from 'react'
import { Modal, Message } from 'semantic-ui-react'
import api, { APIError } from '@/lib/api'
import { GroupForm } from '../group-form'
import type { ValidationSchema } from '../group-form'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onGroupCreated: (_groupId: string) => void
}

const Component = ({ open, setOpen, onGroupCreated }: Props) => {
  const [createError, setCreateError] = useState<string>('')
  const [createValidationErrors, setCreateValidationErrors] = useState<
    string[]
  >([])

  const handleCreateGroup = async (data: ValidationSchema) => {
    try {
      setCreateError('')
      setCreateValidationErrors([])

      const group = await api.addGroup(JSON.stringify(data))

      if (!group.data) {
        throw new Error('There is no data in API response')
      }

      onGroupCreated(group.data.id)
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
      <Modal.Header>Add New Group</Modal.Header>
      <Modal.Content>
        {createError && (
          <Message error size="big">
            <Message.Header content="Unable to create group" />
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

        <GroupForm onFormSubmitted={handleCreateGroup} />
      </Modal.Content>
    </Modal>
  )
}

export default Component
