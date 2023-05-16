import { useRouter } from 'next/router'
import React from 'react'
import { WalletLoader } from '@/components'
import { useHasMounted } from '@/hooks'
import { MainLayout } from '@/layouts'
import { GroupPaymentsScreen } from '@/screens/groups'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import { useIsMobile } from '@/utils/use-is-mobile'
import type { GetServerSidePropsContext } from 'next'

const Page: React.FC = () => {
  const router = useRouter()
  const hasMounted = useHasMounted()
  const isMobile = useIsMobile()

  if (!hasMounted) {
    return <p>Not mounted yet</p>
  }

  const groupId = router.query.id as string

  return (
    <MainLayout isMobile={isMobile}>
      <WalletLoader
        onDisconnected={() => <GroupPaymentsScreen groupId={groupId} />}
        onConnected={() => <GroupPaymentsScreen groupId={groupId} />}
      />
    </MainLayout>
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
