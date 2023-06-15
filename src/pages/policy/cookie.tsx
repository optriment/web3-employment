import { useSession } from 'next-auth/react'
import React from 'react'
import { LandingLayout, UserLayout } from '@/layouts'
import { CookiePolicyScreen } from '@/screens/policy'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import { useIsMobile } from '@/utils/use-is-mobile'
import type { GetServerSidePropsContext } from 'next'

const Page: React.FC = () => {
  const isMobile = useIsMobile()

  const { data: session } = useSession()

  if (!session) {
    return (
      <LandingLayout isMobile={isMobile}>
        <CookiePolicyScreen />
      </LandingLayout>
    )
  }

  return (
    <UserLayout isMobile={isMobile}>
      <CookiePolicyScreen />
    </UserLayout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      isSsrMobile: getIsSsrMobile(context),
    },
  }
}

export default Page
