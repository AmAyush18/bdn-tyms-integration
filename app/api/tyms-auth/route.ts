import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_TYMS_PUBLIC_KEY;
  const secretKey = process.env.NEXT_PUBLIC_TYMS_SECRET_KEY;

  if (!clientId || !secretKey) {
    return NextResponse.json({ error: 'Missing client ID or secret key' }, { status: 500 });
  }

  const authUrl = `https://api.tyms.io/api/v1/oauth/authorization`;
  const params = new URLSearchParams({
    reference: 'bdn-tyms',
    client_id: clientId,
    redirect_uri: process.env.NEXT_PUBLIC_TYMS_REDIRECT_URI || '',
    terms_url: process.env.NEXT_PUBLIC_TYMS_TERMS_URL || '',
    privacy_url: process.env.NEXT_PUBLIC_TYMS_PRIVACY_URL || ''
  });

  try {
    const response = await axios.get(`${authUrl}?${params}`, {
      headers: {
        'secret-key': secretKey
      }
    });

    // Instead of returning the data directly, return the URL to redirect to
    console.log(response.data.data)
    return NextResponse.json({ redirectUrl: response.data.data });
  } catch (error : any) {
    console.error('Error during authentication:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}