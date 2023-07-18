import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import getConfig from 'next/config'
import React, { useState } from 'react'
import { Modal, Message, Button } from 'semantic-ui-react'
import { ErrorMessage, TransactionLoadingMessage } from '@/components'
import api, { APIError } from '@/lib/api'
import { toTokens, buildTronScanTransactionURL } from '@/lib/blockchain'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { useTokenTransfer } from '@/utils/tokens'

const { publicRuntimeConfig } = getConfig()
const { tokenSymbol } = publicRuntimeConfig

export interface PaymentTransactionData {
  recipient: string
  amount: number
}

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  groupId: string
  recipient: RecipientDTO
  payment: PaymentTransactionData
  onTransactionSaved: (_tx: string) => void
}

const Component = ({
  open,
  setOpen,
  groupId,
  recipient,
  payment,
  onTransactionSaved,
}: Props) => {
  const { connected, address } = useWallet()

  const [paymentError, setPaymentError] = useState<string>('')
  const [paymentValidationErrors, setPaymentValidationErrors] = useState<
    string[]
  >([])

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

  const onTransactionReceived = async (tx: string) => {
    if (!recipient) return
    if (!payment) return

    try {
      setPaymentError('')
      setPaymentValidationErrors([])

      const data = JSON.stringify({
        transaction_hash: tx,
        amount: payment.amount,
      })

      await api.addPaymentToRecipient(groupId, recipient.id, data)

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
      <Modal.Header>Send money to {' ' + recipient.display_name}</Modal.Header>
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
            content={`Transfer ${payment.amount} ${tokenSymbol}`}
            disabled={!connected || !address || address === '' || isLoading}
          />
        )}
      </Modal.Content>
    </Modal>
  )
}

export default Component
