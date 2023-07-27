import React from 'react'
import { Header, Table, Button } from 'semantic-ui-react'
import { fromTokens, buildTronScanTransactionURL } from '@/lib/blockchain'
import type { GroupPayment } from './payments-list'

interface Props {
  groupPayment: GroupPayment
}

const PaymentInfo = ({ groupPayment }: Props) => {
  const amount = fromTokens(parseFloat(groupPayment.payment_amount.toString()))

  return (
    <Table.Row key={groupPayment.payment_id}>
      <Table.Cell>
        <Header as="h3">
          <Header.Content>
            {groupPayment.recipient_display_name}
            <Header.Subheader>
              Wallet: {groupPayment.payment_recipient}
            </Header.Subheader>
          </Header.Content>
        </Header>
      </Table.Cell>
      <Table.Cell collapsing>{amount}</Table.Cell>
      <Table.Cell collapsing>
        {new Date(groupPayment.payment_date).toLocaleString()}
      </Table.Cell>
      <Table.Cell collapsing textAlign="right">
        <Button
          as="a"
          href={`${buildTronScanTransactionURL(
            groupPayment.payment_transaction
          )}`}
          target="_blank"
          rel="noopener nofollow noreferrer"
          icon="eye"
          title="Transaction"
        />
      </Table.Cell>
    </Table.Row>
  )
}

export default PaymentInfo
