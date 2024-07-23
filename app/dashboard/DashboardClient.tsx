'use client';

import { useState } from 'react';
import SalesForm from '../_components/SalesForm'; // Make sure the path is correct

interface UserData {
  name: string;
  email: string;
  // Add other user data fields as needed
}

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useState<'overview' | 'createSale'>('overview');

    const handleGetInvoice = async (event: React.MouseEvent<HTMLButtonElement>)=> {
        try {
            const response = await fetch("https://api.tyms.io/api/v1/inventories", {
                method: "GET",
                headers: {
                "Content-Type": "application/json",
                'secret-key': process.env.NEXT_PUBLIC_TYMS_SECRET_KEY || ''
                },
            });
        
            if (!response.ok) {
                    console.log('Fatt gya')  
            }

            console.log({response})
        } catch (err) {
            console.log(err)
        }
    }


  return (
    // <div className="container mx-auto p-4">
    //   <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard </h1>
      
    //   <div className="mb-4">
    //     <button 
    //       onClick={() => setActiveTab('overview')}
    //       className={`mr-2 px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
    //     >
    //       Overview
    //     </button>
    //     <button 
    //       onClick={() => setActiveTab('createSale')}
    //       className={`px-4 py-2 rounded ${activeTab === 'createSale' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
    //     >
    //       Create Sale
    //     </button>
    //   </div>

    //   {activeTab === 'overview' && (
    //     <div>
    //       <h2 className="text-xl font-semibold mb-2">User Information</h2>

    //       <div className="mt-4">
    //         <h3 className="text-lg font-semibold">Recent Activity</h3>
    //         <p>No recent activity to display.</p>
    //       </div>
    //     </div>
    //   )}

    //   {activeTab === 'createSale' && (
    //     <div>
    //       <h2 className="text-xl font-semibold mb-2">Create a New Sale</h2>
    //       <SalesForm />
    //     </div>
    //   )}
    // </div>
    <button className='py-3 px-6 bg-blue-500 text-white hover:bg-opacity-85' onClick={(e) => handleGetInvoice(e)}>Get Inventory</button>
  );
}