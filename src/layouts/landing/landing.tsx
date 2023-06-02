import React from 'react'
import { Grid } from 'semantic-ui-react'
import { Footer } from './components'

type Props = {
  isMobile: boolean
  children: React.ReactNode
}

const Layout = ({ isMobile, children }: Props) => (
  <Grid container={!isMobile} columns={1} padded="vertically">
    <Grid.Column>{children}</Grid.Column>

    <Grid.Column>
      <Footer />
    </Grid.Column>
  </Grid>
)

export default Layout
