import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // Clear session cookies
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');

  return NextResponse.json({ message: 'Logged out' });
}
