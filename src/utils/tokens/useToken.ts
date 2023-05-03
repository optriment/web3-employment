import { useState, useEffect, useContext } from 'react'
import { Web3Context } from '@/context/web3-context'
import { handleError } from '@/lib/errorHandler'

interface TRC20 {
  balanceOf(_account: string): {
    call: () => Promise<string>
  }
  transfer(
    _recipient: string,
    _amount: number
  ): {
    send: (_args: unknown) => Promise<string>
  }
}

interface Result {
  isLoading: boolean
  data: TRC20 | null
  error: string
}

export const useToken = (): Result => {
  const { wallet, tokenAddress } = useContext(Web3Context)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [data, setData] = useState<TRC20 | null>(null)

  useEffect(() => {
    if (!wallet) return
    if (!tokenAddress) return
    if (data) return

    const perform = async () => {
      setError('')
      setIsLoading(true)

      try {
        const response = await wallet.contract().at(tokenAddress)

        setData(response as TRC20)
      } catch (e) {
        setError(handleError(e))
      } finally {
        setIsLoading(false)
      }
    }

    perform()
  }, [data, wallet, tokenAddress])

  return { isLoading, data, error }
}
