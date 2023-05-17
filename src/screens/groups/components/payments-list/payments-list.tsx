import React, { useContext } from 'react'
import { Button, Header, Table } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'

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

const Component = ({ groupPayments }: Props) => {
  const { buildTronScanTransactionURL } = useContext(Web3Context)

  return (
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
            <Table.Cell collapsing>{groupPayment.payment_amount}</Table.Cell>
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
        ))}
      </Table.Body>
    </Table>
  )
}

export default Component
