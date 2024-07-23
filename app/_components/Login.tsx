'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/tyms-auth');
      const data = await response.json();

      console.log({data})

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Tyms</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}