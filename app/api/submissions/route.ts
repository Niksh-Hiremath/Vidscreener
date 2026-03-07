import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // TODO: Fetch submissions from database
  return NextResponse.json({ submissions: [] });
}

export async function POST(request: Request) {
  // TODO: Create a new submission
  return NextResponse.json({ success: true, message: 'Submission created' }, { status: 201 });
}
