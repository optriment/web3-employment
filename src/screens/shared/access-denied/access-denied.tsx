import Link from 'next/link'
import { signIn } from 'next-auth/react'
import React from 'react'
import { Grid, Header } from 'semantic-ui-react'
import { useIsMobile } from '@/utils/use-is-mobile'

const Screen = () => {
  const isMobile = useIsMobile()

  return (
    <Grid container={!isMobile} columns={1}>
      <Grid.Column textAlign="center">
        <Header as="h1" content="Authorization Required" />
      </Grid.Column>

      <Grid.Column textAlign="center">
        <p>
          <Link
            href="/api/auth/signin"
            onClick={(e) => {
              e.preventDefault()
              signIn()
            }}
          >
            You must be signed in to view this page
          </Link>
        </p>
      </Grid.Column>
    </Grid>
  )
}

export default Screen
