import React from 'react'
import { Button, Modal } from 'semantic-ui-react'
import { buildTronScanTransactionURL } from '@/lib/blockchain'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
  tx: string
}

const Component = ({ open, setOpen, onClose, tx }: Props) => (
  <Modal
    closeIcon
    onClose={() => {
      setOpen(false)
      onClose()
    }}
    onOpen={() => setOpen(true)}
    open={open}
    size="tiny"
  >
    <Modal.Header>Success!</Modal.Header>
    <Modal.Content>
      <Button
        as="a"
        href={buildTronScanTransactionURL(tx)}
        target="_blank"
        rel="nofollow noreferrer noopener"
        size="large"
        icon="external alternate"
        content="Open transaction details"
        positive
      />
    </Modal.Content>
  </Modal>
)

export default Component
