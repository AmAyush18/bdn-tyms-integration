import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('tyms_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch sales data from Tyms
    const tymsResponse = await fetch('https://api.tyms.io/api/v1/sales', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY!,
      },
    });

    if (!tymsResponse.ok) {
      throw new Error('Failed to fetch sales data from Tyms');
    }

    const responseData = await tymsResponse.json();

    // Check if the response contains the expected structure
    if (responseData.status !== 'success' || !responseData.data || !Array.isArray(responseData.data.data)) {
      console.error('Unexpected response structure:', responseData);
      throw new Error('Unexpected response structure from Tyms API');
    }

    // Calculate total turnover
    const turnover = responseData.data.data.reduce((total: number, sale: any) => total + (sale.amount || 0), 0);

    return NextResponse.json({ turnover });
  } catch (error: any) {
    console.error('Error fetching turnover:', error);
    return NextResponse.json({ error: 'Failed to fetch turnover' }, { status: 500 });
  }
}