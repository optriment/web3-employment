import React from 'react'
import { Table } from 'semantic-ui-react'
import PaymentInfo from './payment-info'

export interface GroupPayment {
  payment_id: string
  payment_transaction: string
  payment_date: string
  payment_amount: number
  payment_recipient: string
  recipient_display_name: string
}

interface Props {
  groupPayments: GroupPayment[]
}

const Component = ({ groupPayments }: Props) => (
  <Table size="large">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Recipient</Table.HeaderCell>
        <Table.HeaderCell>Amount</Table.HeaderCell>
        <Table.HeaderCell>Date</Table.HeaderCell>
        <Table.HeaderCell />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {groupPayments.map((groupPayment) => (
        <PaymentInfo
          key={groupPayment.payment_id}
          groupPayment={groupPayment}
        />
      ))}
    </Table.Body>
  </Table>
)

export default Component
