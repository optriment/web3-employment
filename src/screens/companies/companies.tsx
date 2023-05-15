import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Grid, Message, Button, Header } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import api, { APIError } from '@/lib/api'
import { useIsMobile } from '@/utils/use-is-mobile'
import { AddCompanyDialog } from './components/add-company-dialog'
import { CompaniesList } from './components/companies-list'
import { EditCompanyDialog } from './components/edit-company-dialog'
import type { Company } from '@prisma/client'

const Screen: React.FC = () => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [newCompanyDialogOpen, setNewCompanyDialogOpen] =
    useState<boolean>(false)

  const [editCompanyDialogOpen, setEditCompanyDialogOpen] =
    useState<boolean>(false)

  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<Company[]>([])
  const [error, setError] = useState<string>('')

  const onCompanyCreated = (companyId: string) => {
    router.push(`/companies/${companyId}`)
  }

  const onCompanyUpdated = () => {
    router.reload()
  }

  const onEditClicked = (company: Company) => {
    setCompanyToEdit(company)
    setEditCompanyDialogOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const company = await api.getCompanies()

        setData(company.data as Company[])
      } catch (e) {
        if (e instanceof APIError) {
          setError(e.message)
        } else {
          setError(`${e}`)
        }
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
              onClick={() => setNewCompanyDialogOpen(true)}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>
            {data.length > 0 ? (
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

      <AddCompanyDialog
        open={newCompanyDialogOpen}
        setOpen={setNewCompanyDialogOpen}
        onCompanyCreated={onCompanyCreated}
      />

      {companyToEdit && (
        <EditCompanyDialog
          open={editCompanyDialogOpen}
          setOpen={setEditCompanyDialogOpen}
          company={companyToEdit}
          onCompanyUpdated={onCompanyUpdated}
        />
      )}
    </>
  )
}

export default Screen
