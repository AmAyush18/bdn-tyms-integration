"use client"

import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button"; // Make sure you have this component

interface Invoice {
  uuid: string;
  date: string;
  narration: string;
  transaction_amount: number;
  currency: string;
  balance: number;
  invoice_url: string; // Add this field
}

export const Main = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
  try {
    const response = await fetch('/api/get-invoices');
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    const data = await response.json();
    if (Array.isArray(data.data?.data)) {
      setInvoices(data.data.data);
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      throw new Error('Invalid data format');
    }
  } catch (err: any) {
    setError(err.message || 'Error fetching invoices. Please try again later.');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await fetchInvoices();
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [fetchInvoices]);

  // Prepare data for the graph
  const graphData = invoices.map(invoice => ({
    title: invoice.narration,
    amount: invoice.transaction_amount
  }));

  if (isLoading) return <p>Loading invoices...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (invoices.length === 0) return <p>No invoices found.</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold text-slate-900 mb-6">Invoice Dashboard</h2>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData}>
              <XAxis dataKey="title" />
              <YAxis />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Table>
        <TableCaption>A list of your recent invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.uuid}>
              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
              <TableCell>{invoice.narration}</TableCell>
              <TableCell>{invoice.transaction_amount.toFixed(2)}</TableCell>
              <TableCell>{invoice.currency}</TableCell>
              <TableCell>{invoice.balance.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  onClick={() => window.open(invoice.invoice_url, '_blank')}
                >
                  Download PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};