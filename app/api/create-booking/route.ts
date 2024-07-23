import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('tyms_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookingData = await req.json();

  try {
    // Create invoice in Tyms
    const tymsResponse = await fetch('https://api.tyms.io/api/v1/create/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY!, // Add this line
      },
      body: JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        title: `Booking for ${bookingData.clientName}`,
        items: [
          {
            name: '5-day booking',
            quantity: 1,
            selling_price: 500, // Replace with actual price
          }
        ],
        customer: {
          name: bookingData.clientName,
          email: bookingData.clientEmail,
        },
        amount: 500, // Replace with actual amount
        category: 'Sales',
      }),
    });

    if (!tymsResponse.ok) {
      throw new Error('Failed to create invoice in Tyms');
    }

    // Here you would typically also save the booking to your own database

    return NextResponse.json({ message: 'Booking created successfully' });
  } catch (error : any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}