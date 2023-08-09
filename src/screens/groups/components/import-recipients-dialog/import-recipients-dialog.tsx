import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { Button, Modal, Message } from 'semantic-ui-react'
import { LoadingMessage } from '@/components'
import api, { APIError } from '@/lib/api'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  groupId: string
  onRecipientsImported: () => void
}

const Component = ({ groupId, open, setOpen, onRecipientsImported }: Props) => {
  const [uploading, setUploading] = useState<boolean>(false)
  const [importError, setImportError] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async () => {
    if (!fileInputRef.current?.files?.length) return

    setUploading(true)

    try {
      const file = fileInputRef.current.files[0]

      await api.importRecipients(groupId, file)

      onRecipientsImported()
    } catch (e) {
      if (e instanceof APIError) {
        setImportError(e.message)
      } else {
        setImportError(`${e}`)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      size="tiny"
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      <Modal.Header>Import Recipients from CSV</Modal.Header>
      <Modal.Content>
        {importError && (
          <Message error size="big">
            <Message.Header content="Unable to import recipients" />
            <p>{importError}</p>
          </Message>
        )}

        <p>
          Upload your file for instant data import. Only valid records will be
          added. For reference,
          <Link href="/sample/recipients.csv">
            {' download the pre-defined CSV template here '}
          </Link>
          with the necessary columns.
        </p>

        {uploading && <LoadingMessage content="Uploading file..." />}

        <Button
          size="large"
          icon="upload"
          content="Choose File"
          primary
          onClick={() =>
            fileInputRef.current ? fileInputRef.current.click() : null
          }
          disabled={uploading}
        />
        <input
          ref={fileInputRef}
          multiple={false}
          type="file"
          accept=".csv"
          hidden
          onChange={handleImport}
          disabled={uploading}
        />
      </Modal.Content>
    </Modal>
  )
}

export default Component
