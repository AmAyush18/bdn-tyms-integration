'use client';

import { useState, useEffect } from 'react';

export const Turnover = () => {
  const [turnover, setTurnover] = useState<number | null>(null);

  useEffect(() => {
    const fetchTurnover = async () => {
      try {
        const response = await fetch('/api/get-turnover');
        if (response.ok) {
          const data = await response.json();
          setTurnover(data.turnover);
        } else {
          console.error('Failed to fetch turnover');
        }
      } catch (error) {
        console.error('Error fetching turnover:', error);
      }
    };

    fetchTurnover();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold">Total Turnover</h2>
      {turnover !== null ? (
        <p className="text-3xl font-bold">${turnover.toFixed(2)}</p>
      ) : (
        <p>Loading turnover...</p>
      )}
    </div>
  );
};