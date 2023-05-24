import { useSession } from 'next-auth/react'
import React from 'react'
import { Segment, Grid, Header } from 'semantic-ui-react'
import { useIsMobile } from '@/utils/use-is-mobile'

const Screen = () => {
  const { data: session } = useSession()
  const isMobile = useIsMobile()

  return (
    <Grid container={!isMobile} columns={1}>
      <Grid.Column textAlign="center">
        <Segment
          secondary
          size={isMobile ? undefined : 'big'}
          style={isMobile ? null : { padding: '2em' }}
        >
          <Header
            as="h1"
            content="Dashboard"
            style={isMobile ? null : { fontSize: '2.5em' }}
          />

          <Header as="h2" style={isMobile ? null : { fontSize: '1.3em' }}>
            Welcome, {session?.user?.name ?? session?.user?.email}!
          </Header>
        </Segment>
      </Grid.Column>
    </Grid>
  )
}

export default Screen
