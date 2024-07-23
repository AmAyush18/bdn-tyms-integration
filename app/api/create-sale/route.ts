import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshAccessToken } from '@/app/utils/refreshToken';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  let accessToken = cookieStore.get('tyms_access_token')?.value;

  if (!accessToken) {
    try {
      accessToken = await refreshAccessToken();
    } catch (error) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  }

  try {
    const saleData = await request.json();
    const response = await fetch('https://api.tyms.io/api/v1/create/sales', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY || ''
      },
      body: JSON.stringify(saleData)
    });

    if (response.status === 401) {
      // Token might be expired, try refreshing
      try {
        console.log('token expired, refreshing')
        accessToken = await refreshAccessToken();
        // Retry the request with the new token
        const retryResponse = await fetch('https://api.tyms.io/api/v1/create/sales', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY || ''
          },
          body: JSON.stringify(saleData)
        });
        
        if (!retryResponse.ok) {
          throw new Error('Failed to create sale after token refresh');
        }
        
        const data = await retryResponse.json();
        return NextResponse.json(data);
      } catch (refreshError) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
    }

    if (!response.ok) {
        console.log({response})
      throw new Error('Failed to create sale');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}