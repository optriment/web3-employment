import {
  WalletDisconnectedError,
  WalletNotFoundError,
} from '@tronweb3/tronwallet-abstract-adapter'
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks'
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { SessionProvider } from 'next-auth/react'
import React, { useCallback, useMemo } from 'react'
import Web3Provider from '@/context/web3-context'
import { IsSsrMobileContext } from '@/utils/use-is-mobile'
import type { WalletError } from '@tronweb3/tronwallet-abstract-adapter'
import type { AppProps } from 'next/app'
import type { Session } from 'next-auth'

import 'semantic-ui-css/semantic.min.css'
import '@tronweb3/tronwallet-adapter-react-ui/style.css'

const { publicRuntimeConfig } = getConfig()

const { googleAnalyticsID, linkedInTrackingPartnerID } = publicRuntimeConfig

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{
  session: Session
  isSsrMobile: boolean
}>) {
  const router = useRouter()

  const onError = useCallback((e: WalletError) => {
    if (e instanceof WalletNotFoundError) {
      console.error('WalletNotFoundError:', e.message)
    } else if (e instanceof WalletDisconnectedError) {
      console.error('WalletDisconnectedError:', e.message)
    } else {
      console.error('Other error: ', e.message)
    }
  }, [])

  const adapters = useMemo(function () {
    return [
      new TronLinkAdapter({
        openTronLinkAppOnMobile: true,
        openUrlWhenWalletNotFound: true,
        checkTimeout: 3000,
        dappName: 'OptriTool',
      }),
    ]
  }, [])

  return (
    <>
      {/* Google Analytics */}

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

      {/* LinkedIn */}

      <Script id="linkedin-vars" strategy="afterInteractive">
        {`
          _linkedin_partner_id = "${linkedInTrackingPartnerID}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        `}
      </Script>

      <Script id="linkedin-tracking-code" strategy="afterInteractive">
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

      <SessionProvider session={session}>
        <WalletProvider onError={onError} adapters={adapters}>
          <WalletModalProvider>
            <Web3Provider>
              <IsSsrMobileContext.Provider value={pageProps.isSsrMobile}>
                <Component key={router.asPath} {...pageProps} />
              </IsSsrMobileContext.Provider>
            </Web3Provider>
          </WalletModalProvider>
        </WalletProvider>
      </SessionProvider>
    </>
  )
}
