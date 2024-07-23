import axios from 'axios';
import { cookies } from 'next/headers';

export async function refreshAccessToken() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('tyms_refresh_token')?.value;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post('https://api.tyms.io/api/v1/oauth/refresh/token', 
      {
        refresh_token: refreshToken
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'secret-key': process.env.TYMS_SECRET_KEY
        }
      }
    );

    const { access_token, refresh_token } = response.data;

    // Update cookies with new tokens
    cookieStore.set('tyms_access_token', access_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600 // 1 hour, adjust based on Tyms token expiration time
    });
    
    if (refresh_token) {
      cookieStore.set('tyms_refresh_token', refresh_token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 days, adjust based on Tyms refresh token expiration time
      });
    }

    return access_token;
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}