import React, { useState } from 'react'
import { Modal, Message } from 'semantic-ui-react'
import api, { APIError } from '@/lib/api'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import { GroupForm } from '../group-form'
import type { ValidationSchema } from '../group-form'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  group: GroupDTO
  onGroupUpdated: () => void
}

const Component = ({ group, open, setOpen, onGroupUpdated }: Props) => {
  const [updateError, setUpdateError] = useState<string>('')
  const [updateValidationErrors, setUpdateValidationErrors] = useState<
    string[]
  >([])

  const handleUpdateGroup = async (data: ValidationSchema) => {
    if (!group) return

    try {
      setUpdateError('')
      setUpdateValidationErrors([])

      await api.updateGroup(group.id, JSON.stringify(data))

      onGroupUpdated()
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
      <Modal.Header>Edit Group {group.display_name}</Modal.Header>
      <Modal.Content>
        {updateError && (
          <Message error size="big">
            <Message.Header content="Unable to update group" />
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

        <GroupForm onFormSubmitted={handleUpdateGroup} group={group} />
      </Modal.Content>
    </Modal>
  )
}

export default Component
