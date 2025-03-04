// app/api/drivers/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const drivers = await prisma.drivers.findMany({
      orderBy: [
        { last_name: 'asc' },
        { first_name: 'asc' }
      ],
    });
    
    // Convert Prisma Decimal objects to plain numbers
    const serializedDrivers = drivers.map((driver: { rating: { toString: () => string; }; }) => ({
      ...driver,
      rating: parseFloat(driver.rating.toString())
    }));
    
    return NextResponse.json(serializedDrivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}