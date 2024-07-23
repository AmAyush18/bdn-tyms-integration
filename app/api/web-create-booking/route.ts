import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';  // Adjust this import path as necessary
import { z } from 'zod';  // For input validation

// Define the schema for input validation
const BookingSchema = z.object({
  unit_type: z.string().max(50),
  name: z.string().max(100),
  email: z.string().email().max(100),
  phone: z.string().max(20),
  guests: z.number().int().positive(),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  special_requests: z.string().optional(),
  total_cost: z.number().positive().multipleOf(0.01),
});

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/bookings');

  try {
    const json = await request.json();
    console.log('Received data:', json);

    // Validate input
    const result = BookingSchema.safeParse(json);
    if (!result.success) {
      console.error('Validation error:', result.error);
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const booking = result.data;

    // Construct the SQL query
    const query = `
      INSERT INTO bookings (
        unit_type, name, email, phone, guests, 
        start_date, end_date, special_requests, total_cost, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, 
        (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Indian/Mauritius')
      ) RETURNING *;
    `;

    const values = [
      booking.unit_type,
      booking.name,
      booking.email,
      booking.phone,
      booking.guests,
      booking.start_date,
      booking.end_date,
      booking.special_requests || null,
      booking.total_cost,
    ];

    console.log('Executing query:', query);
    console.log('Query values:', values);

    const { rows } = await db.query(query, values);

    console.log('Inserted booking:', rows[0]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}