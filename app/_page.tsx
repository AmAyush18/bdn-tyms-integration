'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"

const HomePage = ({accessToken} : {accessToken?: string}) => {
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (accessToken) {
            console.log('got accessToken')
            router.push('/dashboard');
        }
    }, [accessToken, router])

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

    if (accessToken) {
        return null; // or a loading spinner
    }

    return (
        <div className="w-full h-full min-h-screen flex items-center justify-center">
            <Button onClick={handleLogin}>Sign in</Button>
            {error && <p className='text-red-500 text-sm font-semibold mt-2'>{error}</p>}
        </div>
    )
}

export default HomePage