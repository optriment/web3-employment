import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import getConfig from 'next/config'
import { useState, useEffect } from 'react'
import { handleError } from '@/lib/errorHandler'
import { tronWeb } from '@/lib/tronweb'
import { pollBlockchainResponse } from '@/utils/poll-blockchain-response'

const { publicRuntimeConfig } = getConfig()
const { tokenAddress } = publicRuntimeConfig

interface Result {
  isLoading: boolean
  status: string
  error: string
}

interface Props {
  enabled: boolean
  data: {
    recipient: string
    amount: number
  }
  onSuccess: (_tx: string) => void
  onError: () => void
}

export const useTokenTransfer = ({
  enabled,
  onSuccess,
  onError,
  data,
}: Props): Result => {
  const { connected, signTransaction, address } = useWallet()

  const [status, setStatus] = useState<string>('idle')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!enabled) return
    if (!connected) return
    if (!address || address === '') return
    if (isLoading) return

    const perform = async () => {
      setError('')
      setStatus('loading')
      setIsLoading(true)

      try {
        const parameter = [
          {
            type: 'address',
            value: data.recipient,
          },
          {
            type: 'uint256',
            // NOTE: Here we have already tokenized value
            value: data.amount,
          },
        ]

        const options = {
          feeLimit: 1_000_000_000,
          callValue: 0,
        }

        const transaction =
          await tronWeb.transactionBuilder.triggerSmartContract(
            tokenAddress,
            'transfer(address,uint256)',
            options,
            parameter,
            address
          )

        setStatus('signing')

        const signedTransaction = await signTransaction(transaction.transaction)

        const transferTx = await tronWeb.trx.sendRawTransaction(
          signedTransaction
        )

        setStatus('polling')

        await pollBlockchainResponse({
          tx: transferTx.txid,
          onError: (e: string) => {
            setError(e)
            onError()
          },
          onSuccess: () => onSuccess(transferTx.txid),
        })
      } catch (e) {
        setError(handleError(e))
        onError()
      } finally {
        setStatus('idle')
        setIsLoading(false)
      }
    }

    perform()
  }, [
    connected,
    isLoading,
    enabled,
    data,
    onSuccess,
    onError,
    address,
    signTransaction,
  ])

  return { isLoading: isLoading, status, error }
}
