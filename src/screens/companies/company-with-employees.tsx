import { useRouter } from 'next/router'
import React, { useState, useEffect, useContext } from 'react'
import { Modal, Button, Message, Grid, Header } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import { Web3Context } from '@/context/web3-context'
import type {
  CompanyWithEmployees,
  CompanyWithEmployeesApiResponse,
} from '@/pages/api/companies/[id]'
import type { EmployeeCreateApiResponse } from '@/pages/api/companies/[id]/employees'
import type { PaymentCreateApiResponse } from '@/pages/api/companies/[id]/employees/[employee_id]/payment'
import { useIsMobile } from '@/utils/use-is-mobile'
import { EmployeeForm } from './components/employee-form'
import { EmployeesList } from './components/employees-list'
import { PaymentForm } from './components/payment-form'
import { TransactionDialog } from './components/transaction-dialog'
import type { ValidationSchema } from './components/employee-form'
import type { ValidationSchema as PaymentValidationSchema } from './components/payment-form'
import type { PaymentTransactionData } from './components/transaction-dialog'
import type { Employee } from '@prisma/client'

interface Props {
  companyId: string
}

const Screen = ({ companyId }: Props) => {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { connected } = useContext(Web3Context)

  const [data, setData] = useState<CompanyWithEmployees | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const [open, setOpen] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string>('')
  const [createValidationErrors, setCreateValidationErrors] = useState<
    string[]
  >([])

  const [paymentOpen, setPaymentOpen] = useState<boolean>(false)
  const [employeeToPay, setEmployeeToPay] = useState<Employee | null>(null)

  const [transactionOpen, setTransactionOpen] = useState<boolean>(false)
  const [paymentTransactionData, setPaymentTransactionData] =
    useState<PaymentTransactionData | null>(null)

  const [paymentError, setPaymentError] = useState<string>('')
  const [paymentValidationErrors, setPaymentValidationErrors] = useState<
    string[]
  >([])

  const onFormSubmitted = async (data: ValidationSchema) => {
    try {
      setCreateError('')
      setCreateValidationErrors([])

      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }

      const res = await fetch(`/api/companies/${companyId}/employees`, payload)
      const response: EmployeeCreateApiResponse = await res.json()

      if (!res.ok) {
        const { validation_errors, message } = response

        if (message) setCreateError(message)
        if (validation_errors) setCreateValidationErrors(validation_errors)

        return
      }

      if (!response.data) {
        throw new Error('There is no response.data in API response')
      }

      router.reload()
    } catch (e) {
      setCreateError(`${e}`)
    }
  }

  const onPaymentClicked = (employee: Employee) => {
    setEmployeeToPay(employee)
    setPaymentOpen(true)
  }

  const onPaymentFormSubmitted = async (data: PaymentValidationSchema) => {
    if (!employeeToPay?.wallet_address) return

    setPaymentTransactionData({
      amount: data.amount,
      recipient: employeeToPay.wallet_address,
    })
    setPaymentOpen(false)
    setTransactionOpen(true)
  }

  const onTransactionReceived = async (tx: string) => {
    if (!employeeToPay) return
    if (!paymentTransactionData) return

    try {
      setPaymentError('')
      setPaymentValidationErrors([])

      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_hash: tx,
          amount: paymentTransactionData.amount,
        }),
      }

      const res = await fetch(
        `/api/companies/${companyId}/employees/${employeeToPay.id}/payment`,
        payload
      )
      const response: PaymentCreateApiResponse = await res.json()

      if (!res.ok) {
        const { validation_errors, message } = response

        if (message) setPaymentError(message)
        if (validation_errors) setPaymentValidationErrors(validation_errors)

        return
      }

      if (!response.data) {
        throw new Error('There is no response.data in API response')
      }

      setEmployeeToPay(null)
      setPaymentTransactionData(null)
    } catch (e) {
      setPaymentError(`${e}`)
    }
  }

  useEffect(() => {
    if (!companyId) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const res = await fetch(`/api/companies/${companyId}`)
        const d: CompanyWithEmployeesApiResponse = await res.json()

        if (d.success) {
          setData(d.data as CompanyWithEmployees)
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

  const isCompanyArchived = data && data.company.archived_at

  return (
    <>
      <Grid stackable={isMobile} container={!isMobile} columns={1}>
        {isLoading && (
          <Grid.Column>
            <LoadingMessage content="Loading company with employees..." />
          </Grid.Column>
        )}

        {error && (
          <Grid.Column>
            <ErrorMessage header="Unable to load company" content={error} />
          </Grid.Column>
        )}

        {data !== null && (
          <>
            <Grid.Row columns={isMobile ? 1 : 2}>
              <Grid.Column width={10}>
                <Header as="h1">{data.company.display_name}</Header>

                {data.company.comment && (
                  <Header as="h3">{data.company.comment}</Header>
                )}

                {data.company.archived_at && (
                  <Header as="h3">
                    Archived: {data.company.archived_at.toLocaleString()}
                  </Header>
                )}
              </Grid.Column>

              <Grid.Column width={6} textAlign="right">
                <Button
                  size="large"
                  icon="plus"
                  content="Add Employee"
                  primary
                  onClick={() => setOpen(true)}
                  disabled={!!isCompanyArchived}
                />
                <Button size="large" icon="pencil" content="Edit Company" />
              </Grid.Column>
            </Grid.Row>

            {!connected && (
              <Grid.Column>
                <Message warning size="large">
                  <Message.Header>Payments are not available</Message.Header>

                  <p>Please connect wallet to make payments</p>
                </Message>
              </Grid.Column>
            )}

            <Grid.Column>
              {data.employees.length > 0 ? (
                <EmployeesList
                  isCompanyArchived={!!isCompanyArchived}
                  employees={data.employees}
                  onPaymentClicked={(employee: Employee) =>
                    onPaymentClicked(employee)
                  }
                />
              ) : (
                <Message warning>
                  <p>No employees in this company yet.</p>
                </Message>
              )}
            </Grid.Column>
          </>
        )}
      </Grid>

      {data !== null && (
        <>
          <Modal
            closeIcon
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
          >
            <Modal.Header>Add New Employee</Modal.Header>
            <Modal.Content>
              {createError && (
                <Message error size="big">
                  <Message.Header content="Unable to create employee" />
                  <p>{createError}</p>
                </Message>
              )}

              {createValidationErrors.length > 0 && (
                <Message
                  error
                  size="big"
                  header="Validation errors"
                  list={createValidationErrors}
                />
              )}

              <EmployeeForm onFormSubmitted={onFormSubmitted} />
            </Modal.Content>
          </Modal>

          {employeeToPay !== null && (
            <>
              <Modal
                closeIcon
                onClose={() => setPaymentOpen(false)}
                onOpen={() => setPaymentOpen(true)}
                open={paymentOpen}
                size="tiny"
              >
                <Modal.Header>
                  Payment for {employeeToPay.display_name}
                </Modal.Header>
                <Modal.Content>
                  <PaymentForm
                    onFormSubmitted={onPaymentFormSubmitted}
                    salary={employeeToPay.salary || 0}
                  />
                </Modal.Content>
              </Modal>

              {paymentTransactionData !== null && (
                <Modal
                  closeIcon
                  onClose={() => setTransactionOpen(false)}
                  onOpen={() => setTransactionOpen(true)}
                  open={transactionOpen}
                  size="small"
                >
                  <Modal.Header>
                    Send money to {' ' + employeeToPay.display_name}
                  </Modal.Header>
                  <Modal.Content>
                    {paymentError && (
                      <Message error size="big">
                        <Message.Header content="Unable to create payment" />
                        <p>{paymentError}</p>
                      </Message>
                    )}

                    {paymentValidationErrors.length > 0 && (
                      <Message
                        error
                        size="big"
                        header="Validation errors"
                        list={paymentValidationErrors}
                      />
                    )}

                    <TransactionDialog
                      payment={paymentTransactionData}
                      onTransactionReceived={(tx: string) =>
                        onTransactionReceived(tx)
                      }
                    />
                  </Modal.Content>
                </Modal>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}

export default Screen
