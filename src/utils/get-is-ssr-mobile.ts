// NOTE: https://javascript.plainenglish.io/the-right-way-to-detect-mobile-breakpoints-in-nextjs-301ccb1976bd
import MobileDetect from 'mobile-detect'
import type { GetServerSidePropsContext } from 'next'

export const getIsSsrMobile = (context: GetServerSidePropsContext) => {
  const md = new MobileDetect(context.req.headers['user-agent'] as string)

  return Boolean(md.mobile())
}
