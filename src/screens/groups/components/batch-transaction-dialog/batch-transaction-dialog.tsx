import getConfig from 'next/config'
import React, { useState } from 'react'
import { Modal, Message, Button } from 'semantic-ui-react'
import { ErrorMessage, TransactionLoadingMessage } from '@/components'
import api, { APIError } from '@/lib/api'
import { toTokens, buildTronScanTransactionURL } from '@/lib/blockchain'
import { useBatchTransfer } from '@/utils/batchTransfer'
import type { BatchPaymentRecipient } from '../../batch-payment-screen'

const { publicRuntimeConfig } = getConfig()
const { tokenSymbol } = publicRuntimeConfig

export interface BatchPaymentTransactionData {
  recipients: BatchPaymentRecipient[]
  totalAmount: number
}

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  groupId: string
  groupName: string
  payment: BatchPaymentTransactionData
  onTransactionSaved: (_tx: string) => void
}

const Component = ({
  open,
  setOpen,
  groupId,
  groupName,
  payment,
  onTransactionSaved,
}: Props) => {
  const [paymentError, setPaymentError] = useState<string>('')
  const [paymentValidationErrors, setPaymentValidationErrors] = useState<
    string[]
  >([])
  const [enabled, setEnabled] = useState<boolean>(false)
  const [transaction, setTransaction] = useState<string>('')

  const recipientAddresses = payment.recipients.map(
    (recipient) => recipient.wallet_address
  )

  const recipientAmountsInTokens = payment.recipients.map((recipient) =>
    toTokens(recipient.payment_amount)
  )

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
      recipients: recipientAddresses,
      amounts: recipientAmountsInTokens,
    },
  })

  const onTransactionReceived = async (tx: string) => {
    if (!payment) return

    try {
      setPaymentError('')
      setPaymentValidationErrors([])

      const data = JSON.stringify({
        transaction_hash: tx,
        recipients: payment.recipients,
      })

      await api.addBatchPayment(groupId, data)

      onTransactionSaved(tx)
    } catch (e) {
      if (e instanceof APIError) {
        setPaymentError(e.message)
        setPaymentValidationErrors(e.validationErrors)
      } else {
        setPaymentError(`${e}`)
      }
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
      <Modal.Header>Send money to {groupName}</Modal.Header>
      <Modal.Content>
        {paymentError && (
          <Message error size="big">
            <Message.Header content="Unable to create payment" />
            <p>{paymentError}</p>
          </Message>
        )}

        {paymentValidationErrors.length > 0 && (
          <Message
            error
            size="big"
            header="Validation errors"
            list={paymentValidationErrors}
          />
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
