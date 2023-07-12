// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  reactStrictMode: true,

  trailingSlash: false,

  output: 'standalone',

  swcMinify: true,

  productionBrowserSourceMaps: false,

  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  },

  publicRuntimeConfig: {
    // Will be available on both server and client
    tronNetwork: process.env.TRON_NETWORK,
    tokenAddress: process.env.TOKEN_ADDRESS,
    tokenDecimals: process.env.TOKEN_DECIMALS,
    tokenSymbol: process.env.TOKEN_SYMBOL,
    batchContractAddress: process.env.BATCH_CONTRACT_ADDRESS,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'px.ads.linkedin.com',
        port: '',
        pathname: '/collect/**',
      },
    ],
  },
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(withBundleAnalyzer(nextConfig))
