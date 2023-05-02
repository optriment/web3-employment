import React from 'react'
import { Icon, Message } from 'semantic-ui-react'

interface Props {
  content: string
}

const Component = ({ content }: Props) => (
  <Message icon>
    <Icon name="circle notched" loading />

    <Message.Content>
      <Message.Header content="Please wait..." />
      <p>{content}</p>
    </Message.Content>
  </Message>
)

export default Component
