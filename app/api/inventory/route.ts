import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/inventory');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory data' }, { status: 500 });
  }
}
