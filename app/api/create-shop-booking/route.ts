import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';  // Adjust this import path as necessary
import { z } from 'zod';  // For input validation
import nodemailer from 'nodemailer';
import { addDays, format } from 'date-fns';
import fetch from 'node-fetch'; 

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

        // Set date to today and due_date to 7 days later
        const today = new Date();
        const dueDate = addDays(today, 7);

        // Add date and due_date to invoiceData
        invoiceData.date = format(today, 'yyyy-MM-dd');
        invoiceData.due_date = format(dueDate, 'yyyy-MM-dd');
  
        // Convert number uuid to string if necessary
        invoiceData.items = invoiceData.items.map(item => ({
            ...item,
            uuid: item.uuid.toString(),
        }));
      
        const totalAmount = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.selling_price), 0);

        // Prepare data for create-invoice API
        const createInvoiceData = {
            date: invoiceData.date,
            due_date: invoiceData.due_date,
            title: invoiceData.title,
            amount: totalAmount,
            currency: invoiceData.currency,
            category: invoiceData.category,
            payment_type: invoiceData.payment_type,
            invoiceable: invoiceData.invoiceable,
            customer: {
                uuid: invoiceData.customer.uuid,
                name: invoiceData.customer.name,
                email: invoiceData.customer.email,
                phone: invoiceData.customer.phone,
                type: invoiceData.customer.type,
            },
            items: invoiceData.items.map(item => ({
                uuid: item.uuid,
                quantity: item.quantity,
                selling_price: item.selling_price,
                tax: item.tax,
            })),
            shipping_fee: invoiceData.shipping_fee,
            invoice_note: invoiceData.invoice_note,
        };
  
        console.log('Prepared data for create-invoice:', createInvoiceData);
  
        // Call /create-invoice API
        const invoiceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createInvoiceData),
        });
    
        console.log('Invoice API response status:', invoiceResponse.status);

        const responseText = await invoiceResponse.text();
        console.log('Raw response from create-invoice:', responseText);
  
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (jsonError) {
            console.error('Failed to parse response as JSON:', jsonError);
            return NextResponse.json({ 
                error: 'Invalid JSON response from invoice creation', 
                details: responseText 
            }, { status: 500 });
        }
  
        if (!invoiceResponse.ok) {
            console.error('Failed to create invoice:', responseData);
            return NextResponse.json({ 
                error: 'Failed to create invoice', 
                details: responseData 
            }, { status: invoiceResponse.status });
        }
  
        console.log('Created invoice:', responseData);

        // Save invoice data to database
        const query = `
            INSERT INTO "invoices" (
                date, due_date, title, items, customer, invoice_note,
                amount, shipping_fee, category, payment_type, invoiceable, currency, invoice_url
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            ) RETURNING *;
        `;
  
        const values = [
            invoiceData.date,
            invoiceData.due_date,
            invoiceData.title,
            JSON.stringify(invoiceData.items),
            JSON.stringify(invoiceData.customer),
            invoiceData.invoice_note,
            totalAmount,
            invoiceData.shipping_fee,
            invoiceData.category,
            invoiceData.payment_type,
            invoiceData.invoiceable,
            invoiceData.currency,
            responseData.data.invoice_url,
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

        // Fetch PDF content
        let pdfContent;
        try {
            const pdfResponse = await fetch(responseData.data.invoice_url);
            if (!pdfResponse.ok) {
                throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
            }
            pdfContent = await pdfResponse.buffer();
        } catch (fetchError) {
            console.error('Error fetching PDF:', fetchError);
        }
  
        // Send email with invoice
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
  
        try {
            transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: invoiceData.customer.email,
                subject: `Your Invoice for ${invoiceData.title}`,
                text: `Dear ${invoiceData.customer.name},\n\nPlease find attached your invoice for ${invoiceData.title}.\n\nThank you for your business!`,
                attachments: pdfContent ? [
                    {
                        filename: 'invoice.pdf',
                        content: pdfContent,
                    },
                ] : [],
            });
            console.log('Email sent successfully');
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }
  
        console.log('Invoice URL:', responseData.data.invoice_url);

        return NextResponse.json({ 
            message: 'Booking created and invoice sent',
            invoice_url: responseData.data.invoice_url
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error processing booking:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}