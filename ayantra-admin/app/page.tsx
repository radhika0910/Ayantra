// app/page.tsx
import DriversTable from '../components/DriversTable';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Driver Directory</h1>
        <p className="text-gray-600 mb-8">Browse and find available drivers in your area</p>
        
        <div className="bg-white shadow rounded-lg p-6">
          <DriversTable />
        </div>
      </div>
    </main>
  );
}