import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

// POST /api/forms/[id]/submit (Publicly accessible form submission)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = await params;
  const { submitter_name, submitter_email, responses, video_id } = await request.json();

  const serviceClient = createSupabaseServiceClient();

  // 1. Get the form to find project_id
  const { data: form, error: formError } = await serviceClient
    .from('submission_forms')
    .select('project_id')
    .eq('id', formId)
    .single();

  if (formError || !form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  // 2. Create the submission
  const { data: submission, error: subError } = await serviceClient
    .from('submissions')
    .insert({
      form_id: formId,
      project_id: form.project_id,
      submitter_name,
      submitter_email,
    })
    .select()
    .single();

  if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });

  // 3. Save field responses
  if (responses && Array.isArray(responses)) {
    const responseRows = responses.map((r) => ({
      submission_id: submission.id,
      field_id: r.field_id,
      response_text: r.response_text || null,
      response_json: r.response_json || null,
    }));
    await serviceClient.from('submission_responses').insert(responseRows);
  }

  // 4. Link pre-uploaded video to this submission if provided
  if (video_id) {
    await serviceClient
      .from('videos')
      .update({ submission_id: submission.id, status: 'uploaded' })
      .eq('id', video_id);
  }

  return NextResponse.json({ submission }, { status: 201 });
}
