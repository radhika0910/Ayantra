// components/DriversTable.tsx
'use client';

import { useState, useEffect } from 'react';

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  car_image_url: string | null;
  car_seats: number;
  rating: number;
}

export default function DriversTable() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const response = await fetch('/api/drivers');
        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }
        const data = await response.json();
        setDrivers(data);
      } catch (err) {
        setError('Error loading drivers data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDrivers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-medium">Loading drivers data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-medium text-red-600">{error}</div>
      </div>
    );
  }

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {halfStar && (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfGradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Driver</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Car</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Seats</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Rating</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {drivers.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                No drivers found.
              </td>
            </tr>
          ) : (
            drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {driver.profile_image_url ? (
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={driver.profile_image_url} 
                          alt={`${driver.first_name} ${driver.last_name}`} 
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        <span className="text-lg font-medium text-gray-600">
                          {driver.first_name.charAt(0)}{driver.last_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{driver.first_name} {driver.last_name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  {driver.car_image_url ? (
                    <img 
                      className="h-12 w-20 object-cover rounded" 
                      src={driver.car_image_url} 
                      alt="Driver's car" 
                    />
                  ) : (
                    <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-gray-700">
                  {driver.car_seats}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    {renderStars(driver.rating)}
                    <span className="mt-1 text-sm text-gray-600">
                      {driver.rating.toFixed(1)}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}