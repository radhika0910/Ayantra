// app/components/drivers/DriversTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { Driver } from '@/lib/types';

export default function DriversTable() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/drivers');
        const data = await res.json();
        setDrivers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading drivers data...</div>;
  }

  if (!drivers.length) {
    return <div className="text-center py-10">No drivers found</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-500">Drivers</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rides</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.first_name} {driver.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {driver.profile_image_url ? (
                    <img src={driver.profile_image_url} alt="Profile" className="h-10 w-10 rounded-full" />
                  ) : (
                    'No image'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {driver.car_image_url ? (
                    <img src={driver.car_image_url} alt="Car" className="h-10 w-10 rounded" />
                  ) : (
                    'No image'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.car_seats}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.rating}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {driver.rides ? driver.rides.length : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}