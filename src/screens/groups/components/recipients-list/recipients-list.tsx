import React from 'react'
import { Table } from 'semantic-ui-react'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import RecipientInfo from './recipient-info'

interface Props {
  isGroupArchived: boolean
  recipients: RecipientDTO[]
  onPaymentClicked: (_recipient: RecipientDTO) => void
  onEditClicked: (_recipient: RecipientDTO) => void
  onArchiveClicked: (_recipient: RecipientDTO) => void
  onUnarchiveClicked: (_recipient: RecipientDTO) => void
}

const Component = ({
  isGroupArchived,
  recipients,
  onPaymentClicked,
  onEditClicked,
  onArchiveClicked,
  onUnarchiveClicked,
}: Props) => (
  <Table size="large">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Recipient</Table.HeaderCell>
        <Table.HeaderCell>Wallet</Table.HeaderCell>
        <Table.HeaderCell>Salary</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
        <Table.HeaderCell />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {recipients.map((recipient) => (
        <RecipientInfo
          key={recipient.id}
          recipient={recipient}
          isGroupArchived={isGroupArchived}
          onPaymentClicked={onPaymentClicked}
          onEditClicked={onEditClicked}
          onArchiveClicked={onArchiveClicked}
          onUnarchiveClicked={onUnarchiveClicked}
        />
      ))}
    </Table.Body>
  </Table>
)

export default Component
