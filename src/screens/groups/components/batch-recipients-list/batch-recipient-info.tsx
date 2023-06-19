import React from 'react'
import { Header, Table, Checkbox, Input } from 'semantic-ui-react'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import type { SelectedRecipients } from '@/screens/groups/batch-payment-screen'

interface Props {
  recipient: RecipientDTO
  selectedRecipients: SelectedRecipients
  handleRowSelect: (_id: string) => void
  handleAmountChange: (
    _id: string,
    _event: React.ChangeEvent<HTMLInputElement>
  ) => void
}

const BatchRecipientInfo = ({
  recipient,
  selectedRecipients,
  handleRowSelect,
  handleAmountChange,
}: Props) => (
  <>
    <Table.Row warning={!!recipient.archived_at}>
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
  </>
)

export default BatchRecipientInfo
