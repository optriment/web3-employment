import Script from 'next/script'
import React from 'react'

export const GoogleAnalyticsTag = ({
  googleAnalyticsID,
}: {
  googleAnalyticsID: string
}) => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsID}`}
      strategy="afterInteractive"
    />

    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${googleAnalyticsID}', { page_path: window.location.pathname });
      `}
    </Script>
  </>
)
