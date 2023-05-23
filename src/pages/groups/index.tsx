import { useSession } from 'next-auth/react'
import React from 'react'
import { useHasMounted } from '@/hooks'
import { LandingLayout, UserLayout } from '@/layouts'
import { GroupsScreen } from '@/screens/groups'
import { AccessDeniedScreen } from '@/screens/shared'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import { useIsMobile } from '@/utils/use-is-mobile'
import type { GetServerSidePropsContext } from 'next'

const Page: React.FC = () => {
  const hasMounted = useHasMounted()
  const isMobile = useIsMobile()

  const { data: session } = useSession()

  if (!hasMounted) {
    return <p>Not mounted yet</p>
  }

  if (!session) {
    return (
      <LandingLayout isMobile={isMobile}>
        <AccessDeniedScreen />
      </LandingLayout>
    )
  }

  return (
    <UserLayout isMobile={isMobile}>
      <GroupsScreen />
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
