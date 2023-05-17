import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Message, Grid, Header } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import api, { APIError } from '@/lib/api'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import type { GroupPayments } from '@/pages/api/groups/[id]/payments'
import { useIsMobile } from '@/utils/use-is-mobile'
import { PaymentsList } from './components/payments-list'
import type { GroupPayment } from './components/payments-list'

interface Props {
  groupId: string
}

const Screen = ({ groupId }: Props) => {
  const isMobile = useIsMobile()

  const [group, setGroup] = useState<GroupDTO | null>(null)
  const [groupPayments, setGroupPayments] = useState<GroupPayment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!groupId) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const _groupPayments = await api.getGroupPayments(groupId)

        if (!_groupPayments.data) {
          throw new Error('There is no data in API response')
        }

        const data = _groupPayments.data as GroupPayments

        setGroup(_groupPayments.data.group)

        const payments: GroupPayment[] = []

        data.payments.forEach((payment) => {
          const recipient = data.recipients.find(
            (e) => e.id === payment.recipient_id
          )

          payments.push({
            payment_id: payment.id,
            payment_transaction: payment.transaction_hash,
            payment_date: payment.created_at.toLocaleString(),
            payment_amount: payment.amount,
            payment_recipient: payment.wallet_address,
            recipient_display_name: recipient?.display_name || '',
          })
        })

        setGroupPayments(payments)
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
            <LoadingMessage content="Loading payments..." />
          </Grid.Column>
        )}

        {error && (
          <Grid.Column>
            <ErrorMessage header="Unable to load payments" content={error} />
          </Grid.Column>
        )}

        {group && (
          <Grid.Column>
            <Header as="h1">
              Payments for{' '}
              <Link href={`/groups/${group.id}`}>{group.display_name}</Link>
            </Header>
          </Grid.Column>
        )}

        <Grid.Column>
          {groupPayments.length > 0 ? (
            <PaymentsList groupPayments={groupPayments} />
          ) : (
            <Message warning>
              <p>No payments for this group yet.</p>
            </Message>
          )}
        </Grid.Column>
      </Grid>
    </>
  )
}

export default Screen
