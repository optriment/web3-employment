import React from 'react'
import { Modal } from 'semantic-ui-react'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { PaymentForm } from '../payment-form'
import type { ValidationSchema as PaymentValidationSchema } from '../payment-form'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  recipient: RecipientDTO
  onPaymentPrepared: (_data: PaymentValidationSchema) => void
}

const Component = ({ recipient, open, setOpen, onPaymentPrepared }: Props) => {
  const onPaymentFormSubmitted = async (data: PaymentValidationSchema) => {
    if (!recipient.wallet_address) return

    onPaymentPrepared(data)
    setOpen(false)
  }

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      size="tiny"
    >
      <Modal.Header>Payment for {recipient.display_name}</Modal.Header>
      <Modal.Content>
        <PaymentForm
          onFormSubmitted={onPaymentFormSubmitted}
          salary={recipient.salary || 0}
        />
      </Modal.Content>
    </Modal>
  )
}

export default Component
