import React, { useContext, useState } from 'react'
import { Message, Grid, Button } from 'semantic-ui-react'
import { ErrorMessage, TransactionLoadingMessage } from '@/components'
import { Web3Context } from '@/context/web3-context'
import { useTokenTransfer } from '@/utils/tokens'
import { useIsMobile } from '@/utils/use-is-mobile'

export interface PaymentTransactionData {
  recipient: string
  amount: number
}

type Props = {
  onTransactionReceived: (_tx: string) => void
  payment: PaymentTransactionData
}

const Component = ({ payment, onTransactionReceived }: Props) => {
  const isMobile = useIsMobile()

  const { tokenSymbol, toTokens, buildTronScanTransactionURL } =
    useContext(Web3Context)
  const [enabled, setEnabled] = useState<boolean>(false)

  const [transaction, setTransaction] = useState<string>('')

  const { isLoading, error } = useTokenTransfer({
    enabled: enabled,
    data: {
      recipient: payment.recipient,
      amount: toTokens(payment.amount),
    },
    onSuccess: (tx: string) => {
      setTransaction(tx)
      onTransactionReceived(tx)
      setEnabled(false)
    },
    onError: () => {
      setEnabled(false)
    },
  })

  return (
    <Grid container={!isMobile} columns={1}>
      <Grid.Column>
        {isLoading && <TransactionLoadingMessage />}

        {error && (
          <ErrorMessage header="Unable to process a payment" content={error} />
        )}

        {transaction ? (
          <Message positive size="big">
            <Message.Header>Success!</Message.Header>

            <p>
              <a
                href={buildTronScanTransactionURL(transaction)}
                target="_blank"
                rel="nofollow noreferrer noopener"
              >
                Open transaction
              </a>
            </p>
          </Message>
        ) : (
          <Button
            primary
            size="huge"
            onClick={() => setEnabled(true)}
            content={`Transfer ${payment.amount} ${tokenSymbol}`}
            disabled={isLoading}
          />
        )}
      </Grid.Column>
    </Grid>
  )
}

export default Component
