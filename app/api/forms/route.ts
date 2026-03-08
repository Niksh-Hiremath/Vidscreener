import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/forms
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await serviceClient.from('users').select('organization_id').eq('id', user.id).single();

  const { data, error } = await serviceClient
    .from('submission_forms')
    .select('*, projects!inner(organization_id, name)')
    .eq('projects.organization_id', profile?.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ forms: data });
}

// POST /api/forms (create form + fields)
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { project_id, title, instructions, requires_video, requires_documents, fields } = await request.json();

  const serviceClient = createSupabaseServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: form, error: formError } = await serviceClient.from('submission_forms').insert({
    project_id,
    title,
    instructions,
    requires_video,
    requires_documents,
  }).select().single();

  if (formError) return NextResponse.json({ error: formError.message }, { status: 500 });

  if (fields && Array.isArray(fields) && fields.length > 0) {
    const fieldRows = fields.map((f: any, idx: number) => ({
      form_id: form.id,
      label: f.label,
      field_type: f.field_type,
      options: f.options || null,
      is_required: f.is_required || false,
      order_index: idx,
    }));
    await serviceClient.from('form_fields').insert(fieldRows);
  }

  const { data: fullForm } = await serviceClient
    .from('submission_forms')
    .select('*, form_fields(*)')
    .eq('id', form.id)
    .single();

  return NextResponse.json({ form: fullForm }, { status: 201 });
}
