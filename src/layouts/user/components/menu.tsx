import { WalletActionButton } from '@tronweb3/tronwallet-adapter-react-ui'
import React from 'react'
import { Button, Menu } from 'semantic-ui-react'

const Component = () => (
  <Menu stackable size="huge">
    <Menu.Item as="a" href="/" content="Dashboard" />
    <Menu.Item as="a" href="/groups" content="Groups" />

    <Menu.Menu position="right">
      <Menu.Item>
        <WalletActionButton />
      </Menu.Item>
      <Menu.Item>
        <Button
          as="a"
          href="/api/auth/signout"
          icon="sign out"
          content="Sign out"
        />
      </Menu.Item>
    </Menu.Menu>
  </Menu>
)

export default Component
