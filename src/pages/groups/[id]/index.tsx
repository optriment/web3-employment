import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import React from 'react'
import { WalletLoader } from '@/components'
import { useHasMounted } from '@/hooks'
import { LandingLayout, UserLayout } from '@/layouts'
import { GroupScreen } from '@/screens/groups'
import { AccessDeniedScreen } from '@/screens/shared'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import { useIsMobile } from '@/utils/use-is-mobile'
import type { GetServerSidePropsContext } from 'next'

const Page: React.FC = () => {
  const router = useRouter()
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

  const groupId = router.query.id as string

  return (
    <UserLayout isMobile={isMobile}>
      <WalletLoader
        onDisconnected={() => <GroupScreen groupId={groupId} />}
        onConnected={() => <GroupScreen groupId={groupId} />}
      />
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
