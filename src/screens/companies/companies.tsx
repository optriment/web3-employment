import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Grid, Message, Modal, Button, Header } from 'semantic-ui-react'
import type { CompanyCreateApiResponse } from '@/pages/api/companies'
import { useIsMobile } from '@/utils/use-is-mobile'
import { CompanyForm } from './components/company-form'
import type { ValidationSchema } from './components/company-form'

const Screen: React.FC = () => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [open, setOpen] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string>('')
  const [createValidationErrors, setCreateValidationErrors] = useState<
    string[]
  >([])

  const onFormSubmitted = async (data: ValidationSchema) => {
    try {
      setCreateError('')
      setCreateValidationErrors([])

      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }

      const res = await fetch('/api/companies', payload)
      const response: CompanyCreateApiResponse = await res.json()

      if (!res.ok) {
        const { validation_errors, message } = response

        if (message) setCreateError(message)
        if (validation_errors) setCreateValidationErrors(validation_errors)

        return
      }

      if (!response.data) {
        throw new Error('There is no response.data in API response')
      }

      router.push(`/companies/${response.data.id}`)
    } catch (e) {
      setCreateError(`${e}`)
    }
  }

  return (
    <>
      <Grid container={!isMobile} columns={1}>
        <Grid.Row columns={2}>
          <Grid.Column width={12}>
            <Header as="h1" content="Companies" />
          </Grid.Column>

          <Grid.Column width={4} textAlign="right">
            <Button
              size="large"
              content="Add New"
              primary
              onClick={() => setOpen(true)}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>

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

          <CompanyForm onFormSubmitted={onFormSubmitted} />
        </Modal.Content>
      </Modal>
    </>
  )
}

export default Screen