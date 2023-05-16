import { zodResolver } from '@hookform/resolvers/zod'
import React, { useContext } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Header, Grid, Button, Form } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'
import { useIsMobile } from '@/utils/use-is-mobile'
import { PaymentSchema } from '@/validations'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

export type ValidationSchema = z.infer<typeof PaymentSchema>

type Props = {
  onFormSubmitted: (_: ValidationSchema) => void
  salary: number
}

const Component = ({ onFormSubmitted, salary }: Props) => {
  const { tokenSymbol } = useContext(Web3Context)
  const isMobile = useIsMobile()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ValidationSchema>({
    mode: 'onChange',
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      amount: salary,
    },
  })

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    onFormSubmitted(data)
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} size="big">
      <Grid container={!isMobile} columns={1}>
        <Grid.Column>
          <Header as="h3">Amount in {tokenSymbol}:</Header>

          <Controller
            name="amount"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Form.Input
                {...field}
                error={errors.amount && errors.amount?.message}
                placeholder=""
                autoComplete="off"
                maxLength={6}
              />
            )}
          />
        </Grid.Column>

        <Grid.Column>
          <Button
            content="Save"
            primary
            size="big"
            disabled={isSubmitting || !isValid}
          />
        </Grid.Column>
      </Grid>
    </Form>
  )
}

export default Component
