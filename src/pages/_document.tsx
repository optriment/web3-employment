import { Html, Head, Main, NextScript } from 'next/document'
import React from 'react'
import { Segment } from 'semantic-ui-react'

export default function Document() {
  return (
    <Html lang="en">
      <Head />

      <body>
        <Segment basic size="large">
          <Main />
          <NextScript />
        </Segment>
      </body>
    </Html>
  )
}
