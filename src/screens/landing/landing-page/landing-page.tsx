import Link from 'next/link'
import React from 'react'
import {
  Button,
  Divider,
  Container,
  Segment,
  Grid,
  Header,
} from 'semantic-ui-react'
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
            content="OptriTool"
            style={isMobile ? null : { fontSize: '2.5em' }}
          />

          <Header as="h2" style={isMobile ? null : { fontSize: '1.3em' }}>
            Simplify USDT Payments on Tron Blockchain
          </Header>
        </Segment>
      </Grid.Column>

      <Grid.Column textAlign="justified">
        <Container text>
          <p>
            OptriTool is a powerful payment tool designed to streamline
            transactions using USDT tokens on the Tron blockchain. With
            OptriTool, users can effortlessly make payments and manage groups of
            people, whether they are employees, contractors, freelancers, or
            family members. This intuitive tool provides a user-friendly
            interface and offers enhanced functionality compared to traditional
            crypto wallets.
          </p>
        </Container>
      </Grid.Column>

      <Grid.Column textAlign="center">
        <Button
          primary
          size="massive"
          as="a"
          href="/sign-in"
          content="Try Now!"
        />
      </Grid.Column>

      <Grid.Column textAlign="justified">
        <Divider hidden />

        <Header
          as="h2"
          style={isMobile ? null : { fontSize: '1.5em' }}
          textAlign="center"
          dividing
        >
          Key Features
        </Header>

        <Container text>
          <p>
            <b>Group Management:</b> Create and manage multiple groups of
            people, each with their own display name, wallet address, default
            amount value, contacts, and comments. Keep your payment activities
            organized and easily accessible.
          </p>

          <p>
            <b>Blockchain Payments:</b> OptriTool leverages the Tron blockchain
            to process payments, ensuring secure and efficient transactions.
            Users are required to have a TronLink wallet and pay gas fees to
            complete their payments.
          </p>

          <p>
            <b>Registration Options:</b> OptriTool supports registration through
            Email Magic Link, GitHub, and Google. In the future, we plan to
            expand registration options to include LinkedIn, Twitter, and
            Facebook, providing even more convenience and accessibility for our
            users.
          </p>

          <p>
            <b>Data Storage:</b> OptriTool securely stores all payment-related
            data on the backend, keeping it readily available for future
            reference and analysis.
          </p>

          <p>
            <b>Archiving Capability:</b> Seamlessly archive or unarchive both
            companies and individuals, allowing for flexible management of
            payment recipients.
          </p>

          <p>
            <b>User-Friendly Interface:</b> OptriTool boasts an{' '}
            <a
              href="https://github.com/optriment/web3-employment#screenshots"
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              intuitive and easy-to-use interface
            </a>
            , making it effortless for users to navigate through the platform
            and perform payment tasks. It is designed to be responsive and works
            seamlessly on both desktop and mobile devices.
          </p>

          <p>
            Please note that the availability of features and the user interface
            may vary slightly depending on the device used, but OptriTool is
            designed to deliver a seamless experience across both desktop and
            mobile platforms.
          </p>
        </Container>
      </Grid.Column>

      <Grid.Column textAlign="justified">
        <Divider hidden />

        <Header
          as="h2"
          style={isMobile ? null : { fontSize: '1.5em' }}
          textAlign="center"
          dividing
        >
          Installation
        </Header>

        <Container text>
          <p>
            OptriTool is available as a web-based platform accessible to users
            worldwide. Simply visit <Link href="/sign-in">our website</Link> to
            start using OptriTool and take advantage of its powerful features.
          </p>

          <p>
            However, we understand that some users may prefer to store data
            locally and have greater control over their installation. If you
            wish to install OptriTool on your own server (Linux), laptop, or PC,
            <a href="mailto:office@optriment.com?subject=OptriTool Installation">
              {' our team '}
            </a>
            is here to assist you throughout the process.
          </p>
        </Container>
      </Grid.Column>

      <Grid.Column textAlign="justified">
        <Divider hidden />

        <Header
          as="h2"
          style={isMobile ? null : { fontSize: '1.5em' }}
          textAlign="center"
          dividing
        >
          Compatibility
        </Header>

        <Container text>
          <p>
            OptriTool can be accessed through our website and is compatible with
            both desktop and mobile devices. However, it&apos;s important to
            note that payments can only be made using the desktop version of
            OptriTool.
          </p>

          <p>
            To process payments, users are required to have a TronLink wallet
            installed and connected to the platform. Rest assured that other
            features of the platform can be utilized without the need for an
            installed wallet.
          </p>
        </Container>
      </Grid.Column>

      <Grid.Column textAlign="justified">
        <Divider hidden />

        <Header
          as="h2"
          style={isMobile ? null : { fontSize: '1.5em' }}
          textAlign="center"
          dividing
        >
          Pricing
        </Header>

        <Container text>
          <p>
            OptriTool is currently free to use, with no platform commissions
            imposed on transactions. Enjoy the convenience and efficiency of
            managing your USDT payments without any additional costs.
          </p>

          <p>
            Simplify your payment workflow and experience the power of{' '}
            <Link href="/sign-in">OptriTool today!</Link>
          </p>
        </Container>
      </Grid.Column>

      <Grid.Column textAlign="center">
        <Button
          primary
          size="massive"
          as="a"
          href="/sign-in"
          content="Try Now!"
        />
      </Grid.Column>
    </Grid>
  )
}

export default Screen
