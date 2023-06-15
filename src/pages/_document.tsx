import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'
import React from 'react'
import { Segment } from 'semantic-ui-react'

const NEXT_PUBLIC_GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Segment basic size="large">
          <Main />
          <NextScript />
        </Segment>

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </Html>
  )
}
