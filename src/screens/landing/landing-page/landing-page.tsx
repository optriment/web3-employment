import React from 'react'
import { Segment, Grid, Header } from 'semantic-ui-react'
import { useIsMobile } from '@/utils/use-is-mobile'

const Screen = () => {
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
            content="Welcome to OptriPay"
            style={isMobile ? null : { fontSize: '2.5em' }}
          />

          <Header as="h2" style={isMobile ? null : { fontSize: '1.3em' }}>
            This is a sample screen
          </Header>
        </Segment>
      </Grid.Column>
    </Grid>
  )
}

export default Screen
