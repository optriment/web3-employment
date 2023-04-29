import React from 'react'
import { Grid, Segment } from 'semantic-ui-react'

type Props = {
  isMobile: boolean
  children: React.ReactNode
}

const Layout = ({ isMobile, children }: Props) => (
  <Grid container={!isMobile} columns={1}>
    <Grid.Column>
      <Segment basic size={isMobile ? undefined : 'big'}>
        {children}
      </Segment>
    </Grid.Column>
  </Grid>
)

export default Layout
