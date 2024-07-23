import { cookies } from 'next/headers'
import HomePage from './_page';

export default function Home() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('tyms_access_token');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <HomePage accessToken={accessToken?.value} />
    </main>
  )
}