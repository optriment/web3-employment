import { useState, useEffect } from 'react'
import { handleError } from '@/lib/errorHandler'
import { pollBlockchainResponse } from '@/utils/poll-blockchain-response'
import { useToken } from './useToken'

interface Result {
  isLoading: boolean
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
  const { data: token, isLoading: tokenLoading, error: tokenError } = useToken()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (tokenError) {
      setError(tokenError)
    }
  }, [tokenError])

  useEffect(() => {
    if (!token) return
    if (!enabled) return
    if (isLoading) return

    const perform = async () => {
      setError('')
      setIsLoading(true)

      try {
        const tx = await token.transfer(data.recipient, data.amount).send({
          feeLimit: 1_000_000_000,
          callValue: 0,
        })

        await pollBlockchainResponse({
          tx: tx,
          onError: (e: string) => {
            setError(e)
            onError()
          },
          onSuccess: () => onSuccess(tx),
        })
      } catch (e) {
        setError(handleError(e))
        onError()
      } finally {
        setIsLoading(false)
      }
    }

    perform()
  }, [isLoading, token, enabled, data, onSuccess, onError])

  return { isLoading: tokenLoading || isLoading, error }
}
