import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  console.log('Received GET request to /api/get-invoices');

  try {
    const query = `
      SELECT * FROM invoices
      ORDER BY date DESC
      LIMIT 100
    `;

    const { rows } = await db.query(query);

    console.log('Successfully fetched invoices');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Unexpected error fetching invoices:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch invoices',
      details: error.message
    }, { status: 500 });
  }
}