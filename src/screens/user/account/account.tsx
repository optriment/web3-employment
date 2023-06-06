import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Button, Form, Segment, Grid, Header } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import api, { APIError } from '@/lib/api'
import type { UserDTO } from '@/lib/dto/UserDTO'
import { useIsMobile } from '@/utils/use-is-mobile'

const Screen = () => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<UserDTO | undefined>(undefined)
  const [error, setError] = useState<string>('')

  const handleRemoveAccount = async () => {
    if (
      !window.confirm(
        'Are you sure? This will also remove all associated data.'
      )
    ) {
      return
    }

    await api.deleteMyAccount()

    router.reload()
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const account = await api.getMyAccount()

        setData(account.data)
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
    <Grid container={!isMobile} columns={1}>
      {isLoading && (
        <Grid.Column>
          <LoadingMessage content="Loading account" />
        </Grid.Column>
      )}

      {error && (
        <Grid.Column>
          <ErrorMessage header="Unable to load account" content={error} />
        </Grid.Column>
      )}

      {data && (
        <>
          <Grid.Column textAlign="center">
            <Header as="h1">Hey, {data.name ?? data.email}!</Header>
          </Grid.Column>

          <Grid.Row columns={3}>
            <Grid.Column>
              <Segment size="large">
                <Header as="h3">Your profile:</Header>

                <Form size="large">
                  <Form.Input label="Email" value={data.email} readOnly />
                  <Form.Input label="Name" value={data.name} readOnly />
                </Form>
              </Segment>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row columns={3}>
            <Grid.Column>
              <Segment size="large">
                <Header as="h3">Danger Area</Header>

                <p>
                  Removing the account is permanent and cannot be undo. Please
                  think twice.
                </p>

                <Button
                  negative
                  onClick={handleRemoveAccount}
                  content="Remove account"
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </>
      )}
    </Grid>
  )
}

export default Screen
