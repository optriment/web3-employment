import React from 'react'
import { Grid } from 'semantic-ui-react'
import { ConnectWalletButton, ConnectWalletMessage } from '@/components'
import { useIsMobile } from '@/utils/use-is-mobile'

const Screen = () => {
  const isMobile = useIsMobile()

  return (
    <Grid container={!isMobile} columns={1}>
      <Grid.Column>
        <ConnectWalletMessage />
      </Grid.Column>
      <Grid.Column>
        <ConnectWalletButton />
      </Grid.Column>
    </Grid>
  )
}

export default Screen
