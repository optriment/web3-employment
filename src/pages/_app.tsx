import {
  WalletDisconnectedError,
  WalletNotFoundError,
} from '@tronweb3/tronwallet-abstract-adapter'
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks'
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui'
import {
  TronLinkAdapter,
  WalletConnectAdapter,
} from '@tronweb3/tronwallet-adapters'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { SessionProvider } from 'next-auth/react'
import React, { useCallback, useMemo } from 'react'
import { GoogleAnalyticsTag } from '@/components/GoogleAnalyticsTag'
import { LinkedInInsightTag } from '@/components/LinkedInInsightTag'
import { IsSsrMobileContext } from '@/utils/use-is-mobile'
import type { WalletError } from '@tronweb3/tronwallet-abstract-adapter'
import type { AppProps } from 'next/app'
import type { Session } from 'next-auth'

import 'semantic-ui-css/semantic.min.css'
import '@tronweb3/tronwallet-adapter-react-ui/style.css'

const { publicRuntimeConfig } = getConfig()
const { tronNetwork, walletConnectProjectId } = publicRuntimeConfig

const googleAnalyticsID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
const linkedInPartner = process.env.NEXT_PUBLIC_LINKEDIN_TRACKING_PARTNER_ID

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
    const tronLinkAdapter = new TronLinkAdapter({
      openTronLinkAppOnMobile: true,
      openUrlWhenWalletNotFound: true,
      dappName: 'OptriTool',
      dappIcon: 'https://optritool.optriment.com/apple-touch-icon.png',
    })

    const walletConnectAdapter = new WalletConnectAdapter({
      network: tronNetwork === 'mainnet' ? 'Mainnet' : 'Shasta',
      options: {
        relayUrl: 'wss://relay.walletconnect.com',
        projectId: walletConnectProjectId,
        metadata: {
          name: 'OptriTool',
          description: 'OptriTool',
          url: 'https://optritool.optriment.com',
          icons: ['https://optritool.optriment.com/apple-touch-icon.png'],
        },
      },
    })

    return [tronLinkAdapter, walletConnectAdapter]
  }, [])

  return (
    <>
      {googleAnalyticsID && (
        <GoogleAnalyticsTag googleAnalyticsID={googleAnalyticsID} />
      )}

      {linkedInPartner && <LinkedInInsightTag partnerId={linkedInPartner} />}

      <SessionProvider session={session}>
        <WalletProvider
          onError={onError}
          adapters={adapters}
          autoConnect={false}
        >
          <WalletModalProvider>
            <IsSsrMobileContext.Provider value={pageProps.isSsrMobile}>
              <Component key={router.asPath} {...pageProps} />
            </IsSsrMobileContext.Provider>
          </WalletModalProvider>
        </WalletProvider>
      </SessionProvider>
    </>
  )
}
