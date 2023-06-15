import { useSession } from 'next-auth/react'
import React from 'react'
import { NotMountedYet } from '@/components'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { LandingLayout, UserLayout } from '@/layouts'
import { LandingPage } from '@/screens/landing'
import { UserDashboardScreen } from '@/screens/user/dashboard'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import { useIsMobile } from '@/utils/use-is-mobile'
import type { GetServerSidePropsContext } from 'next'

const Page: React.FC = () => {
  const hasMounted = useHasMounted()
  const isMobile = useIsMobile()

  const { data: session } = useSession()

  if (!hasMounted) {
    return <NotMountedYet />
  }

  if (!session) {
    return (
      <LandingLayout isMobile={isMobile}>
        <LandingPage />
      </LandingLayout>
    )
  }

  return (
    <UserLayout isMobile={isMobile}>
      <UserDashboardScreen />
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
