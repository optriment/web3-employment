import React, { useContext, useState } from 'react'
import { Modal, Message, Button } from 'semantic-ui-react'
import { ErrorMessage, TransactionLoadingMessage } from '@/components'
import { Web3Context } from '@/context/web3-context'
import { useBatchTransfer } from '@/utils/batchTransfer'

export interface PaymentTransactionData {
  recipients: string[]
  amounts: number[]
  totalAmount: number
}

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  groupId: string
  groupName: string
  payment: PaymentTransactionData
  onTransactionSaved: (_tx: string) => void
}

const Component = ({
  open,
  setOpen,
  groupName,
  payment,
  onTransactionSaved,
}: Props) => {
  const [paymentError, setPaymentError] = useState<string>('')
  const [enabled, setEnabled] = useState<boolean>(false)
  const [transaction, setTransaction] = useState<string>('')

  const { tokenSymbol, toTokens, buildTronScanTransactionURL } =
    useContext(Web3Context)

  const { isLoading, error } = useBatchTransfer({
    enabled: enabled,
    onSuccess: (tx: string) => {
      setTransaction(tx)
      onTransactionReceived(tx)
      setEnabled(false)
    },
    onError: () => {
      setEnabled(false)
    },
    data: {
      totalAmount: toTokens(payment.totalAmount),
      recipients: payment.recipients,
      amounts: payment.amounts.map((amount) => toTokens(amount)),
    },
  })

  const onTransactionReceived = async (tx: string) => {
    if (!payment) return

    try {
      onTransactionSaved(tx)
    } catch (e) {
      setPaymentError(`${e}`)
    }
  }

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      size="tiny"
    >
      <Modal.Header>Send money to {' ' + groupName}</Modal.Header>
      <Modal.Content>
        {paymentError && (
          <Message error size="big">
            <Message.Header content="Unable to create payment" />
            <p>{paymentError}</p>
          </Message>
        )}

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
            content={`Transfer ${payment.totalAmount} ${tokenSymbol}`}
            disabled={isLoading}
          />
        )}
      </Modal.Content>
    </Modal>
  )
}

export default Component
