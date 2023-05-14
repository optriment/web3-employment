import React, { useContext, useState } from 'react'
import { Modal, Message, Button } from 'semantic-ui-react'
import { ErrorMessage, TransactionLoadingMessage } from '@/components'
import { Web3Context } from '@/context/web3-context'
import api, { APIError } from '@/lib/api'
import { useTokenTransfer } from '@/utils/tokens'
import type { Employee } from '@prisma/client'

export interface PaymentTransactionData {
  recipient: string
  amount: number
}

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  companyId: string
  employee: Employee
  payment: PaymentTransactionData
  onTransactionSaved: (_tx: string) => void
}

const Component = ({
  open,
  setOpen,
  companyId,
  employee,
  payment,
  onTransactionSaved,
}: Props) => {
  const [paymentError, setPaymentError] = useState<string>('')
  const [paymentValidationErrors, setPaymentValidationErrors] = useState<
    string[]
  >([])

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

  const onTransactionReceived = async (tx: string) => {
    if (!employee) return
    if (!payment) return

    try {
      setPaymentError('')
      setPaymentValidationErrors([])

      const data = JSON.stringify({
        transaction_hash: tx,
        amount: payment.amount,
      })

      await api.addPaymentToEmployee(companyId, employee.id, data)

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
      <Modal.Header>Send money to {' ' + employee.display_name}</Modal.Header>
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
            disabled={isLoading}
          />
        )}
      </Modal.Content>
    </Modal>
  )
}

export default Component
