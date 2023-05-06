import React, { useContext } from 'react'
import { Button, Header, Table } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'

export interface CompanyPayment {
  payment_id: string
  payment_transaction: string
  payment_date: string
  payment_amount: number
  payment_recipient: string
  employee_display_name: string
}

interface Props {
  companyPayments: CompanyPayment[]
}

const Component = ({ companyPayments }: Props) => {
  const { buildTronScanTransactionURL } = useContext(Web3Context)

  return (
    <Table size="large">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Employee</Table.HeaderCell>
          <Table.HeaderCell>Amount</Table.HeaderCell>
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {companyPayments.map((companyPayment) => (
          <Table.Row key={companyPayment.payment_id}>
            <Table.Cell>
              <Header as="h3">
                <Header.Content>
                  {companyPayment.employee_display_name}
                  <Header.Subheader>
                    Wallet: {companyPayment.payment_recipient}
                  </Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell collapsing>{companyPayment.payment_amount}</Table.Cell>
            <Table.Cell collapsing>{companyPayment.payment_date}</Table.Cell>
            <Table.Cell collapsing textAlign="right">
              <Button
                as="a"
                href={`${buildTronScanTransactionURL(
                  companyPayment.payment_transaction
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
