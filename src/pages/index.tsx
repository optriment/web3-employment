import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import React from 'react'
import { NotMountedYet } from '@/components'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { LandingLayout, UserLayout } from '@/layouts'
import { UserDashboardScreen } from '@/screens/user/dashboard'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import { useIsMobile } from '@/utils/use-is-mobile'
import type { GetServerSidePropsContext } from 'next'

const Page = () => {
  const router = useRouter()
  const hasMounted = useHasMounted()
  const isMobile = useIsMobile()

  const { data: session, status } = useSession()

  if (!hasMounted) {
    return <NotMountedYet />
  }

  if (status === 'loading') {
    return (
      <LandingLayout isMobile={isMobile}>
        <p>Loading...</p>
      </LandingLayout>
    )
  }

  if (!session) {
    router.push('https://optriment.com/optritool/')
    return
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
