import React from 'react'
import { Header } from 'semantic-ui-react'
import type { Company } from '@prisma/client'

type Props = {
  company: Company
}

export const CompanyHeader = ({ company }: Props) => (
  <>
    <Header as="h1">{company.display_name}</Header>

    {company.comment && <Header as="h3">{company.comment}</Header>}

    {company.archived_at && (
      <Header as="h3">Archived: {company.archived_at.toLocaleString()}</Header>
    )}
  </>
)
