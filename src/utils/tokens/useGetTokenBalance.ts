import { useState, useEffect, useContext } from 'react'
import { Web3Context } from '@/context/web3-context'
import { handleError } from '@/lib/errorHandler'
import { useToken } from './useToken'

interface Result {
  isLoading: boolean
  data: number | null
  error: string
}

export const useGetTokenBalance = (): Result => {
  const { address } = useContext(Web3Context)
  const { data: token, isLoading: tokenLoading, error: tokenError } = useToken()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [data, setData] = useState<number | null>(null)

  useEffect(() => {
    if (tokenError) {
      setError(tokenError)
    }
  }, [tokenError])

  useEffect(() => {
    if (!token) return
    if (!address) return

    const perform = async () => {
      setError('')
      setIsLoading(true)

      try {
        const response = await token.balanceOf(address).call()

        setData(+response)
      } catch (e) {
        setError(handleError(e))
      } finally {
        setIsLoading(false)
      }
    }

    perform()
  }, [token, address])

  return { isLoading: tokenLoading || isLoading, data, error }
}
