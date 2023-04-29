import React, { useContext } from 'react'
import { Web3Context } from '@/context/web3-context'

type Props = {
  onDisconnected: () => React.ReactNode
  onConnected: () => React.ReactNode
}

const Component = ({ onDisconnected, onConnected }: Props) => {
  const { connecting, disconnected, error } = useContext(Web3Context)

  if (connecting) {
    return <p>Connecting to account...</p>
  }

  if (disconnected) {
    return <>{onDisconnected()}</>
  }

  if (error) {
    return <h2>Web3 Error: {error}</h2>
  }

  return <>{onConnected()}</>
}

export default Component
