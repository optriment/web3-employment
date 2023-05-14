import { useRouter } from 'next/router'
import React, { useState, useEffect, useContext } from 'react'
import { Button, Message, Grid } from 'semantic-ui-react'
import { ErrorMessage, LoadingMessage } from '@/components'
import { Web3Context } from '@/context/web3-context'
import api, { APIError } from '@/lib/api'
import type { CompanyWithEmployees } from '@/pages/api/companies/[id]'
import { useIsMobile } from '@/utils/use-is-mobile'
import { AddEmployeeDialog } from '../components/add-employee-dialog'
import { EditEmployeeDialog } from '../components/edit-employee-dialog'
import { EmployeesList } from '../components/employees-list'
import { PreparePaymentDialog } from '../components/prepare-payment-dialog'
import { TransactionDialog } from '../components/transaction-dialog'
import { TransactionInfoDialog } from '../components/transaction-info-dialog'
import { CompanyHeader } from './company-header'
import type { ValidationSchema as PaymentValidationSchema } from '../components/payment-form'
import type { PaymentTransactionData } from '../components/transaction-dialog'
import type { Employee } from '@prisma/client'

interface Props {
  companyId: string
}

const Screen = ({ companyId }: Props) => {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { connected } = useContext(Web3Context)

  const [data, setData] = useState<CompanyWithEmployees | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const [newEmployeeDialogOpen, setNewEmployeeDialogOpen] =
    useState<boolean>(false)

  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null)
  const [editEmployeeDialogOpen, setEditEmployeeDialogOpen] =
    useState<boolean>(false)

  const [preparePaymentDialogOpen, setPreparePaymentDialogOpen] =
    useState<boolean>(false)
  const [employeeToPay, setEmployeeToPay] = useState<Employee | null>(null)

  const [transactionDialogOpen, setTransactionDialogOpen] =
    useState<boolean>(false)
  const [paymentTransactionData, setPaymentTransactionData] =
    useState<PaymentTransactionData | null>(null)

  const [transactionInfoDialogOpen, setTransactionInfoDialogOpen] =
    useState<boolean>(false)

  const [isCompanyArchived, setIsCompanyArchived] = useState<boolean>(false)
  const [archiveError, setArchiveError] = useState<string>('')
  const [unarchiveError, setUnarchiveError] = useState<string>('')

  const [transaction, setTransaction] = useState<string>('')

  const onEmployeeCreated = () => {
    router.reload()
  }

  const onEmployeeUpdated = () => {
    router.reload()
  }

  const onTransactionSaved = (tx: string) => {
    setEmployeeToPay(null)
    setPaymentTransactionData(null)
    setTransaction(tx)
    setTransactionInfoDialogOpen(true)
  }

  const onEditClicked = (employee: Employee) => {
    setEmployeeToEdit(employee)
    setEditEmployeeDialogOpen(true)
  }

  const onPaymentClicked = (employee: Employee) => {
    setEmployeeToPay(employee)
    setPreparePaymentDialogOpen(true)
  }

  const onPaymentPrepared = async (data: PaymentValidationSchema) => {
    if (!employeeToPay?.wallet_address) return

    setPaymentTransactionData({
      amount: data.amount,
      recipient: employeeToPay.wallet_address,
    })
    setPreparePaymentDialogOpen(false)
    setTransactionDialogOpen(true)
  }

  const handleArchive = async () => {
    try {
      setArchiveError('')

      await api.archiveCompany(companyId)

      setIsCompanyArchived(true)
    } catch (e) {
      if (e instanceof APIError) {
        setArchiveError(e.message)
      } else {
        setArchiveError(`${e}`)
      }
    }
  }

  const handleUnarchive = async () => {
    try {
      setUnarchiveError('')

      await api.unarchiveCompany(companyId)

      setIsCompanyArchived(false)
    } catch (e) {
      if (e instanceof APIError) {
        setUnarchiveError(e.message)
      } else {
        setUnarchiveError(`${error}`)
      }
    }
  }

  useEffect(() => {
    if (!companyId) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const company = await api.getCompanyById(companyId)

        setData(company.data)
        setIsCompanyArchived(!!company.data?.company?.archived_at)
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
  }, [companyId])

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

        {archiveError && (
          <Grid.Column>
            <ErrorMessage
              header="Unable to archive company"
              content={archiveError}
            />
          </Grid.Column>
        )}

        {unarchiveError && (
          <Grid.Column>
            <ErrorMessage
              header="Unable to unarchive company"
              content={unarchiveError}
            />
          </Grid.Column>
        )}

        {data && (
          <>
            <Grid.Row columns={isMobile ? 1 : 2}>
              <Grid.Column width={8}>
                <CompanyHeader company={data.company} />
              </Grid.Column>

              <Grid.Column width={8} textAlign="right">
                <Button
                  size="large"
                  icon="plus"
                  content="Add Employee"
                  primary
                  onClick={() => setNewEmployeeDialogOpen(true)}
                  disabled={!!isCompanyArchived}
                />

                <Button
                  size="large"
                  icon="money"
                  content="Payments"
                  as="a"
                  href={`/companies/${data.company.id}/payments`}
                />

                <Button
                  size="large"
                  icon={isCompanyArchived ? 'undo' : 'archive'}
                  onClick={isCompanyArchived ? handleUnarchive : handleArchive}
                />
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
                  onEditClicked={(employee: Employee) =>
                    onEditClicked(employee)
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

      {data && (
        <>
          <AddEmployeeDialog
            open={newEmployeeDialogOpen}
            setOpen={setNewEmployeeDialogOpen}
            companyId={companyId}
            onEmployeeCreated={onEmployeeCreated}
          />

          {employeeToEdit && (
            <EditEmployeeDialog
              open={editEmployeeDialogOpen}
              setOpen={setEditEmployeeDialogOpen}
              companyId={companyId}
              employee={employeeToEdit}
              onEmployeeUpdated={onEmployeeUpdated}
            />
          )}

          {employeeToPay && (
            <>
              <PreparePaymentDialog
                open={preparePaymentDialogOpen}
                setOpen={setPreparePaymentDialogOpen}
                employee={employeeToPay}
                onPaymentPrepared={onPaymentPrepared}
              />

              {paymentTransactionData !== null && (
                <TransactionDialog
                  open={transactionDialogOpen}
                  setOpen={setTransactionDialogOpen}
                  companyId={companyId}
                  employee={employeeToPay}
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
