import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import getConfig from 'next/config'
import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  createContext,
} from 'react'
import type { Network } from '@tronweb3/tronwallet-abstract-adapter'
import type { TronLinkAdapter, TronWeb } from '@tronweb3/tronwallet-adapters'

const { publicRuntimeConfig } = getConfig()

interface SmartContract {
  at: (_address: string) => Promise<unknown>
}

interface MyTronWeb extends TronWeb {
  contract(): SmartContract
  address: {
    toHex: (_: string) => string
  }
}

interface IWeb3Context {
  wallet: MyTronWeb | null
  isWalletInstalled: boolean
  network: Network | null
  connected: boolean
  connecting: boolean
  disconnected: boolean
  error: string
  tokenAddress: string
  tokenDecimals: number
  tokenSymbol: string
  address: string | null
  fromTokens(_: number): number
  toTokens(_: number): number
  addressToHex(_: string): string
  buildTronScanTransactionURL(_: string): string
}

export const Web3Context = createContext<IWeb3Context>({
  wallet: null,
  isWalletInstalled: false,
  network: null,
  connected: false,
  connecting: false,
  disconnected: false,
  error: '',
  tokenAddress: '',
  tokenDecimals: 0,
  tokenSymbol: '',
  address: '',
  fromTokens: () => 0,
  toTokens: () => 0,
  addressToHex: () => '',
  buildTronScanTransactionURL: () => '',
})

type Props = {
  children: React.ReactNode
}

const { tokenAddress, tokenDecimals, tokenSymbol, tronNetwork } =
  publicRuntimeConfig

const Web3Provider = ({ children }: Props) => {
  const { address, connected, connecting, wallet: tronWallet } = useWallet()

  const [error, setError] = useState<string>('')
  const [wallet, setWallet] = useState<MyTronWeb | null>(null)
  const [network, setNetwork] = useState<Network | null>(null)

  const buildTronScanTransactionURL = useCallback((tx: string) => {
    let url
    if (tronNetwork === 'mainnet') {
      url = 'https://tronscan.io/#/transaction'
    } else {
      url = 'https://shasta.tronscan.io/#/transaction'
    }

    return `${url}/${tx}`
  }, [])

  const toTokens = useCallback(
    (value: number) => value * 10 ** tokenDecimals,
    []
  )

  const fromTokens = useCallback(
    (value: number) => value / 10 ** tokenDecimals,
    []
  )

  const addressToHex = useCallback(
    (base58: string) => (wallet as MyTronWeb).address.toHex(base58),
    [wallet]
  )

  useEffect(() => {
    if (wallet) return

    const setWalletIfReady = () => {
      if (!window.tronWeb) return
      if (!window.tronWeb.ready) return
      setWallet(window.tronWeb as MyTronWeb)
    }

    if (window.tronWeb && window.tronWeb.ready) {
      setWalletIfReady()
    } else {
      window.addEventListener('load', setWalletIfReady)
    }

    return () => window.removeEventListener('load', setWalletIfReady)
  })

  // Set network
  useEffect(() => {
    if (!wallet) return
    if (!connected) return
    if (!tronWallet) return
    if (network) return

    const perform = async () => {
      try {
        const n = await (tronWallet.adapter as TronLinkAdapter).network()

        switch (tronNetwork) {
          case 'mainnet': {
            if (n.chainId !== '0x2b6653dc') {
              setError('Please connect wallet to Mainnet blockchain')
              return
            }

            break
          }
          case 'shasta': {
            if (n.chainId !== '0x94a9059e') {
              setError('Please connect wallet to Shasta blockchain')
              return
            }

            break
          }

          default: {
            setError(`Network ${tronNetwork} is not supported`)
            return
          }
        }

        setNetwork(n)
      } catch (e) {
        setError(`Network ${tronNetwork} is not supported`)
      }
    }

    perform()
  }, [wallet, connected, tronWallet, network])

  // We want to remember value reference, otherwise we will have unnecessary rerenders
  const value = useMemo(
    () => ({
      wallet,
      isWalletInstalled: !!wallet,
      network,
      connected,
      connecting,
      disconnected: !connected,
      error,
      tokenAddress,
      tokenDecimals,
      tokenSymbol,
      address,
      toTokens,
      fromTokens,
      addressToHex,
      buildTronScanTransactionURL,
    }),
    [
      wallet,
      network,
      connected,
      connecting,
      error,
      toTokens,
      fromTokens,
      address,
      addressToHex,
      buildTronScanTransactionURL,
    ]
  )

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export default Web3Provider
