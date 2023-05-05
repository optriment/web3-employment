import React, { useState, useEffect } from 'react'
import { Message, Grid, Header } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import type {
  CompanyPayments,
  CompanyPaymentsApiResponse,
} from '@/pages/api/companies/[id]/payments'
import { useIsMobile } from '@/utils/use-is-mobile'
import { PaymentsList } from './components/payments-list'
import type { CompanyPayment } from './components/payments-list'
import type { Company } from '@prisma/client'

interface Props {
  companyId: string
}

const Screen = ({ companyId }: Props) => {
  const isMobile = useIsMobile()

  const [company, setCompany] = useState<Company | null>(null)
  const [data, setData] = useState<CompanyPayment[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!companyId) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const res = await fetch(`/api/companies/${companyId}/payments`)
        const d: CompanyPaymentsApiResponse = await res.json()

        if (d.success) {
          const p = d.data as CompanyPayments

          setCompany(p.company)

          const companyPayments: CompanyPayment[] = []

          p.payments.forEach((payment) => {
            const employee = p.employees.find(
              (e) => e.id === payment.employee_id
            )

            companyPayments.push({
              payment_id: payment.id,
              payment_transaction: payment.transaction_hash,
              payment_date: payment.created_at.toLocaleString(),
              payment_amount: payment.amount,
              payment_recipient: payment.wallet_address,
              employee_display_name: employee?.display_name || '',
            })
          })

          setData(companyPayments)
          setIsLoading(false)
          return
        }

        setError(d.message || 'Unknown response from API')
      } catch (e) {
        setError(`${e}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [companyId])

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

        {company && (
          <Grid.Column>
            <Header as="h1" content={`Payments by ${company.display_name}`} />
          </Grid.Column>
        )}

        <Grid.Column>
          {data.length > 0 ? (
            <PaymentsList companyPayments={data} />
          ) : (
            <Message warning>
              <p>No payments for this company yet.</p>
            </Message>
          )}
        </Grid.Column>
      </Grid>
    </>
  )
}

export default Screen
