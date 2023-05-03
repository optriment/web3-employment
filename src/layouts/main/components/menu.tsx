import { WalletActionButton } from '@tronweb3/tronwallet-adapter-react-ui'
import React from 'react'
import { Menu } from 'semantic-ui-react'

const Component = () => (
  <Menu stackable size="huge">
    <Menu.Item as="a" href="/" content="Dashboard" />
    <Menu.Item as="a" href="/companies" content="Companies" />

    <Menu.Menu position="right">
      <Menu.Item>
        <WalletActionButton />
      </Menu.Item>
    </Menu.Menu>
  </Menu>
)

export default Component