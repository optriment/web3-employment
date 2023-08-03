import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import getConfig from 'next/config'
import { useState, useEffect } from 'react'
import { handleError } from '@/lib/errorHandler'
import { tronWeb } from '@/lib/tronweb'
import { pollBlockchainResponse } from '@/utils/poll-blockchain-response'

const { publicRuntimeConfig } = getConfig()
const { batchContractAddress, tokenAddress } = publicRuntimeConfig

interface Result {
  isLoading: boolean
  status: string
  error: string
}

interface Props {
  enabled: boolean
  data: {
    totalAmount: number
    recipients: string[]
    amounts: number[]
  }
  onSuccess: (_tx: string) => void
  onError: () => void
}

export const useBatchTransfer = ({
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
      try {
        setError('')
        setStatus('loading_approval')
        setIsLoading(true)

        const parameter = [
          {
            type: 'address',
            value: batchContractAddress,
          },
          {
            type: 'uint256',
            // NOTE: Here we have already tokenized value
            value: data.totalAmount,
          },
        ]

        const options = {
          feeLimit: 1_000_000_000,
          callValue: 0,
        }

        const transaction =
          await tronWeb.transactionBuilder.triggerSmartContract(
            tokenAddress,
            'approve(address,uint256)',
            options,
            parameter,
            address
          )

        setStatus('signing_approval')

        const signedTransaction = await signTransaction(transaction.transaction)

        const approveTx = await tronWeb.trx.sendRawTransaction(
          signedTransaction
        )

        setStatus('polling_approval')

        await pollBlockchainResponse({
          tx: approveTx.txid,
          onError: (e: string) => {
            setError(e)
            onError()
          },
          onSuccess: async () => {
            try {
              setStatus('loading_batch_payment')

              const parameter = [
                {
                  type: 'address[]',
                  value: data.recipients,
                },
                {
                  type: 'uint256[]',
                  // NOTE: Here we have already tokenized values
                  value: data.amounts,
                },
              ]

              const options = {
                feeLimit: 1_000_000_000,
                callValue: 0,
              }

              const transaction =
                await tronWeb.transactionBuilder.triggerSmartContract(
                  batchContractAddress,
                  'batchTransfer(address[],uint256[])',
                  options,
                  parameter,
                  address
                )

              setStatus('signing_batch_payment')

              const signedTransaction = await signTransaction(
                transaction.transaction
              )

              const batchTransferTx = await tronWeb.trx.sendRawTransaction(
                signedTransaction
              )

              setStatus('polling_batch_payment')

              await pollBlockchainResponse({
                tx: batchTransferTx.txid,
                onError: (e: string) => {
                  setError(e)
                  onError()
                },
                onSuccess: () => {
                  onSuccess(batchTransferTx.txid)
                },
              })
            } catch (e) {
              setError(handleError(e))
              onError()
            } finally {
              setIsLoading(false)
              setStatus('idle')
            }
          },
        })
      } catch (e) {
        setIsLoading(false)
        setStatus('idle')
        setError(handleError(e))
        onError()
      }
    }

    perform()
  }, [
    status,
    isLoading,
    address,
    connected,
    signTransaction,
    enabled,
    data,
    onSuccess,
    onError,
  ])

  return { isLoading: isLoading, status, error }
}
