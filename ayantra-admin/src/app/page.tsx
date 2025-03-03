"use client"; 
import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import './styles.css';

// Define the Driver interface based on your schema
interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  car_image_url: string | null;
  car_seats: number;
  rating: number | null; // Allow rating to be null
}

const driverColumns: ColumnDef<Driver>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    cell: info => info.getValue()
  },
  {
    id: 'first_name',
    accessorKey: 'first_name',
    header: 'First Name',
    cell: info => info.getValue()
  },
  {
    id: 'last_name',
    accessorKey: 'last_name',
    header: 'Last Name',
    cell: info => info.getValue()
  },
  {
    id: 'profile_image',
    accessorKey: 'profile_image_url',
    header: 'Profile Image',
    cell: info => {
      const url = info.getValue() as string;
      return url ? (
        <div className="image-cell">
          <img src={url} alt="Profile" className="thumbnail" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="view-link">View</a>
        </div>
      ) : 'No Image';
    }
  },
  {
    id: 'car_image',
    accessorKey: 'car_image_url',
    header: 'Car Image',
    cell: info => {
      const url = info.getValue() as string;
      return url ? (
        <div className="image-cell">
          <img src={url} alt="Car" className="thumbnail" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="view-link">View</a>
        </div>
      ) : 'No Image';
    }
  },
  {
    id: 'car_seats',
    accessorKey: 'car_seats',
    header: 'Car Seats',
    cell: info => info.getValue()
  },
  {
    id: 'rating',
    accessorKey: 'rating',
    header: 'Rating',
    cell: info => {
      const rating = info.getValue() as number | null;
      return rating !== null && !isNaN(rating) ? (
        <div className="rating">
          <span className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={star <= Math.round(rating) ? "star filled" : "star"}>
                ★
              </span>
            ))}
          </span>
          <span className="rating-value">{rating.toFixed(1)}</span>
        </div>
      ) : 'No Rating';
    }
  }
];

// Main App Component
export default function App() {
  const [data, setData] = useState<Driver[]>([]);
  const [columns, setColumns] = useState<ColumnDef<Driver>[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<any>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Define our columns based on the known schema
    setColumns(driverColumns);
    
    async function loadDrivers() {
      setLoading(true);
      try {
        const response = await fetch('/api/drivers');
        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }
        const drivers = await response.json();
        console.log(drivers); // Log the data to verify its structure
        setData(drivers);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch drivers:', err);
        setError('Failed to load drivers. Please try again later.');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadDrivers();
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Function to get full name
  const getFullName = (driver: Driver) => {
    return `${driver.first_name} ${driver.last_name}`;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Drivers Dashboard</h1>
      </header>
      
      <main className="app-main">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Drivers</h2>
            <p className="subtitle">Displaying all drivers from the database</p>
          </div>
          
          {loading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="no-data-message">
              <p>No drivers found in the database.</p>
            </div>
          ) : (
            <>
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-title">Total Drivers</div>
                  <div className="stat-value">{data.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Average Rating</div>
                  <div className="stat-value">
                    {(data.reduce((sum, driver) => sum + (driver.rating || 0), 0) / data.length).toFixed(1)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Total Capacity</div>
                  <div className="stat-value">
                    {data.reduce((sum, driver) => sum + driver.car_seats, 0)} seats
                  </div>
                </div>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th 
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className="sortable-header"
                          >
                            <div className="header-content">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              <span className="sort-indicator">
                                {header.column.getIsSorted() === 'asc' ? '▲' : 
                                 header.column.getIsSorted() === 'desc' ? '▼' : ''}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="pagination-controls">
                <div className="pagination-info">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    data.length
                  )} of {data.length} results
                </div>
                
                <div className="pagination-buttons">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  
                  <span className="page-indicator">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Neon Database Dashboard © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}