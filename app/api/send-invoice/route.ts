import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

  
  interface Customer {
    uuid: string;
    name: string;
    phone: string;
    email: string;
    type: string;
    business_name: string;
  }

export async function POST(req: NextRequest) {
  console.log('Received POST request to /api/send-invoice');

  const parseCustomer = (customerString: string): Customer => {
    return JSON.parse(customerString);
  };


  
  try {
      let requestBody;
      try {
          requestBody = await req.json();
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }
        
        // Validate required fields
        if (!requestBody.invoice) {
      console.error('Missing required field: invoice');
      return NextResponse.json({ error: 'Missing required field: invoice' }, { status: 400 });
    }
    
    const { invoice } = requestBody
    
    const customer = parseCustomer(invoice.customer);

    console.log({invoice})

      // Fetch PDF content
    let pdfContent;
    try {
      const pdfResponse = await fetch(invoice.invoice_url);
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
      }
      pdfContent = await pdfResponse.buffer();
    } catch (fetchError : any) {
      console.error('Error fetching PDF:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch invoice PDF',
        details: fetchError.message
      }, { status: 500 });
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Prepare email data
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: customer.email,
      subject: `Your Invoice for ${invoice.title}`,
      text: `Dear ${invoice.name},\n\nPlease find attached your invoice for ${invoice.title}.\n\nThank you for your business!`,
      attachments: pdfContent ? [
        {
          filename: 'invoice.pdf',
          content: pdfContent,
        },
      ] : [],
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      return NextResponse.json({ message: 'Invoice sent successfully' });
    } catch (emailError : any) {
      console.error('Error sending email:', emailError);
      
      // Determine the specific error
      let errorMessage = 'Failed to send email';
      let statusCode = 500;

      if (emailError.code === 'ECONNECTION') {
        errorMessage = 'Failed to connect to email server';
      } else if (emailError.code === 'EAUTH') {
        errorMessage = 'Email authentication failed';
      } else if (emailError.responseCode === 550) {
        errorMessage = 'Email address not found or rejected';
        statusCode = 400;
      }

      // Log the error details for debugging
      console.error('Email error details:', {
        code: emailError.code,
        responseCode: emailError.responseCode,
        command: emailError.command,
      });

      return NextResponse.json({ 
        error: errorMessage,
        details: emailError.message
      }, { status: statusCode });
    }

  } catch (error: any) {
    console.error('Unexpected error sending invoice:', error);
    return NextResponse.json({ 
      error: 'Failed to send invoice',
      details: error.message
    }, { status: 500 });
  }
}