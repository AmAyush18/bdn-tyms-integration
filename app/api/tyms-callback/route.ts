import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  console.log('Callback route hit');
  const searchParams = request.nextUrl.searchParams;
  const authorizationCode = searchParams.get('authorization_code');
  const businessId = searchParams.get('business_id');

  console.log('Received params:', { authorizationCode, businessId });

  if (!authorizationCode || !businessId) {
    console.log('Missing required parameters');
    return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
  }

  try {
    console.log('Attempting token exchange');
    const response = await axios.post('https://api.tyms.io/api/v1/oauth/access/token', 
      {
        authorization_code: authorizationCode,
        business_id: businessId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY
        }
      }
    );

    console.log('Token exchange response:', JSON.stringify(response.data, null, 2));

    const { data } = response.data;  // The tokens are nested in a 'data' property
    const { access_token, refresh_token } = data;

    if (!access_token || !refresh_token) {
      console.log('Missing tokens in response');
      return NextResponse.redirect(new URL('/login?error=invalid_token_response', request.url));
    }

    // Create a response and set the cookies
    console.log('About to redirect to:', new URL('/dashboard', request.url).toString());
    const res = NextResponse.redirect(new URL('/dashboard', request.url));
    res.cookies.set('tyms_access_token', access_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.cookies.set('tyms_refresh_token', refresh_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    console.log('Final redirect URL:', res.headers.get('Location'));
    return res;
  } catch (error: any) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
  }
}