import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase';

// GET /api/forms/[id] (Publicly accessible for submitters filling the form)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceClient = createSupabaseServiceClient();

  const { data, error } = await serviceClient
    .from('submission_forms')
    .select('*, projects(name, description), form_fields(*)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  if (!data.is_active) return NextResponse.json({ error: 'Form is no longer active' }, { status: 400 });

  return NextResponse.json({ form: data });
}
