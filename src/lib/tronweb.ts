import getConfig from 'next/config'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const TronWeb = require('tronweb')

const { publicRuntimeConfig } = getConfig()
const { tronNetwork } = publicRuntimeConfig

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tronWeb: any = new TronWeb({
  fullHost:
    tronNetwork === 'mainnet'
      ? 'https://api.trongrid.io'
      : 'https://api.shasta.trongrid.io',
})

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).tronWeb1 = tronWeb
}
