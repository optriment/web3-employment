# Web3: Employment

We are looking for 2-3 experienced software developers to join our team and help
us build a web-based system for managing companies and employees.

The ideal candidates will have expertise in Next.js, ReactJS, TypeScript,
PostgreSQL, [Prisma.io](http://prisma.io/), Docker,
[React Semantic UI](https://react.semantic-ui.com/), and experience with writing
tests. We will be using [Zod](https://zod.dev/) library for backend to validate
requests. In addition, it would be great if you have experience with the web3
stack and working with crypto wallets and transactions on Tron blockchain.

Payments for this project will be processed on a weekly basis using Tron USDT.
We are looking for developers who can work together, split tasks and contribute
to this project. By joining our team, you will be listed as a developer and can
use this project to enhance your resume.

This is a remote position and we are looking for candidates who can work with us
full-time or part-time. If you are passionate about developing high-quality
software and working on a dynamic team, please apply and join us on this
exciting project.

## Overview

The app is a web-based system for managing a list of companies and their
employees. There will be only one user of this app, so we don’t need a
registration/authorization system.

It will be built using Next.js, PostgreSQL as the database, Prisma as the
database connector, Zod as a validation library for Backend API, React Semantic
UI as a design system, and TronWallet Adapters to process payments. The system
will allow you to create companies and add employees to them. Additionally, the
system will support making payments to employees using cryptocurrencies and
archiving/unarchiving companies and employees.

## Features

### Create Company

The app should allow you to create new companies using pop-up dialog. When
creating a new company, you should provide a display name for the company and a
comment. The backend should validate that the display name is not an empty
string, and return an appropriate error message if the validation fails.

Page: `/companies`

API endpoint: `POST /api/companies`

Body:

```json
{
  "display_name": "Company Name",
  "comment": "A few words about this company"
}
```

### List Companies

The app should display a list of all companies that have been created,
including their display names, comments, and status. The status can be either
active or archived, and it would be great to have a filter option to show all
companies, only active companies, or only archived companies. In addition, for
each company, the list should include action buttons to archive/unarchive the
company and edit their details.

Page: `/companies`

API: `GET /api/companies?status=active|archived|all`

Body:

```json
{
  "companies": [
    {
      "id": "1",
      "display_name": "Company Name",
      "comment": "A few words about this company",
      "status": "active"
    }
  ]
}
```

### View Company Details

The app should allow you to view the details of a specific active company,
including its display name, comment, and a list of employees associated with the
company. The list of employees should display their display name, contacts,
status, and wallet address. In addition, for each employee, the list should
include action buttons to archive/unarchive the employee, edit their details,
and make a payment (using pop-up dialog).

Page: `/companies/:id`

API: `GET /api/companies/:id`

Body:

```json
{
  "company": {
    "id": 1,
    "display_name": "Company Name",
    "comment": "A few words about this company",
    "status": "active"
  },
  "employees": [
    {
      "id": 1,
      "display_name": "Employee 1",
      "contacts": "Telegram, Skype, etc.",
      "wallet_address": "0xBEE",
      "status": "active"
    }
  ]
}
```

### Create Employee

The app should allow you to create new employees and assign them to a company
(using pop-up dialog). When creating a new employee, you should provide a
display name, contacts (using textarea field), and a blockchain wallet address.

Page: `/companies/:id`

API: `POST /api/companies/:id/employees`

Body:

```json
{
  "display_name": "Employee 1",
  "contacts": "Telegram, Skype, etc.",
  "wallet_address": "0xBEE"
}
```

### Edit Company Details

The app should allow you to edit the display name and the comment of a company.

Page: `/companies/:id`

API: `PUT /api/companies/:id`

Body:

```json
{
  "display_name": "New Company Name",
  "comment": "A few words"
}
```

### Edit Employee Details

The app should allow you to edit the details of an employee, including their
display name, contacts, and blockchain wallet address.

Page: `/companies/:id`

API: `PUT /api/companies/:id/employees/:employee_id`

Body:

```json
{
  "display_name": "New display name",
  "contacts": "New contacts",
  "wallet_address": "0xEEE"
}
```

### Archive Company (Soft Delete)

The app should allow you to archive a company from the companies list. This
action will change the status of the company to “archived”.

Page: `/companies`

API: `DELETE /api/companies/:id`

### Unarchive Company

The app should allow you to unarchive a company from the companies list. This
action will change the status of the company to “active”.

Page: `/companies`

API: `POST /api/companies/:id/unarchive`

### Archive Employee

The app should allow you to archive an employee from the company’s card. This
action will change the status of the employee to “archived”

Page: `/companies/:id`

API: `DELETE /api/companies/:id/employees/:employee_id`

### Unarchive Employee

The app should allow you to unarchive an employee from the company’s card. This
action will change the status of the employee to “active”.

Page: `/companies/:id`

API: `POST /api/companies/:id/employees/:employee_id/unarchive`

### Make Payment

The app should allow you to make payments to employees using cryptocurrencies.
You should be able to specify the amount in USDT for the payment. Payments
should not be available if company or employee are archived.

Page: `/companies/:id`

API: `POST /api/companies/:id/employees/:employee_id/pay`

Body:

```json
{
  "transaction_hash": "0x1234",
  "amount": "123.32",
  "wallet_address": "0xEEE"
}
```

## Database

Here is the possible scheme for Prisma:

```text
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Company {
  id           Int       @id @default(autoincrement())
  display_name String
  comment      String?
  status       String    @default("active")
  employees    Employee[]
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  @@map("companies")
}

model Employee {
  id            Int       @id @default(autoincrement())
  display_name  String
  contacts      String?
  wallet_address String
  status        String    @default("active")
  company       Company   @relation(fields: [company_id], references: [id])
  company_id    Int
  payments      Payment[]
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  @@map("employees")
}

model Payment {
  id             Int       @id @default(autoincrement())
  transaction_hash String
  amount         Float
  wallet_address String
  payment_date   DateTime
  employee       Employee  @relation(fields: [employee_id], references: [id])
  employee_id    Int
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt

  @@map("payments")
}
```

## Timeline & Sprint Planning

### Sprint 1

- [x] Create project structure and set up linters
- [x] Create and test database schema using Prisma
- [x] Set up GitHub workflow actions for automated testing and deployment
- [x] Create a Docker container with docker-compose and provide a Makefile

### Sprint 2

- [ ] Create API endpoint to create a company with display name and validate input
- [ ] Create frontend UI to create a company
- [ ] Write test cases for creating a company and validating input
- [ ] Create API endpoint to list all companies with their display names and status
- [ ] Create frontend UI to display all companies
- [ ] Write test cases for listing all companies

### Sprint 3

- [ ] Create API endpoint to add an employee to a specific company
- [ ] Create frontend UI to add an employee to a specific company
- [ ] Write test cases for adding an employee to a company
- [ ] Create API endpoint to list all employees in a specific company
- [ ] Create frontend UI to display all employees in a specific company
- [ ] Write test cases for listing all employees in a specific company

### Sprint 4

- [ ] Create API endpoint to make a payment for an employee
- [ ] Create frontend UI to make a payment for an employee
- [ ] Write test cases for making a payment for an employee
- [ ] Write documentation on how to run the project locally

### Sprint 5

- [ ] Create API endpoint to update company details
- [ ] Create frontend UI to update company details
- [ ] Write test cases for updating company details
- [ ] Create API endpoint to update employee details
- [ ] Create frontend UI to update employee details
- [ ] Write test cases for updating employee details

### Sprint 6

- [ ] Create API endpoint to archive/unarchive a company
- [ ] Create frontend UI to archive/unarchive a company
- [ ] Write test cases for archiving/unarchiving a company
- [ ] Create API endpoint to archive/unarchive an employee
- [ ] Create frontend UI to archive/unarchive an employee
- [ ] Write test cases for archiving/unarchiving an employee

### Sprint 7

- [ ] Create API endpoint to list all transactions for a specific company
- [ ] Create frontend UI to display all transactions for a specific company
- [ ] Write test cases for listing all transactions for a specific company
