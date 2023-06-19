import React from 'react'
import { Checkbox, Header, Input, Table } from 'semantic-ui-react'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import type { SelectedRecipients } from '@/screens/groups/batch-payment-screen'

interface Props {
  recipients: RecipientDTO[]
  selectedRecipients: SelectedRecipients
  onRowSelect: (_id: string) => void
  onAmountChange: (_id: string, _amount: number) => void
  onSelectAll: () => void
  isSelectAllChecked: boolean
}

const Component = ({
  recipients,
  selectedRecipients,
  onRowSelect,
  onAmountChange,
  onSelectAll,
  isSelectAllChecked,
}: Props) => {
  const handleRowSelect = (id: string) => {
    const selectedAmount = selectedRecipients[id]?.amount
    if (selectedAmount === 0) return
    onRowSelect(id)
  }

  const handleAmountChange = (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const amount = event.target.value ? parseFloat(event.target.value) : null
    const finalAmount = amount !== null ? amount : 0
    onAmountChange(id, finalAmount)
  }

  return (
    <Table size="large" celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell collapsing>
            <Checkbox checked={isSelectAllChecked} onChange={onSelectAll} />
          </Table.HeaderCell>
          <Table.HeaderCell>Recipient</Table.HeaderCell>
          <Table.HeaderCell>Wallet</Table.HeaderCell>
          <Table.HeaderCell collapsing>Amount (USDT)</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {recipients.map((recipient) => (
          <Table.Row warning={!!recipient.archived_at} key={recipient.id}>
            <Table.Cell>
              <Checkbox
                checked={selectedRecipients[recipient.id]?.selected}
                onChange={() => handleRowSelect(recipient.id)}
              />
            </Table.Cell>
            <Table.Cell>
              <Header as="h3">
                <Header.Content>
                  {recipient.display_name}
                  <Header.Subheader>{recipient.comment}</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>{recipient.wallet_address}</Table.Cell>
            <Table.Cell textAlign="center">
              <Input
                type="number"
                value={
                  selectedRecipients[recipient.id]?.amount !== undefined
                    ? selectedRecipients[recipient.id]?.amount
                    : recipient.salary
                }
                onChange={(event) => handleAmountChange(recipient.id, event)}
                min={0}
                transparent
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default Component
