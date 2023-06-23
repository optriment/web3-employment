import getConfig from 'next/config'
import { Html, Head, Main, NextScript } from 'next/document'
import Image from 'next/image'
import React from 'react'
import { Segment } from 'semantic-ui-react'

const { publicRuntimeConfig } = getConfig()
const { linkedInTrackingPartnerID } = publicRuntimeConfig

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
            src={`https://px.ads.linkedin.com/collect/?pid=${linkedInTrackingPartnerID}&fmt=gif`}
          />
        </noscript>
      </body>
    </Html>
  )
}
