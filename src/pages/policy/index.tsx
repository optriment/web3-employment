import { useSession } from 'next-auth/react'
import React from 'react'
import { LandingLayout, UserLayout } from '@/layouts'
import { PrivacyPolicyScreen } from '@/screens/policy'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import { useIsMobile } from '@/utils/use-is-mobile'
import type { GetServerSidePropsContext } from 'next'

const Page: React.FC = () => {
  const isMobile = useIsMobile()

  const { data: session } = useSession()

  if (!session) {
    return (
      <LandingLayout isMobile={isMobile}>
        <PrivacyPolicyScreen />
      </LandingLayout>
    )
  }

  return (
    <UserLayout isMobile={isMobile}>
      <PrivacyPolicyScreen />
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
