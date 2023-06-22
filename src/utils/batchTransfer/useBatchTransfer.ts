import { useState, useEffect } from 'react'
import { handleError } from '@/lib/errorHandler'
import { pollBlockchainResponse } from '@/utils/poll-blockchain-response'
import { useToken } from '../tokens/useToken'
import { useBatchPayment } from './useBatchPayment'

interface Result {
  isLoading: boolean
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
  const {
    data: contract,
    isLoading: contractLoading,
    batchContractAddress: batchContractAddress,
    error: contractError,
  } = useBatchPayment()
  const { data: token } = useToken()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (contractError) {
      setError(contractError)
    }
  }, [contractError])

  useEffect(() => {
    if (!token) return
    if (!contract) return
    if (!enabled) return
    if (isLoading) return

    const perform = async () => {
      setError('')
      setIsLoading(true)

      try {
        const approveTx = await token
          .approve(batchContractAddress, data.totalAmount)
          .send({
            gasLimit: 1_000_000_000,
            callValue: 0,
          })
        await pollBlockchainResponse({
          tx: approveTx,
          onError: (e: string) => {
            setError(e)
            onError()
          },
          onSuccess: async () => {
            try {
              const transferTx = await contract
                .batchTransfer(data.totalAmount, data.recipients, data.amounts)
                .send({
                  gasLimit: 1_000_000_000,
                  callValue: 0,
                })
              await pollBlockchainResponse({
                tx: transferTx,
                onError: (e: string) => {
                  setError(e)
                  onError()
                },
                onSuccess: () => onSuccess(transferTx),
              })
            } catch (e) {
              setError(handleError(e))
              onError()
            } finally {
              setIsLoading(false)
            }
          },
        })
      } catch (e) {
        setError(handleError(e))
        onError()
        setIsLoading(false)
      }
    }

    perform()
  }, [
    isLoading,
    contract,
    enabled,
    data,
    onSuccess,
    onError,
    token,
    batchContractAddress,
  ])

  return { isLoading: contractLoading || isLoading, error }
}
