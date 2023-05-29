import {
  WalletDisconnectedError,
  WalletNotFoundError,
} from '@tronweb3/tronwallet-abstract-adapter'
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks'
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters'
import { useRouter } from 'next/router'
import { SessionProvider } from 'next-auth/react'
import React, { useCallback, useMemo } from 'react'
import Web3Provider from '@/context/web3-context'
import { IsSsrMobileContext } from '@/utils/use-is-mobile'
import type { WalletError } from '@tronweb3/tronwallet-abstract-adapter'
import type { AppProps } from 'next/app'
import type { Session } from 'next-auth'

import 'semantic-ui-css/semantic.min.css'
import '@tronweb3/tronwallet-adapter-react-ui/style.css'

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
  )
}
