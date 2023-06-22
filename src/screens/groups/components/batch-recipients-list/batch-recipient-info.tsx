import React from 'react'
import { Header, Table, Checkbox, Input } from 'semantic-ui-react'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'

interface Props {
  recipient: RecipientDTO
  selectedRecipient: { selected: boolean; amount: number; address: string }
  handleRowSelect: (_id: string) => void
  handleAmountChange: (
    _id: string,
    _event: React.ChangeEvent<HTMLInputElement>
  ) => void
}

const BatchRecipientInfo = ({
  recipient,
  selectedRecipient,
  handleRowSelect,
  handleAmountChange,
}: Props) => (
  <Table.Row warning={!!recipient.archived_at}>
    <Table.Cell>
      <Checkbox
        checked={selectedRecipient?.selected}
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
          selectedRecipient?.amount >= 0
            ? selectedRecipient?.amount
            : recipient.salary
        }
        onChange={(event) => handleAmountChange(recipient.id, event)}
        min={0}
        transparent
      />
    </Table.Cell>
  </Table.Row>
)

export default BatchRecipientInfo
