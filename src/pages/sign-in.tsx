import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth/next'
import { signIn, getCsrfToken } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import {
  Segment,
  Message,
  Form,
  Button,
  Divider,
  Header,
} from 'semantic-ui-react'
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
  const router = useRouter()
  const hasMounted = useHasMounted()
  const [email, setEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleSignIn = async (account: string) => {
    setIsLoading(true)

    await signIn(account, {
      callbackUrl: '/groups',
      redirect: false,
    })

    setIsLoading(false)
  }

  const handleSignInEmail = async () => {
    setIsLoading(true)

    const response = await signIn('email', { email, callbackUrl: '/groups' })

    if (response?.error) {
      setError(response.error)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (router.query.error) {
      switch (router.query.error) {
        case 'SessionRequired':
          break

        case 'OAuthAccountNotLinked': {
          setError(
            'To confirm your identity, sign in with the same account you used originally.'
          )
          break
        }

        default:
          setError('Error: ' + router.query.error)
      }
    }
  }, [router.query.error])

  return (
    <LandingLayout isMobile={isSsrMobile}>
      <Header as="h1" content="Welcome to OptriTool" textAlign="center" />

      <Divider hidden />

      <Segment compact textAlign="center" style={{ margin: '0px auto' }}>
        <iframe
          width="700"
          height="394"
          src="https://www.youtube.com/embed/5tpQaDKjMpA"
          title="Introducing OptriTool: Simplifying Payroll Management in Just 2 Minutes!"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
        />
      </Segment>

      <Divider hidden />

      <Segment
        secondary
        padded={!isSsrMobile ? 'very' : undefined}
        compact={!isSsrMobile}
        textAlign="center"
        style={{ margin: '1em auto' }}
      >
        {error && (
          <Message
            size="large"
            warning
            header="Unable to sign in"
            content={error}
          />
        )}

        <p>
          <Button
            fluid
            size="large"
            onClick={() => handleSignIn('linkedin')}
            content="Sign in with LinkedIn"
            color="linkedin"
            icon="linkedin"
            labelPosition="left"
            disabled={isLoading}
          />
        </p>

        <p>
          <Button
            fluid
            size="large"
            onClick={() => handleSignIn('google')}
            content="Sign in with Google"
            color="blue"
            icon="google"
            labelPosition="left"
            disabled={isLoading}
          />
        </p>

        <Divider />

        {hasMounted && (
          <Form size="large">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

            <Form.Input
              autoComplete="email"
              type="email"
              required={true}
              label="Email"
              value={email}
              size="large"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <Form.Button
              fluid
              size="large"
              secondary
              onClick={() => handleSignInEmail()}
              content="Sign in with Email"
              loading={isLoading}
              disabled={isLoading}
            />
          </Form>
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
