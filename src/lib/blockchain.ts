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

export const toTokens = (value: number) => {
  const valueString = value.toString()
  const decimalIndex = valueString.indexOf('.')

  if (decimalIndex !== -1) {
    const fractionalPart = valueString.substring(decimalIndex + 1)
    const missingZeros = tokenDecimals - fractionalPart.length
    const zeros = '0'.repeat(missingZeros)

    return Number(valueString.replace('.', '') + zeros)
  }

  return Number(valueString + '0'.repeat(tokenDecimals))
}

export const fromTokens = (value: number) => value / 10 ** tokenDecimals

export const addressToHex = (base58: string) => tronWeb.address.toHex(base58)
