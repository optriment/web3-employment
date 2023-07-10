import { getServerSession } from 'next-auth/next'
import { signIn, getCsrfToken } from 'next-auth/react'
import React, { useState } from 'react'
import { Segment, Form, Button, Divider, Header } from 'semantic-ui-react'
import { useHasMounted } from '@/hooks'
import { LandingLayout } from '@/layouts'
import { authOptions } from '@/lib/auth'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'

export default function SignIn({
  csrfToken,
  isSsrMobile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const hasMounted = useHasMounted()
  const [email, setEmail] = useState<string>('')

  return (
    <LandingLayout isMobile={isSsrMobile}>
      <Header as="h1" content="Welcome to OptriTool" textAlign="center" />

      <Divider hidden />

      <Segment
        secondary
        padded={!isSsrMobile ? 'very' : undefined}
        compact
        textAlign="center"
        style={{ margin: '1em auto' }}
      >
        <p>
          <Button
            fluid
            size="large"
            onClick={() => signIn('linkedin')}
            content="Sign in with LinkedIn"
            color="linkedin"
            icon="linkedin"
            labelPosition="left"
          />
        </p>

        <p>
          <Button
            fluid
            size="large"
            onClick={() => signIn('google')}
            content="Sign in with Google"
            color="blue"
            icon="google"
            labelPosition="left"
          />
        </p>

        <Divider />

        {hasMounted && (
          <p>
            <Form size="large">
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

              <Form.Input
                autoComplete="email"
                label="Email"
                value={email}
                size="large"
                onChange={(e) => setEmail(e.target.value)}
              />

              <Form.Button
                fluid
                size="large"
                secondary
                onClick={() => signIn('email', { email })}
                content="Sign in with Email"
              />
            </Form>
          </p>
        )}
      </Segment>
    </LandingLayout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context)
  const session = await getServerSession(context.req, context.res, authOptions)

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: '/groups' } }
  }

  return {
    props: {
      csrfToken,
      isSsrMobile: getIsSsrMobile(context),
    },
  }
}
