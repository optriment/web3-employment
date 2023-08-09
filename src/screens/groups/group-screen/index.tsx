import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Button, Message, Grid } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import api, { APIError } from '@/lib/api'
import { toTokens } from '@/lib/blockchain'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import type { GroupWithRecipients } from '@/pages/api/groups/[id]'
import { useIsMobile } from '@/utils/use-is-mobile'
import { AddRecipientDialog } from '../components/add-recipient-dialog'
import { EditRecipientDialog } from '../components/edit-recipient-dialog'
import { ImportRecipientsDialog } from '../components/import-recipients-dialog'
import { PreparePaymentDialog } from '../components/prepare-payment-dialog'
import { RecipientsList } from '../components/recipients-list'
import { TransactionDialog } from '../components/transaction-dialog'
import { TransactionInfoDialog } from '../components/transaction-info-dialog'
import { GroupHeader } from './group-header'
import type { ValidationSchema as PaymentValidationSchema } from '../components/payment-form'
import type { PaymentTransactionData } from '../components/transaction-dialog'

interface Props {
  groupId: string
}

const Screen = ({ groupId }: Props) => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const { connected } = useWallet()

  const [data, setData] = useState<GroupWithRecipients | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const [importRecipientsDialogOpen, setImportRecipientsDialogOpen] =
    useState<boolean>(false)

  const [newRecipientDialogOpen, setNewRecipientDialogOpen] =
    useState<boolean>(false)

  const [recipientToEdit, setRecipientToEdit] = useState<RecipientDTO | null>(
    null
  )
  const [editRecipientDialogOpen, setEditRecipientDialogOpen] =
    useState<boolean>(false)

  const [preparePaymentDialogOpen, setPreparePaymentDialogOpen] =
    useState<boolean>(false)
  const [recipientToPay, setRecipientToPay] = useState<RecipientDTO | null>(
    null
  )

  const [transactionDialogOpen, setTransactionDialogOpen] =
    useState<boolean>(false)
  const [paymentTransactionData, setPaymentTransactionData] =
    useState<PaymentTransactionData | null>(null)

  const [transactionInfoDialogOpen, setTransactionInfoDialogOpen] =
    useState<boolean>(false)

  const [isGroupArchived, setIsGroupArchived] = useState<boolean>(false)
  const [groupArchiveError, setGroupArchiveError] = useState<string>('')
  const [groupUnarchiveError, setGroupUnarchiveError] = useState<string>('')

  const [recipientArchiveError, setRecipientArchiveError] = useState<string>('')
  const [recipientUnarchiveError, setRecipientUnarchiveError] =
    useState<string>('')

  const [transaction, setTransaction] = useState<string>('')

  const onRecipientCreated = () => {
    router.reload()
  }

  const onRecipientUpdated = () => {
    router.reload()
  }

  const onTransactionSaved = (tx: string) => {
    setRecipientToPay(null)
    setPaymentTransactionData(null)
    setTransaction(tx)
    setTransactionInfoDialogOpen(true)
  }

  const onEditClicked = (recipient: RecipientDTO) => {
    setRecipientToEdit(recipient)
    setEditRecipientDialogOpen(true)
  }

  const onPaymentClicked = (recipient: RecipientDTO) => {
    setRecipientToPay(recipient)
    setPreparePaymentDialogOpen(true)
  }

  const onPaymentPrepared = async (data: PaymentValidationSchema) => {
    if (!recipientToPay?.wallet_address) return

    setPaymentTransactionData({
      amount: toTokens(data.amount),
      recipient: recipientToPay.wallet_address,
    })
    setPreparePaymentDialogOpen(false)
    setTransactionDialogOpen(true)
  }

  const onRecipientsImported = () => {
    router.reload()
  }

  const handleGroupArchive = async () => {
    try {
      setGroupArchiveError('')

      await api.archiveGroup(groupId)

      router.reload()
    } catch (e) {
      if (e instanceof APIError) {
        setGroupArchiveError(e.message)
      } else {
        setGroupArchiveError(`${e}`)
      }
    }
  }

  const handleGroupUnarchive = async () => {
    try {
      setGroupUnarchiveError('')

      await api.unarchiveGroup(groupId)

      router.reload()
    } catch (e) {
      if (e instanceof APIError) {
        setGroupUnarchiveError(e.message)
      } else {
        setGroupUnarchiveError(`${error}`)
      }
    }
  }

  const handleRecipientArchive = async (recipient: RecipientDTO) => {
    try {
      setRecipientArchiveError('')

      await api.archiveRecipient(groupId, recipient.id)

      router.reload()
    } catch (e) {
      if (e instanceof APIError) {
        setRecipientArchiveError(e.message)
      } else {
        setRecipientArchiveError(`${e}`)
      }
    }
  }

  const handleRecipientUnarchive = async (recipient: RecipientDTO) => {
    try {
      setRecipientUnarchiveError('')

      await api.unarchiveRecipient(groupId, recipient.id)

      router.reload()
    } catch (e) {
      if (e instanceof APIError) {
        setRecipientUnarchiveError(e.message)
      } else {
        setRecipientUnarchiveError(`${e}`)
      }
    }
  }

  useEffect(() => {
    if (!groupId) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const group = await api.getGroupById(groupId)

        setData(group.data)
        setIsGroupArchived(!!group.data?.group?.archived_at)
      } catch (e) {
        if (e instanceof APIError) {
          setError(e.message)
        } else {
          setError(`${e}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [groupId])

  return (
    <>
      <Grid stackable={isMobile} container={!isMobile} columns={1}>
        {isLoading && (
          <Grid.Column>
            <LoadingMessage content="Loading group with recipients..." />
          </Grid.Column>
        )}

        {error && (
          <Grid.Column>
            <ErrorMessage header="Unable to load group" content={error} />
          </Grid.Column>
        )}

        {groupArchiveError && (
          <Grid.Column>
            <ErrorMessage
              header="Unable to archive group"
              content={groupArchiveError}
            />
          </Grid.Column>
        )}

        {groupUnarchiveError && (
          <Grid.Column>
            <ErrorMessage
              header="Unable to unarchive group"
              content={groupUnarchiveError}
            />
          </Grid.Column>
        )}

        {recipientArchiveError && (
          <Grid.Column>
            <ErrorMessage
              header="Unable to archive recipient"
              content={recipientArchiveError}
            />
          </Grid.Column>
        )}

        {recipientUnarchiveError && (
          <Grid.Column>
            <ErrorMessage
              header="Unable to unarchive recipient"
              content={recipientUnarchiveError}
            />
          </Grid.Column>
        )}

        {data && (
          <>
            <Grid.Column>
              <GroupHeader group={data.group} />
            </Grid.Column>

            <Grid.Column textAlign="right">
              <Button
                size={isMobile ? 'medium' : 'large'}
                icon="plus"
                content="Recipient"
                primary
                onClick={() => setNewRecipientDialogOpen(true)}
                disabled={!!isGroupArchived}
              />

              <Button
                size={isMobile ? 'medium' : 'large'}
                icon="plus"
                content="Batch"
                primary
                as="a"
                href={`/groups/${data.group.id}/batch`}
                disabled={!!isGroupArchived}
              />

              <Button
                size={isMobile ? 'medium' : 'large'}
                icon="upload"
                content="Import"
                onClick={() => setImportRecipientsDialogOpen(true)}
              />

              <Button
                size={isMobile ? 'medium' : 'large'}
                icon="download"
                content="Export"
                as="a"
                href={`/api/groups/${groupId}/export`}
              />

              <Button
                size={isMobile ? 'medium' : 'large'}
                icon="money"
                content="Payments"
                as="a"
                href={`/groups/${data.group.id}/payments`}
              />

              {isGroupArchived ? (
                <Button
                  size={isMobile ? 'medium' : 'large'}
                  icon="undo"
                  onClick={handleGroupUnarchive}
                  title="Unarchive"
                />
              ) : (
                <Button
                  size={isMobile ? 'medium' : 'large'}
                  icon="archive"
                  onClick={handleGroupArchive}
                  title="Archive"
                />
              )}
            </Grid.Column>

            {!connected && (
              <Grid.Column>
                <Message warning size="large">
                  <Message.Header>Payments are not available</Message.Header>

                  <p>Please connect wallet to make payments</p>
                </Message>
              </Grid.Column>
            )}

            <Grid.Column>
              {data.recipients.length > 0 ? (
                <RecipientsList
                  isGroupArchived={!!isGroupArchived}
                  recipients={data.recipients}
                  onPaymentClicked={(recipient: RecipientDTO) =>
                    onPaymentClicked(recipient)
                  }
                  onEditClicked={(recipient: RecipientDTO) =>
                    onEditClicked(recipient)
                  }
                  onArchiveClicked={(recipient: RecipientDTO) =>
                    handleRecipientArchive(recipient)
                  }
                  onUnarchiveClicked={(recipient: RecipientDTO) =>
                    handleRecipientUnarchive(recipient)
                  }
                />
              ) : (
                <Message warning>
                  <p>No recipients in this group yet.</p>
                </Message>
              )}
            </Grid.Column>
          </>
        )}
      </Grid>

      <ImportRecipientsDialog
        open={importRecipientsDialogOpen}
        setOpen={setImportRecipientsDialogOpen}
        groupId={groupId}
        onRecipientsImported={onRecipientsImported}
      />

      {data && (
        <>
          <AddRecipientDialog
            open={newRecipientDialogOpen}
            setOpen={setNewRecipientDialogOpen}
            groupId={groupId}
            onRecipientCreated={onRecipientCreated}
          />

          {recipientToEdit && (
            <EditRecipientDialog
              open={editRecipientDialogOpen}
              setOpen={setEditRecipientDialogOpen}
              groupId={groupId}
              recipient={recipientToEdit}
              onRecipientUpdated={onRecipientUpdated}
            />
          )}

          {recipientToPay && (
            <>
              <PreparePaymentDialog
                open={preparePaymentDialogOpen}
                setOpen={setPreparePaymentDialogOpen}
                recipient={recipientToPay}
                onPaymentPrepared={onPaymentPrepared}
              />

              {paymentTransactionData !== null && (
                <TransactionDialog
                  open={transactionDialogOpen}
                  setOpen={setTransactionDialogOpen}
                  groupId={groupId}
                  recipient={recipientToPay}
                  payment={paymentTransactionData}
                  onTransactionSaved={onTransactionSaved}
                />
              )}
            </>
          )}

          {transaction && (
            <TransactionInfoDialog
              open={transactionInfoDialogOpen}
              setOpen={setTransactionInfoDialogOpen}
              onClose={() => setTransaction('')}
              tx={transaction}
            />
          )}
        </>
      )}
    </>
  )
}

export default Screen
