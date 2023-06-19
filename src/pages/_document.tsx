import { Html, Head, Main, NextScript } from 'next/document'
import Image from 'next/image'
import Script from 'next/script'
import React from 'react'
import { Segment } from 'semantic-ui-react'

const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GA_ID
const LINKEDIN_TRACKING_PARTNER_ID =
  process.env.NEXT_PUBLIC_LINKEDIN_TRACKING_PARTNER_ID

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {GOOGLE_ANALYTICS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
              strategy="beforeInteractive"
            />
            <Script id="google-analytics" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${GOOGLE_ANALYTICS_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}

        {LINKEDIN_TRACKING_PARTNER_ID && (
          <>
            <Script id="linkedin-vars" strategy="beforeInteractive">
              {`
                _linkedin_partner_id = "${LINKEDIN_TRACKING_PARTNER_ID}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              `}
            </Script>

            <Script id="linkedin-tracking-code" strategy="beforeInteractive">
              {`
                (function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);})(window.lintrk);
              `}
            </Script>

            <noscript>
              <Image
                height="1"
                width="1"
                style={{ display: 'none' }}
                alt=""
                src={`https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_TRACKING_PARTNER_ID}&fmt=gif`}
              />
            </noscript>
          </>
        )}

        <Segment basic size="large">
          <Main />
          <NextScript />
        </Segment>
      </body>
    </Html>
  )
}
