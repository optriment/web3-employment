import React from 'react'
import { Icon, Message } from 'semantic-ui-react'

const Component = () => (
  <Message icon warning>
    <Icon name="circle notched" loading />

    <Message.Content>
      <Message.Header content="At the moment, we are awaiting a response from the blockchain." />
      <p>
        We kindly ask you to refrain from reloading this page as the process may
        take approximately 30 seconds to complete.
      </p>
    </Message.Content>
  </Message>
)

export default Component
