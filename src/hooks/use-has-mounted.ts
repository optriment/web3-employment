import { useEffect, useState } from 'react'

export const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState<boolean>(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}
