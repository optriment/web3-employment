import React from 'react'
import { Modal } from 'semantic-ui-react'
type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
}

const Component = ({ open, setOpen, onClose }: Props) => (
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
    <Modal.Header style={{ color: 'green' }}>
      Success! Recipients imported successfully
    </Modal.Header>
  </Modal>
)

export default Component
