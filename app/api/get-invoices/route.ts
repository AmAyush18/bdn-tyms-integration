import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('tyms_access_token')?.value;

  if (!accessToken) {
    console.error('Access token not found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiUrl = 'https://api.tyms.io/api/v1/invoices';
    const headers = {
      'accept': 'application/json',
      'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY!,
    };

    console.log('Sending request to Tyms API:', {
      url: apiUrl,
      method: 'GET',
      headers: { ...headers, 'Authorization': '[REDACTED]', 'secret-key': '[REDACTED]' },
    });

    const tymsResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    });

    console.log('Tyms API response status:', tymsResponse.status);

    if (!tymsResponse.ok) {
      throw new Error(`API responded with status ${tymsResponse.status}`);
    }

    const responseData = await tymsResponse.json();
    console.log('Tyms API response data:', JSON.stringify(responseData, null, 2));

    if (responseData.status !== 'success' || !responseData.data || !Array.isArray(responseData.data.data)) {
      throw new Error('Invalid data format received from Tyms API');
    }

    const invoices = responseData.data.data;
    console.log('Successfully fetched invoices. Count:', invoices.length);
    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch invoices',
      details: error.message
    }, { status: 500 });
  }
}