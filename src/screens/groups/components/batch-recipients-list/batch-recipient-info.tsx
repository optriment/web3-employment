import React, { useState } from 'react'
import { Header, Table, Checkbox, Input } from 'semantic-ui-react'
import { fromTokens } from '@/lib/blockchain'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'

interface Props {
  recipient: RecipientDTO
  selectedRecipient: { selected: boolean; amount: number; address: string }
  handleRowSelect: (_id: string) => void
  handleAmountChange: (_id: string, _amount: number) => void
}

const BatchRecipientInfo = ({
  recipient,
  selectedRecipient,
  handleRowSelect,
  handleAmountChange,
}: Props) => {
  // FIXME: We should refactor this code to make it more readable and secure
  const defaultAmount =
    selectedRecipient && selectedRecipient.amount > 0
      ? selectedRecipient.amount
      : recipient.salary && recipient.salary > 0
      ? fromTokens(recipient.salary)
      : 0

  const [amount, setAmount] = useState<string>(defaultAmount.toString())

  const onAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value)

    handleAmountChange(recipient.id, parseFloat(event.target.value))
  }

  return (
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
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event)}
          maxLength={13}
        />
      </Table.Cell>
    </Table.Row>
  )
}

export default BatchRecipientInfo
