import React, { useState, useContext, useEffect } from 'react'
import { Header, Table, Button } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'

interface Props {
  isGroupArchived: boolean
  recipient: RecipientDTO
  onPaymentClicked: (_recipient: RecipientDTO) => void
  onEditClicked: (_recipient: RecipientDTO) => void
  onArchiveClicked: (_recipient: RecipientDTO) => void
  onUnarchiveClicked: (_recipient: RecipientDTO) => void
}

const RecipientInfo = ({
  isGroupArchived,
  recipient,
  onPaymentClicked,
  onEditClicked,
  onArchiveClicked,
  onUnarchiveClicked,
}: Props) => {
  const { connected } = useContext(Web3Context)

  const [isRecipientArchived, setIsRecipientArchived] = useState<boolean>(false)

  useEffect(() => {
    setIsRecipientArchived(!!recipient.archived_at)
  }, [recipient.archived_at])

  return (
    <>
      <Table.Row warning={!!recipient.archived_at}>
        <Table.Cell>
          <Header as="h3">
            <Header.Content>
              {recipient.display_name}
              <Header.Subheader>{recipient.comment}</Header.Subheader>
            </Header.Content>
          </Header>
        </Table.Cell>
        <Table.Cell collapsing>{recipient.wallet_address}</Table.Cell>
        <Table.Cell collapsing>{recipient.salary}</Table.Cell>
        <Table.Cell collapsing>
          {isRecipientArchived ? 'Archived' : 'Active'}
        </Table.Cell>
        <Table.Cell collapsing textAlign="right">
          <Button
            positive
            icon="dollar"
            content="Pay"
            disabled={
              !connected ||
              !!isGroupArchived ||
              !recipient.wallet_address ||
              isRecipientArchived
            }
            onClick={() => onPaymentClicked(recipient)}
          />
          <Button
            icon="pencil"
            disabled={!!isGroupArchived}
            onClick={() => onEditClicked(recipient)}
          />

          {isRecipientArchived ? (
            <Button
              icon="undo"
              disabled={!!isGroupArchived}
              onClick={() => onUnarchiveClicked(recipient)}
              title="Unarchive"
            />
          ) : (
            <Button
              icon="archive"
              disabled={!!isGroupArchived}
              onClick={() => onArchiveClicked(recipient)}
              title="Archive"
            />
          )}
        </Table.Cell>
      </Table.Row>
    </>
  )
}

export default RecipientInfo
