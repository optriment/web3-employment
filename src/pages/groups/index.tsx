import React from 'react'
import { WalletLoader } from '@/components'
import { useHasMounted } from '@/hooks'
import { MainLayout } from '@/layouts'
import { GroupsScreen } from '@/screens/groups'
import { getIsSsrMobile } from '@/utils/get-is-ssr-mobile'
import { useIsMobile } from '@/utils/use-is-mobile'
import type { GetServerSidePropsContext } from 'next'

const Page: React.FC = () => {
  const hasMounted = useHasMounted()
  const isMobile = useIsMobile()

  if (!hasMounted) {
    return <p>Not mounted yet</p>
  }

  return (
    <MainLayout isMobile={isMobile}>
      <WalletLoader
        onDisconnected={() => <GroupsScreen />}
        onConnected={() => <GroupsScreen />}
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