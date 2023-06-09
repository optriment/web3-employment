import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Header, Grid, Button, Form } from 'semantic-ui-react'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import { useIsMobile } from '@/utils/use-is-mobile'
import { CreateGroupSchema } from '@/validations'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

export type ValidationSchema = z.infer<typeof CreateGroupSchema>

type Props = {
  onFormSubmitted: (_: ValidationSchema) => void
  group?: GroupDTO
}

const Component = ({ onFormSubmitted, group }: Props) => {
  const isMobile = useIsMobile()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ValidationSchema>({
    mode: 'onChange',
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
      display_name: group?.display_name || '',
      comment: group?.comment || '',
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
