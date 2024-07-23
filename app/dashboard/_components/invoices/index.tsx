"use client"

import React, { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type InvoiceFormInputs = {
  date: Date | undefined;
  title: string;
  items: {
    uuid: string;
    quantity: number;
    unit?: string;
    cost_price?: number;
    selling_price?: number;
    discount?: string;
    tax?: {
      percent: string;
      currency: string;
    };
  }[];
  customer: {
    uuid: string;
    name: string;
    business_name?: string;
    phone?: string;
    email?: string;
    type?: string;
  };
  invoice_note?: string;
  amount: number;
  shipping_fee?: string;
  category: string;
  due_date?: Date;
  payment_type?: string;
  bank?: string;
  note?: string;
  invoiceable?: boolean;
  currency: string;
  exchange_rate?: number;
  source_uuid?: string;
};

export const Invoices = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<InvoiceFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const onSubmit: SubmitHandler<InvoiceFormInputs> = async (data) => {
    setIsLoading(true);
    setResponseMessage('');

    try {
      const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          date: data.date ? format(data.date, 'yyyy-MM-dd') : undefined,
          due_date: data.due_date ? format(data.due_date, 'yyyy-MM-dd') : undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResponseMessage('Invoice created successfully!');
      } else {
        setResponseMessage(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setResponseMessage('Failed to create invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

    return (
  <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
    <h2 className="text-3xl font-semibold text-slate-900 mb-6">Create Invoice</h2>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Row 1: Date, Title, Amount */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <Controller
            control={control}
            name="date"
            rules={{ required: 'Date is required' }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <Input {...register('title', { required: 'Title is required' })} placeholder="Invoice Title" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount *</label>
          <Input type="number" step="0.01" {...register('amount', { required: 'Amount is required', min: 0 })} placeholder="0.00" />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>
      </div>

      {/* Row 2: Currency, Category, Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency *</label>
          <Controller
            name="currency"
            control={control}
            rules={{ required: 'Currency is required' }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <Input {...register('category', { required: 'Category is required' })} placeholder="Sales, etc" />
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <Controller
            control={control}
            name="due_date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>
      </div>

      {/* Customer Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input {...register('customer.uuid', { required: 'Customer UUID is required' })} placeholder="Customer UUID *" />
          <Input {...register('customer.name', { required: 'Customer name is required' })} placeholder="Customer Name *" />
          <Input {...register('customer.business_name')} placeholder="Business Name" />
          <Input {...register('customer.phone')} placeholder="Phone" />
          <Input {...register('customer.email')} placeholder="Email" />
          <Input {...register('customer.type')} placeholder="Type (Customer | Vendor | Employee | Contractor) *" />
        </div>
      </div>

      {/* Item Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Item Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input {...register('items.0.uuid', { required: 'Item UUID is required' })} placeholder="Item UUID *" />
          <Input type="number" step="0.01" {...register('items.0.quantity', { required: 'Quantity is required' })} placeholder="Quantity *" />
          <Input {...register('items.0.unit')} placeholder="Unit" />
          <Input type="number" step="0.01" {...register('items.0.cost_price')} placeholder="Cost Price" />
          <Input type="number" step="0.01" {...register('items.0.selling_price')} placeholder="Selling Price *" />
          <Input {...register('items.0.discount')} placeholder="Discount" />
          <Input {...register('items.0.tax.percent')} placeholder="Tax Percent *" />
          <Input {...register('items.0.tax.currency')} placeholder="Tax Currency *" />
        </div>
      </div>

      {/* Additional Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input {...register('shipping_fee')} placeholder="Shipping Fee" />
          <Input {...register('payment_type')} placeholder="Mode of Payment" />
          <Input {...register('bank')} placeholder="Bank" />
          <Input type="number" step="0.0001" {...register('exchange_rate')} placeholder="Exchange rate" />
          <Input {...register('source_uuid')} placeholder="Internal reference of your system" />
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoiceable</label>
            <Controller
              name="invoiceable"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select invoiceable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Note</label>
          <Textarea {...register('invoice_note')} placeholder="Additional notes..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <Textarea {...register('note')} placeholder="Additional note..." />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Invoice'}
      </Button>
    </form>

    {responseMessage && (
      <p className={`mt-4 text-center ${responseMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
        {responseMessage}
      </p>
    )}
  </div>
);
};