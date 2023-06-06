import { useSession } from 'next-auth/react'
import React from 'react'
import { Form, Segment, Grid, Header } from 'semantic-ui-react'
import { useIsMobile } from '@/utils/use-is-mobile'

const Screen = () => {
  const { data: session } = useSession()
  const isMobile = useIsMobile()

  return (
    <Grid container={!isMobile} columns={1}>
      <Grid.Column textAlign="center">
        <Header as="h1">
          Hey, {session?.user?.name ?? session?.user?.email}!
        </Header>
      </Grid.Column>

      <Grid.Row columns={3} celled>
        <Grid.Column>
          <Segment>
            <Header as="h3">Your profile:</Header>

            <Form>
              <Form.Input label="Email" value={session?.user?.email} readOnly />
              <Form.Input label="Name" value={session?.user?.name} readOnly />
            </Form>
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default Screen
