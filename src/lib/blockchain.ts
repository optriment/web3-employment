import getConfig from 'next/config'
import { tronWeb } from '@/lib/tronweb'

const { publicRuntimeConfig } = getConfig()
const { tokenDecimals, tronNetwork } = publicRuntimeConfig

export const buildTronScanTransactionURL = (tx: string) => {
  let url
  if (tronNetwork === 'mainnet') {
    url = 'https://tronscan.io/#/transaction'
  } else {
    url = 'https://shasta.tronscan.io/#/transaction'
  }

  return `${url}/${tx}`
}

export const toTokens = (value: number) => value * 10 ** tokenDecimals

export const fromTokens = (value: number) => value / 10 ** tokenDecimals

export const addressToHex = (base58: string) => tronWeb.address.toHex(base58)
