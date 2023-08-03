import React from 'react'
import { Icon, Message } from 'semantic-ui-react'

const Component = () => (
  <Message icon info size="large">
    <Icon name="circle notched" loading />

    <Message.Content>
      <Message.Header content="Initializing transaction" />
      <p>Please wait...</p>
    </Message.Content>
  </Message>
)

export default Component
