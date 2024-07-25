import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface InvoiceItem {
  uuid: string;
  quantity: number;
  selling_price: number;
  tax: {
    percent: string;
    currency: string;
  };
}

interface Customer {
  uuid: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  business_name: string;
}

interface Invoice {
  id: number;
  date: string;
  due_date: string;
  title: string;
  items: string; // JSON string
  customer: string; // JSON string
  invoice_note: string;
  amount: string;
  shipping_fee: string;
  category: string;
  payment_type: string;
  invoiceable: boolean;
  invoice_url: string;
  currency: string;
  created_at: string;
}

const HistoryPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/get-history-bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data);
      console.log({data})
    } catch (err) {
      setError('An error occurred while fetching invoices');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetInvoice = (invoiceUrl: string) => {
    console.log({invoiceUrl})
    window.open(invoiceUrl, '_blank');
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({invoice}),
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      alert('Invoice sent successfully!');
    } catch (err) {
      console.error('Error sending invoice:', err);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const parseCustomer = (customerString: string): Customer => {
    return JSON.parse(customerString);
  };

  const parseItems = (itemsString: string): InvoiceItem[] => {
    return JSON.parse(itemsString);
  };

  if (isLoading) return <div>Loading{'.'.repeat(3)}</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Invoice History</h1>
      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Due Date</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const customer = parseCustomer(invoice.customer);
                return (
                  <tr key={invoice.id} className="border-b">
                    <td className="px-4 py-2">{format(parseISO(invoice.date), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-2">{format(parseISO(invoice.due_date), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-2">{invoice.title}</td>
                    <td className="px-4 py-2">
                      <div>{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                    </td>
                    <td className="px-4 py-2">
                      {parseFloat(invoice.amount).toFixed(2)} {invoice.currency}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleGetInvoice(invoice.invoice_url)} // Assuming invoice_note contains the URL
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Get Invoice
                      </button>
                      <button
                        onClick={() => handleSendInvoice(invoice)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Send Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;