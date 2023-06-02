import React from 'react'
import { Segment, List } from 'semantic-ui-react'

const Component = () => (
  <Segment basic textAlign="center">
    <p>
      <b>
        Crafted with ❤️ and boundless passion by Optriment for the crypto
        community
      </b>
    </p>

    <List bulleted horizontal link>
      <List.Item
        as="a"
        href="https://www.linkedin.com/company/optriment"
        target="_blank"
        rel="nofollow noreferrer noopener"
      >
        LinkedIn
      </List.Item>
      <List.Item
        as="a"
        href="https://discord.com/invite/7WEbtmuqtv"
        target="_blank"
        rel="nofollow noreferrer noopener"
      >
        Discord
      </List.Item>
      <List.Item
        as="a"
        href="https://github.com/optriment"
        target="_blank"
        rel="nofollow noreferrer noopener"
      >
        GitHub
      </List.Item>
      <List.Item
        as="a"
        href="https://app.websitepolicies.com/policies/view/34u6v3er"
        target="_blank"
        rel="nofollow noreferrer noopener"
      >
        Privacy Policy
      </List.Item>
    </List>
  </Segment>
)

export default Component
