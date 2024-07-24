import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';  // Adjust this import path as necessary
import { z } from 'zod';  // For input validation
import nodemailer from 'nodemailer';

// Define the schema for input validation
const InvoiceSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  due_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  title: z.string().max(100),
  items: z.array(z.object({
    uuid: z.union([z.string(), z.number()]), // Accept both string and number
    quantity: z.number().int().positive(),
    selling_price: z.number().positive(),
    tax: z.object({
      percent: z.string(),
      currency: z.string(),
    }),
  })),
  customer: z.object({
    uuid: z.string().uuid(),
    name: z.string().max(100),
    phone: z.string().max(20),
    email: z.string().email().max(100),
    type: z.string().max(50),
    business_name: z.string().optional(),
  }),
  invoice_note: z.string().optional(),
  amount: z.number().positive(),
  shipping_fee: z.string(),
  category: z.string().max(50),
  payment_type: z.string().max(50),
  invoiceable: z.boolean(),
  currency: z.string().max(3),
});

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
    console.log('Received POST request to /api/create-shop-booking');

    // Debug: Log all cookies
    const cookieStore = cookies();
    console.log('All cookies:', cookieStore.getAll());

    const accessToken = cookieStore.get('tyms_access_token')?.value;
    console.log('Access token from cookie:', accessToken);

    if (!accessToken) {
    console.error('Access token not found in cookies');
    return NextResponse.json({ error: 'Unauthorized: No access token found' }, { status: 401 });
    }
  
    try {
      const json = await request.json();
      console.log('Received data:', json);
  
      // Validate input
      const result = InvoiceSchema.safeParse(json);
      if (!result.success) {
        console.error('Validation error:', result.error);
        return NextResponse.json({ error: 'Invalid input', details: result.error.errors }, { status: 400 });
      }
  
      const invoiceData = result.data;
  
      // Convert number uuid to string if necessary
      invoiceData.items = invoiceData.items.map(item => ({
        ...item,
        uuid: item.uuid.toString(), // Convert to string
      }));
  
      // Save invoice data to database
      const query = `
        INSERT INTO "invoices" (
          date, due_date, title, items, customer, invoice_note,
          amount, shipping_fee, category, payment_type, invoiceable, currency
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *;
      `;
  
      const values = [
        invoiceData.date,
        invoiceData.due_date,
        invoiceData.title,
        JSON.stringify(invoiceData.items),
        JSON.stringify(invoiceData.customer),
        invoiceData.invoice_note,
        invoiceData.amount,
        invoiceData.shipping_fee,
        invoiceData.category,
        invoiceData.payment_type,
        invoiceData.invoiceable,
        invoiceData.currency,
      ];
  
      console.log('Executing query:', query);
      console.log('Query values:', values);
  
      try {
        const { rows } = await db.query(query, values);
        console.log('Inserted invoice:', rows[0]);
      } catch (dbError: any) {
        console.error('Database error:', dbError);
        return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
      }
  
      // Call /create-invoice API
      const invoiceResponse = await fetch('http://localhost:3000/api/create-invoice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `tyms_access_token=${accessToken}`,  
            },
        body: JSON.stringify({invoiceData}),
      });
    
      const resultInvoice = await invoiceResponse.json()

      if (!invoiceResponse.ok) {
          console.log(resultInvoice.error)
        // console.log({invoiceResponse})
        throw new Error('Failed to create invoice');
      }
  
      const invoice = await invoiceResponse.json();
  
      // Send email with invoice
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
  
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: invoiceData.customer.email,
        subject: `Your Invoice for ${invoiceData.title}`,
        text: `Dear ${invoiceData.customer.name},\n\nPlease find attached your invoice for ${invoiceData.title}.\n\nThank you for your business!`,
        attachments: [
          {
            filename: 'invoice.pdf',
            content: invoice.pdf, // Assuming the /create-invoice API returns the PDF content
          },
        ],
      });
  
      return NextResponse.json({ message: 'Booking created and invoice sent' }, { status: 201 });
    } catch (error: any) {
      console.error('Error processing booking:', error);
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
  }