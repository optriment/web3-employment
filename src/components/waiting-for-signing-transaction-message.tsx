import React from 'react'
import { Icon, Message } from 'semantic-ui-react'

const Component = ({ header }: { header?: string }) => (
  <Message icon info size="large">
    <Icon name="circle notched" loading />

    <Message.Content>
      <Message.Header content={header ? header : 'Signing request'} />
      <p>Please open your wallet and sign transaction</p>
    </Message.Content>
  </Message>
)

export default Component
