import React, { useState, useEffect } from 'react'
import { Button, Message, Grid, Header } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import type {
  CompanyWithEmployees,
  CompanyWithEmployeesApiResponse,
} from '@/pages/api/companies/[id]'
import { useIsMobile } from '@/utils/use-is-mobile'
import { EmployeesList } from './components/employees-list'

interface Props {
  companyId: string
}

const Screen = ({ companyId }: Props) => {
  const isMobile = useIsMobile()

  const [data, setData] = useState<CompanyWithEmployees | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!companyId) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const res = await fetch(`/api/companies/${companyId}`)
        const d: CompanyWithEmployeesApiResponse = await res.json()

        if (d.success) {
          setData(d.data as CompanyWithEmployees)
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
  }, [companyId])

  const isCompanyArchived = data && data.company.archived_at

  return (
    <>
      <Grid stackable={isMobile} container={!isMobile} columns={1}>
        {isLoading && (
          <Grid.Column>
            <LoadingMessage content="Loading company with employees..." />
          </Grid.Column>
        )}

        {error && (
          <Grid.Column>
            <ErrorMessage header="Unable to load company" content={error} />
          </Grid.Column>
        )}

        {data !== null && (
          <>
            <Grid.Row columns={isMobile ? 1 : 2}>
              <Grid.Column width={10}>
                <Header as="h1">{data.company.display_name}</Header>

                {data.company.comment && (
                  <Header as="h3">{data.company.comment}</Header>
                )}

                {data.company.archived_at && (
                  <Header as="h3">
                    Archived: {data.company.archived_at.toLocaleString()}
                  </Header>
                )}
              </Grid.Column>

              <Grid.Column width={6} textAlign="right">
                <Button
                  size="large"
                  icon="plus"
                  content="Add Employee"
                  primary
                  disabled={!!isCompanyArchived}
                />
                <Button size="large" icon="pencil" content="Edit Company" />
              </Grid.Column>
            </Grid.Row>

            <Grid.Column>
              {data.employees.length > 0 ? (
                <EmployeesList
                  isCompanyArchived={!!isCompanyArchived}
                  employees={data.employees}
                />
              ) : (
                <Message warning>
                  <p>No employees in this company yet.</p>
                </Message>
              )}
            </Grid.Column>
          </>
        )}
      </Grid>
    </>
  )
}

export default Screen
