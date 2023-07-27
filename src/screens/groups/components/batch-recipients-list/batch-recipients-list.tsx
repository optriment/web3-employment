import getConfig from 'next/config'
import React from 'react'
import { Checkbox, Table } from 'semantic-ui-react'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import type { SelectedRecipients } from '@/screens/groups/batch-payment-screen'
import BatchRecipientInfo from './batch-recipient-info'

const { publicRuntimeConfig } = getConfig()
const { tokenSymbol } = publicRuntimeConfig

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
    if (selectedRecipients[id]?.amount <= 0) return
    onRowSelect(id)
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
          <Table.HeaderCell collapsing>Amount ({tokenSymbol})</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {recipients.map((recipient) => (
          <BatchRecipientInfo
            key={recipient.id}
            recipient={recipient}
            selectedRecipient={selectedRecipients[recipient.id]}
            handleRowSelect={handleRowSelect}
            handleAmountChange={(id: string, amount: number) =>
              onAmountChange(id, amount)
            }
          />
        ))}
      </Table.Body>
    </Table>
  )
}

export default Component
