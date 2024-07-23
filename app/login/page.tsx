'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Login from '../_components/Login';

export default function LoginPage() {
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam === 'token_exchange_failed' 
        ? 'Failed to authenticate. Please try again.' 
        : 'An error occurred during login.');
    }
  }, [searchParams]);

  return (
    <div>
      <Login />
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}