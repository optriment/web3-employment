function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface Props {
  tx: string
  onSuccess: () => void
  onError: (_error: string) => void
}

const MAX_ATTEMPTS = 10
const DELAY_BETWEEN_ATTEMPTS_IN_MS = 5000

export const pollBlockchainResponse = async ({
  tx,
  onSuccess,
  onError,
}: Props) => {
  for (let idx = 0; idx < MAX_ATTEMPTS; idx++) {
    console.log('Attempt: ' + idx)
    const response = await fetch('/api/tx?id=' + tx, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      method: 'POST',
    })

    const json = await response.json()
    console.log({ json })

    switch (json?.status) {
      case 'retry': {
        console.log('--- RETRY ---')
        await delay(DELAY_BETWEEN_ATTEMPTS_IN_MS)
        continue
      }
      case 'success': {
        console.log('--- SUCCESS ---')
        onSuccess()
        return
      }
      case 'reverted': {
        console.log('--- REVERT ---')
        onError(json.error_message)
        return
      }
      case 'error': {
        console.log('--- ERROR ---')
        onError(json.error_message)
        return
      }
      default: {
        throw new Error(`Unexpected JSON response: ${JSON.stringify(json)}`)
      }
    }
  }

  throw new Error('Transaction not found')
}
