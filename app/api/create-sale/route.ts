import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('tyms_access_token')?.value;

  if (!accessToken) {
    console.error('Access token not found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Validate required fields for sales creation
    const requiredFields = ['date', 'title', 'amount', 'payment_type', 'category'];
    for (const field of requiredFields) {
      if (!requestBody[field]) {
        console.error(`Missing required field: ${field}`);
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // If payment_type is Bank, check for bank uuid
    if (requestBody.payment_type === 'Bank' && !requestBody.bank) {
      console.error('Missing bank uuid for Bank payment type');
      return NextResponse.json({ error: 'Bank uuid is required for Bank payment type' }, { status: 400 });
    }

    const apiUrl = 'https://api.tyms.io/api/v1/create/sales';
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'accept': 'application/json',
      'content-type': 'application/json',
      'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY!,
    };

    console.log('Sending request to Tyms API:', {
      url: apiUrl,
      method: 'POST',
      headers: { ...headers, 'Authorization': 'Bearer [REDACTED]', 'secret-key': '[REDACTED]' },
      body: JSON.stringify(requestBody),
    });

    const tymsResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    console.log('Tyms API response status:', tymsResponse.status);

    if (!tymsResponse.ok) {
      let errorData;
      try {
        errorData = await tymsResponse.json();
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorData = await tymsResponse.text();
      }
      console.error('Tyms API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to create sale in Tyms',
        details: errorData
      }, { status: tymsResponse.status });
    }

    let responseData;
    try {
      responseData = await tymsResponse.json();
    } catch (parseError) {
      console.error('Error parsing success response:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in Tyms API response' }, { status: 500 });
    }

    console.log('Successfully created sale');
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Unexpected error creating sale:', error);
    return NextResponse.json({ 
      error: 'Failed to create sale',
      details: error.message
    }, { status: 500 });
  }
}