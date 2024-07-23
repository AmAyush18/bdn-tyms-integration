import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardPage } from './_components/_page';

export default async function Dashboard() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('tyms_access_token');

  const handleGetInvoice = async (event: React.MouseEvent<HTMLButtonElement>)=> {
    try {
        const response = await fetch("https://api.tyms.io/api/v1/invoices", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY || ''
            },
          });
    
          if (!response.ok) {
                console.log('Fatt gya')  
          }
    } catch (err) {
        console.log(err)
    }
  }

  if (!accessToken) {
    redirect('/login');
  }

  return (
    <DashboardPage />
  );
}