import React from 'react'
import { Icon, Message } from 'semantic-ui-react'

const Component = () => (
  <Message icon size="large">
    <Icon name="circle notched" loading />

    <Message.Content>
      <Message.Header content="Please wait" />
      <p>Page is loading...</p>
    </Message.Content>
  </Message>
)

export default Component
