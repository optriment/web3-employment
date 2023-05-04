import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Grid, Message, Modal, Button, Header } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import type {
  CompanyCreateApiResponse,
  CompanyGetApiResponse,
} from '@/pages/api/companies'
import type { CompanyUpdateApiResponse } from '@/pages/api/companies/[id]'
import { useIsMobile } from '@/utils/use-is-mobile'
import { CompaniesList } from './components/companies-list'
import { CompanyForm } from './components/company-form'

import type { ValidationSchema } from './components/company-form'
import type { Company } from '@prisma/client'

const Screen: React.FC = () => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [newOpen, setNewOpen] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string>('')
  const [createValidationErrors, setCreateValidationErrors] = useState<
    string[]
  >([])

  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [updateError, setUpdateError] = useState<string>('')
  const [updateValidationErrors, setUpdateValidationErrors] = useState<
    string[]
  >([])

  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<Company[] | null>(null)
  const [error, setError] = useState<string>('')

  const handleCreateCompany = async (data: ValidationSchema) => {
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

  const handleUpdateCompany = async (data: ValidationSchema) => {
    if (!companyToEdit) return

    try {
      setUpdateError('')
      setUpdateValidationErrors([])

      const payload = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }

      const res = await fetch(`/api/companies/${companyToEdit.id}`, payload)
      const response: CompanyUpdateApiResponse = await res.json()

      if (!res.ok) {
        const { validation_errors, message } = response

        if (message) setUpdateError(message)
        if (validation_errors) setUpdateValidationErrors(validation_errors)

        return
      }

      if (!response.data) {
        throw new Error('There is no response.data in API response')
      }

      setCompanyToEdit(null)
      setEditOpen(false)

      router.reload()
    } catch (e) {
      setUpdateError(`${e}`)
    }
  }

  const onEditClicked = (company: Company) => {
    setCompanyToEdit(company)
    setEditOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const res = await fetch('/api/companies/')
        const d: CompanyGetApiResponse = await res.json()

        if (d.success) {
          setData(d.data as Company[])
          setIsLoading(false)
          return
        }

        setError(d.message || 'Unknown response from API')
      } catch (e) {
        setError(`${e}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <Grid container={!isMobile} columns={1}>
        {isLoading && (
          <Grid.Column>
            <LoadingMessage content="Loading companies" />
          </Grid.Column>
        )}

        {error && (
          <Grid.Column>
            <ErrorMessage header="Unable to load companies" content={error} />
          </Grid.Column>
        )}
        <Grid.Row columns={2}>
          <Grid.Column width={12}>
            <Header as="h1" content="Companies" />
          </Grid.Column>

          <Grid.Column width={4} textAlign="right">
            <Button
              size="large"
              icon="plus"
              content="Add Company"
              primary
              onClick={() => setNewOpen(true)}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            {data !== null && data.length > 0 ? (
              <CompaniesList
                companies={data}
                onEditClicked={(company: Company) => onEditClicked(company)}
              />
            ) : (
              <Message warning>
                <p>No companies present yet.</p>
              </Message>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Modal
        closeIcon
        onClose={() => setNewOpen(false)}
        onOpen={() => setNewOpen(true)}
        open={newOpen}
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

      {companyToEdit && (
        <Modal
          closeIcon
          onClose={() => setEditOpen(false)}
          onOpen={() => setEditOpen(true)}
          open={editOpen}
        >
          <Modal.Header>Edit Company {companyToEdit.display_name}</Modal.Header>
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

            <CompanyForm
              onFormSubmitted={handleUpdateCompany}
              company={companyToEdit}
            />
          </Modal.Content>
        </Modal>
      )}
    </>
  )
}

export default Screen
