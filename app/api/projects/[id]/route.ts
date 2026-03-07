import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/projects/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from('projects')
    .select(`*, rubrics(*, rubric_criteria(*)), submission_forms(*, form_fields(*))`)
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ project: data });
}

// PUT /api/projects/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const serviceClient = createSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from('projects')
    .update({ name: body.name, description: body.description, status: body.status })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data });
}

// DELETE /api/projects/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { error } = await serviceClient.from('projects').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Project deleted' });
}
