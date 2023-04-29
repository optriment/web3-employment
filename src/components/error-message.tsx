import React from 'react'
import { Icon, Message } from 'semantic-ui-react'

interface Props {
  header: string
  content: string
}

const Component = ({ header, content }: Props) => (
  <Message icon error>
    <Icon name="ban" />

    <Message.Content>
      <Message.Header content={header} />
      <p>{content}</p>
    </Message.Content>
  </Message>
)

export default Component
