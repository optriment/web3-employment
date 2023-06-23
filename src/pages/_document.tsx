import { Html, Head, Main, NextScript } from 'next/document'
import Image from 'next/image'
import React from 'react'
import { Segment } from 'semantic-ui-react'

const LINKEDIN_TRACKING_PARTNER_ID =
  process.env.NEXT_PUBLIC_LINKEDIN_TRACKING_PARTNER_ID

export default function Document() {
  return (
    <Html lang="en">
      <Head />

      <body>
        <Segment basic size="large">
          <Main />
          <NextScript />
        </Segment>

        <noscript>
          <Image
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_TRACKING_PARTNER_ID}&fmt=gif`}
          />
        </noscript>
      </body>
    </Html>
  )
}
