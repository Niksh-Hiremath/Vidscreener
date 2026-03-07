import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Fetch single video by ID
  return NextResponse.json({ id, data: null });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Delete video by ID
  return NextResponse.json({ success: true, message: `Video ${id} deleted` });
}
