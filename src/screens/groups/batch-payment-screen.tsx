import Link from 'next/link'
import React, { useState, useEffect, useContext } from 'react'
import { Message, Grid, Header, Button } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import { Web3Context } from '@/context/web3-context'
import api, { APIError } from '@/lib/api'
import type { GroupWithRecipients } from '@/pages/api/groups/[id]'
import { useIsMobile } from '@/utils/use-is-mobile'
import { BatchRecipientsList } from './components/batch-recipients-list'
import { BatchTransactionDialog } from './components/batch-transaction-dialog'
import { TransactionInfoDialog } from './components/transaction-info-dialog'
import type { BatchPaymentTransactionData } from './components/batch-transaction-dialog'

interface Props {
  groupId: string
}
export interface SelectedRecipients {
  [key: string]: { selected: boolean; amount: number; address: string }
}

const Screen = ({ groupId }: Props) => {
  const isMobile = useIsMobile()
  const { connected } = useContext(Web3Context)

  const [data, setData] = useState<GroupWithRecipients | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [selectedRecipients, setSelectedRecipients] =
    useState<SelectedRecipients>({})
  const [transaction, setTransaction] = useState<string>('')
  const [paymentTransactionData, setPaymentTransactionData] =
    useState<BatchPaymentTransactionData | null>(null)

  const [transactionDialogOpen, setTransactionDialogOpen] =
    useState<boolean>(false)
  const [transactionInfoDialogOpen, setTransactionInfoDialogOpen] =
    useState<boolean>(false)

  const handleRowSelect = (id: string) => {
    setSelectedRecipients((prevState) => ({
      ...prevState,
      [id]: {
        selected: !prevState[id]?.selected,
        amount: prevState[id]?.amount,
        address: prevState[id]?.address,
      },
    }))
  }

  const handleSelectAll = () => {
    const allIds = data?.recipients.map((recipient) => recipient.id)
    const areAllSelected = allIds?.every(
      (id) => selectedRecipients[id]?.selected
    )

    const newSelectedRecipients: SelectedRecipients = {}

    allIds?.forEach((id) => {
      const amount = selectedRecipients[id]?.amount
      if (amount !== 0) {
        newSelectedRecipients[id] = {
          selected: !areAllSelected,
          amount: selectedRecipients[id]?.amount,
          address: selectedRecipients[id]?.address,
        }
      } else {
        newSelectedRecipients[id] = {
          selected: selectedRecipients[id]?.selected,
          amount: selectedRecipients[id]?.amount,
          address: selectedRecipients[id]?.address,
        }
      }
    })

    setSelectedRecipients(newSelectedRecipients)
  }

  const handleAmountChange = (id: string, amount: number) => {
    setSelectedRecipients((prevState) => ({
      ...prevState,
      [id]: {
        selected: prevState[id]?.selected && amount !== 0,
        amount: amount,
        address: prevState[id]?.address,
      },
    }))
  }

  const isSelectAllChecked =
    Object.values(selectedRecipients).filter((recipient) => recipient.selected)
      .length === data?.recipients.length

  const onSendPaymentClicked = () => {
    const recipients: string[] = []
    const amounts: number[] = []

    let totalAmount = 0
    Object.entries(selectedRecipients).forEach(([, recipient]) => {
      if (recipient.selected && recipient.amount > 0) {
        recipients.push(recipient.address)
        amounts.push(recipient.amount)
        totalAmount += recipient.amount
      }
    })

    setPaymentTransactionData({
      recipients: recipients,
      amounts: amounts,
      totalAmount: totalAmount,
    })
    setTransactionDialogOpen(true)
  }

  const onTransactionSaved = (tx: string) => {
    setPaymentTransactionData(null)
    setTransaction(tx)
    setTransactionInfoDialogOpen(true)
  }

  useEffect(() => {
    if (!groupId) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const group = await api.getGroupById(groupId)

        setData(group.data)
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

  useEffect(() => {
    if (data && data.recipients) {
      const initialSelectedRecipients: SelectedRecipients = {}

      data.recipients.forEach((recipient) => {
        initialSelectedRecipients[recipient.id] = {
          selected: false,
          amount: recipient.salary ? recipient.salary : 0,
          address: recipient.wallet_address ? recipient.wallet_address : '',
        }
      })

      setSelectedRecipients(initialSelectedRecipients)
    }
  }, [data])

  useEffect(() => {
    const newTotalAmount = Object.values(selectedRecipients).reduce(
      (total, recipient) => {
        if (recipient.selected) {
          return total + recipient.amount
        }

        return total
      },
      0
    )
    setTotalAmount(newTotalAmount)
  }, [selectedRecipients])

  return (
    <>
      <Grid stackable={isMobile} container={!isMobile} columns={1}>
        {isLoading && (
          <Grid.Column>
            <LoadingMessage content="Loading recipients" />
          </Grid.Column>
        )}

        {error && (
          <Grid.Column>
            <ErrorMessage header="Unable to load recipients" content={error} />
          </Grid.Column>
        )}

        {data && (
          <Grid.Row columns={isMobile ? 1 : 2}>
            <Grid.Column width={8}>
              <Header as="h1">
                Pay to{' '}
                <Link href={`/groups/${groupId}`}>
                  {data.group.display_name}
                </Link>
              </Header>
            </Grid.Column>

            <Grid.Column width={8} textAlign={isMobile ? 'center' : 'right'}>
              <Button
                positive
                size="medium"
                onClick={onSendPaymentClicked}
                disabled={
                  Object.values(selectedRecipients).filter(
                    (recipient) => recipient.selected
                  ).length === 0
                }
              >
                Send Payments ({totalAmount.toFixed(2)} USDT)
              </Button>
            </Grid.Column>
          </Grid.Row>
        )}

        {data && (
          <>
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
                <BatchRecipientsList
                  recipients={data.recipients}
                  selectedRecipients={selectedRecipients}
                  onRowSelect={handleRowSelect}
                  onAmountChange={handleAmountChange}
                  onSelectAll={handleSelectAll}
                  isSelectAllChecked={isSelectAllChecked}
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

      {data && (
        <>
          {paymentTransactionData !== null && (
            <BatchTransactionDialog
              open={transactionDialogOpen}
              setOpen={setTransactionDialogOpen}
              groupId={groupId}
              groupName={data.group.display_name}
              payment={paymentTransactionData}
              onTransactionSaved={onTransactionSaved}
            />
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
