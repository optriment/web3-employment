import React from 'react'
import { Modal } from 'semantic-ui-react'
import { PaymentForm } from '../payment-form'
import type { ValidationSchema as PaymentValidationSchema } from '../payment-form'
import type { Employee } from '@prisma/client'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  employee: Employee
  onPaymentPrepared: (_data: PaymentValidationSchema) => void
}

const Component = ({ employee, open, setOpen, onPaymentPrepared }: Props) => {
  const onPaymentFormSubmitted = async (data: PaymentValidationSchema) => {
    if (!employee.wallet_address) return

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
      <Modal.Header>Payment for {employee.display_name}</Modal.Header>
      <Modal.Content>
        <PaymentForm
          onFormSubmitted={onPaymentFormSubmitted}
          salary={employee.salary || 0}
        />
      </Modal.Content>
    </Modal>
  )
}

export default Component
