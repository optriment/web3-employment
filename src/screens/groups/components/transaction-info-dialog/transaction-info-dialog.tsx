import React, { useContext } from 'react'
import { Button, Modal } from 'semantic-ui-react'
import { Web3Context } from '@/context/web3-context'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
  tx: string
}

const Component = ({ open, setOpen, onClose, tx }: Props) => {
  const { buildTronScanTransactionURL } = useContext(Web3Context)

  return (
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
}

export default Component
