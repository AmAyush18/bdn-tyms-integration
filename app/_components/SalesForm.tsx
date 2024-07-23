"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Item {
  uuid: string;
  quantity: number;
  unit: string;
  cost_price: number;
  selling_price: number;
  name: string;
}

interface Tax {
  uuid: string;
  percent?: string;
  currency?: string;
}

interface Customer {
  uuid: string;
  name: string;
  business_name?: string;
  phone?: string;
  email?: string;
  type?: "Customer" | "Vendor" | "Employee" | "Contractor";
}

export default function SalesForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [tax, setTax] = useState<Tax | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentType, setPaymentType] = useState<"Cash" | "Bank">("Cash");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const addItem = () => {
    setItems([
      ...items,
      {
        uuid: uuidv4(),
        quantity: 1,
        unit: "",
        cost_price: 0,
        selling_price: 0,
        name: "",
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const saleData = {
      date: formData.get("date"),
      title: formData.get("title"),
      items: items,
      discount: formData.get("discount"),
      tax: tax,
      amount: parseFloat(formData.get("amount") as string),
      shipping_fee: formData.get("shipping_fee"),
      payment_type: paymentType,
      bank: paymentType === "Bank" ? formData.get("bank") : undefined,
      customer: customer,
      payment_terms: formData.get("payment_terms"),
      memo: formData.get("memo"),
      currency: formData.get("currency"),
      exchange_rate: parseFloat(formData.get("exchange_rate") as string) || 1,
      category: formData.get("category") || "Sales",
      branch: formData.get("branch"),
      project: formData.get("project"),
      department: formData.get("department"),
      source_uuid: formData.get("source_uuid"),
    };

    try {
      const response = await fetch("/api/create-sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        throw new Error("Failed to create sale");
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error creating sale:", error);
      setError("Failed to create sale. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Items</label>
        {items.map((item, index) => (
          <div key={item.uuid} className="mt-2 p-4 border rounded-md">
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(index, "name", e.target.value)}
              placeholder="Item name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", parseFloat(e.target.value))
              }
              placeholder="Quantity"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <input
              type="text"
              value={item.unit}
              onChange={(e) => updateItem(index, "unit", e.target.value)}
              placeholder="Unit"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              value={item.cost_price}
              onChange={(e) =>
                updateItem(index, "cost_price", parseFloat(e.target.value))
              }
              placeholder="Cost price"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              value={item.selling_price}
              onChange={(e) =>
                updateItem(index, "selling_price", parseFloat(e.target.value))
              }
              placeholder="Selling price"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove Item
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Item
        </button>
      </div>

      <div>
        <label
          htmlFor="discount"
          className="block text-sm font-medium text-gray-700"
        >
          Discount
        </label>
        <input
          type="text"
          id="discount"
          name="discount"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tax</label>
        <input
          type="text"
          value={tax?.uuid || ''} 
          onChange={(e) => setTax(prev => prev ? {...prev, uuid: e.target.value} : {uuid: e.target.value})} 
          placeholder="Tax UUID" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <input
          type="text"
          value={tax?.percent || ''} 
          onChange={(e) => setTax(prev => prev ? {...prev, percent: e.target.value} : {uuid: '', percent: e.target.value})} 
          placeholder="Tax percentage" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <input
          type="text"
          value={tax?.currency || ''} 
          onChange={(e) => setTax(prev => prev ? {...prev, currency: e.target.value} : {uuid: '', currency: e.target.value})} 
          placeholder="Tax currency" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="shipping_fee"
          className="block text-sm font-medium text-gray-700"
        >
          Shipping Fee
        </label>
        <input
          type="text"
          id="shipping_fee"
          name="shipping_fee"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="payment_type"
          className="block text-sm font-medium text-gray-700"
        >
          Payment Type
        </label>
        <select
          id="payment_type"
          name="payment_type"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value as "Cash" | "Bank")}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="Cash">Cash</option>
          <option value="Bank">Bank</option>
        </select>
      </div>

      {paymentType === "Bank" && (
        <div>
          <label
            htmlFor="bank"
            className="block text-sm font-medium text-gray-700"
          >
            Bank UUID
          </label>
          <input
            type="text"
            id="bank"
            name="bank"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Customer
        </label>
        <input
          type="text"
          value={customer?.uuid || ''} 
    onChange={(e) => setCustomer(prev => prev ? {...prev, uuid: e.target.value} : {uuid: e.target.value, name: ''})} 
    placeholder="Customer UUID"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <input
          type="text"
          value={customer?.name || ''} 
    onChange={(e) => setCustomer(prev => prev ? {...prev, name: e.target.value} : {uuid: '', name: e.target.value})} 
    placeholder="Customer name" 
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <input
          type="text"
          value={customer?.business_name || ''} 
          onChange={(e) => setCustomer(prev => prev ? {...prev, business_name: e.target.value} : {uuid: '', name: '', business_name: e.target.value})} 
          placeholder="Business name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <input
          type="tel"
          value={customer?.phone || ''} 
          onChange={(e) => setCustomer(prev => prev ? {...prev, phone: e.target.value} : {uuid: '', name: '', phone: e.target.value})} 
          placeholder="Phone number" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <input
          type="email"
          value={customer?.email || ''} 
          onChange={(e) => setCustomer(prev => prev ? {...prev, email: e.target.value} : {uuid: '', name: '', email: e.target.value})} 
          placeholder="Email address" 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <select 
          value={customer?.type || ''} 
          onChange={(e) => setCustomer(prev => prev ? {...prev, type: e.target.value as Customer['type']} : {uuid: '', name: '', type: e.target.value as Customer['type']})} 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">Select type</option>
          <option value="Customer">Customer</option>
          <option value="Vendor">Vendor</option>
          <option value="Employee">Employee</option>
          <option value="Contractor">Contractor</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="payment_terms"
          className="block text-sm font-medium text-gray-700"
        >
          Payment Terms
        </label>
        <input
          type="text"
          id="payment_terms"
          name="payment_terms"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="memo"
          className="block text-sm font-medium text-gray-700"
        >
          Memo
        </label>
        <textarea
          id="memo"
          name="memo"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="currency"
          className="block text-sm font-medium text-gray-700"
        >
          Currency
        </label>
        <input
          type="text"
          id="currency"
          name="currency"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="exchange_rate"
          className="block text-sm font-medium text-gray-700"
        >
          Exchange Rate
        </label>
        <input
          type="number"
          id="exchange_rate"
          name="exchange_rate"
          defaultValue="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <input
          type="text"
          id="category"
          name="category"
          defaultValue="Sales"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="branch"
          className="block text-sm font-medium text-gray-700"
        >
          Branch UUID
        </label>
        <input
          type="text"
          id="branch"
          name="branch"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="project"
          className="block text-sm font-medium text-gray-700"
        >
          Project UUID
        </label>
        <input
          type="text"
          id="project"
          name="project"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="department"
          className="block text-sm font-medium text-gray-700"
        >
          Department UUID
        </label>
        <input
          type="text"
          id="department"
          name="department"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="source_uuid"
          className="block text-sm font-medium text-gray-700"
        >
          Source UUID
        </label>
        <input
          type="text"
          id="source_uuid"
          name="source_uuid"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      {error && <div className="text-red-600 font-bold">{error}</div>}

      {success && (
        <div className="text-green-600 font-bold">
          Sale created successfully!
        </div>
      )}

      <div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Sale
        </button>
      </div>
    </form>
  );
}
