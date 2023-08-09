import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import React, { useState, useEffect } from 'react'
import { Header, Table, Button } from 'semantic-ui-react'
import { fromTokens } from '@/lib/blockchain'
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
  const { connected } = useWallet()

  const [isRecipientArchived, setIsRecipientArchived] = useState<boolean>(false)

  useEffect(() => {
    setIsRecipientArchived(!!recipient.archived_at)
  }, [recipient.archived_at])

  const salary = recipient.salary ? fromTokens(+recipient.salary.toString()) : 0

  return (
    <>
      <Table.Row warning={!!recipient.archived_at}>
        <Table.Cell>
          <Header as="h3">
            <Header.Content>
              {recipient.display_name.length > 20
                ? recipient.display_name.substring(0, 20) + '...'
                : recipient.display_name}
              <Header.Subheader>{recipient.comment}</Header.Subheader>
            </Header.Content>
          </Header>
        </Table.Cell>
        <Table.Cell>{recipient.wallet_address}</Table.Cell>
        <Table.Cell>{salary}</Table.Cell>
        <Table.Cell>{isRecipientArchived ? 'Archived' : 'Active'}</Table.Cell>
        <Table.Cell textAlign="right">
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
