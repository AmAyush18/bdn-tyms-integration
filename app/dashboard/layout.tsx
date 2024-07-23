import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {Sidebar} from './_components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.has('tyms_access_token')

  if (!isLoggedIn) {
    redirect('/')
  }

  return (
    <>
      <div className="lg:flex hidden w-full h-full">
        <div className="w-[220px] flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 bg-[#F7F7F8]">{children}</div>
      </div>
    </>
  )
}