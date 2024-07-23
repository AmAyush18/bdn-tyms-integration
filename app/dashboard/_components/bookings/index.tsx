'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Bookings = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const handleCreateBooking = async () => {
    if (!selectedDate || !clientName || !clientEmail || !clientAddress) {
      alert('Please fill all fields and select 5 days');
      return;
    }

    try {
      const response = await fetch('/api/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dates: selectedDate,
          clientName,
          clientEmail,
          clientAddress,
        }),
      });

      if (response.ok) {
        alert('Booking created successfully!');
        // Reset form
        setSelectedDate(undefined);
        setClientName('');
        setClientEmail('');
        setClientAddress('');
      } else {
        alert('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred while creating the booking');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Create Booking</h2>
      <div className="py-2 px-2">
        <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
        />
      </div>
      <Input
        placeholder="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />
      <Input
        placeholder="Client Email"
        type="email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
      />
      <Input
        placeholder="Client Address"
        value={clientAddress}
        onChange={(e) => setClientAddress(e.target.value)}
      />
      <Button onClick={handleCreateBooking}>Create Booking</Button>
    </div>
  );
};