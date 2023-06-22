import { useState, useEffect, useContext } from 'react'
import { Web3Context } from '@/context/web3-context'
import { handleError } from '@/lib/errorHandler'

interface BatchPaymentContract {
  batchTransfer(
    _totalAmount: number,
    _recipients: string[],
    _amounts: number[]
  ): {
    send: (_args: unknown) => Promise<string>
  }
}

interface Result {
  isLoading: boolean
  data: BatchPaymentContract | null
  batchContractAddress: string
  error: string
}

export const useBatchPayment = (): Result => {
  const { wallet, batchContractAddress } = useContext(Web3Context)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [data, setData] = useState<BatchPaymentContract | null>(null)

  useEffect(() => {
    if (!wallet) return
    if (!batchContractAddress) return
    if (data) return

    const perform = async () => {
      setError('')
      setIsLoading(true)

      try {
        const response = await wallet.contract().at(batchContractAddress)
        setData(response as BatchPaymentContract)
      } catch (e) {
        setError(handleError(e))
      } finally {
        setIsLoading(false)
      }
    }

    perform()
  }, [data, wallet, batchContractAddress])
  return { isLoading, data, batchContractAddress, error }
}
