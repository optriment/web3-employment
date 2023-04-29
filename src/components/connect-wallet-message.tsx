import React from 'react'
import { Icon, Message } from 'semantic-ui-react'

const Component: React.FC = () => (
  <Message icon warning>
    <Icon name="info circle" />

    <Message.Content>
      <Message.Header content="Please connect wallet" />

      <p>
        To access the data stored on the blockchain, a connected wallet is
        required.
      </p>
    </Message.Content>
  </Message>
)

export default Component
