// NOTE: https://javascript.plainenglish.io/the-right-way-to-detect-mobile-breakpoints-in-nextjs-301ccb1976bd
import { createContext, useContext } from 'react'
import { useWindowSize } from './use-window-size'

export const IsSsrMobileContext = createContext(false)

export const useIsMobile = () => {
  const isSsrMobile = useContext(IsSsrMobileContext)
  const { width: windowWidth } = useWindowSize()
  const isBrowserMobile = !!windowWidth && windowWidth < 992

  return isSsrMobile || isBrowserMobile
}
