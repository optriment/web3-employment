import getConfig from 'next/config'
import React, { useContext } from 'react'
import { Segment, Grid, Header } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'
import { useIsMobile } from '@/utils/use-is-mobile'

const { publicRuntimeConfig } = getConfig()

const Screen = () => {
  const { network, address, tokenAddress, tokenDecimals, tokenSymbol } =
    useContext(Web3Context)
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
            content="Welcome"
            style={isMobile ? null : { fontSize: '2.5em' }}
          />

          <Header as="h2" style={isMobile ? null : { fontSize: '1.3em' }}>
            This is a sample screen
          </Header>
        </Segment>
      </Grid.Column>

      <Grid.Column>
        <Header as="h2" style={isMobile ? null : { fontSize: '1.3em' }}>
          Public Runtime Config (from env)
        </Header>

        <pre>
          <code>{JSON.stringify(publicRuntimeConfig, null, 2)}</code>
        </pre>
      </Grid.Column>

      <Grid.Column>
        <Header as="h2" style={isMobile ? null : { fontSize: '1.3em' }}>
          Web3 Context
        </Header>

        <Header as="h3">Network</Header>

        <pre>
          <code>{JSON.stringify(network, null, 2)}</code>
        </pre>

        <Header as="h3">Properties</Header>

        <pre>
          <code>
            {JSON.stringify(
              { address, tokenAddress, tokenDecimals, tokenSymbol },
              null,
              2
            )}
          </code>
        </pre>
      </Grid.Column>
    </Grid>
  )
}

export default Screen
