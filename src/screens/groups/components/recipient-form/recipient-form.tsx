import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Header, Grid, Button, Form } from 'semantic-ui-react'
import { fromTokens } from '@/lib/blockchain'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { useIsMobile } from '@/utils/use-is-mobile'
import { RecipientSchema } from '@/validations'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

export type ValidationSchema = z.infer<typeof RecipientSchema>

type Props = {
  onFormSubmitted: (_: ValidationSchema) => void
  recipient?: RecipientDTO
}

const Component = ({ onFormSubmitted, recipient }: Props) => {
  const isMobile = useIsMobile()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ValidationSchema>({
    mode: 'onChange',
    resolver: zodResolver(RecipientSchema),
    defaultValues: {
      display_name: recipient?.display_name || '',
      comment: recipient?.comment || '',
      wallet_address: recipient?.wallet_address || '',
      contacts: recipient?.contacts || '',
      salary:
        recipient && recipient.salary
          ? fromTokens(+recipient.salary.toString())
          : 0,
    },
  })

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    onFormSubmitted(data)
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} size="big">
      <Grid container={!isMobile} columns={1}>
        <Grid.Column>
          <Header as="h3">Display name:</Header>

          <Controller
            name="display_name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Form.Input
                {...field}
                error={errors.display_name && errors.display_name?.message}
                placeholder=""
                autoComplete="off"
                maxLength={100}
              />
            )}
          />
        </Grid.Column>

        <Grid.Column>
          <Header as="h3">Wallet address:</Header>

          <Controller
            name="wallet_address"
            control={control}
            render={({ field }) => (
              <Form.Input
                {...field}
                error={errors.wallet_address && errors.wallet_address?.message}
                placeholder=""
                autoComplete="off"
                maxLength={100}
              />
            )}
          />
        </Grid.Column>

        <Grid.Column>
          <Header as="h3">Salary:</Header>

          <Controller
            name="salary"
            control={control}
            render={({ field }) => (
              <Form.Input
                {...field}
                error={errors.salary && errors.salary?.message}
                placeholder=""
                autoComplete="off"
                maxLength={13}
              />
            )}
          />
        </Grid.Column>

        <Grid.Column>
          <Header as="h3">Contacts:</Header>

          <Controller
            name="contacts"
            control={control}
            render={({ field }) => (
              <Form.Input
                {...field}
                error={errors.contacts && errors.contacts?.message}
                placeholder=""
                autoComplete="off"
                maxLength={100}
              />
            )}
          />
        </Grid.Column>

        <Grid.Column>
          <Header as="h3">Comment:</Header>

          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <Form.TextArea
                {...field}
                error={errors.comment && errors.comment?.message}
                rows={3}
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
