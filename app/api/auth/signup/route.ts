import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const { email, password, full_name, role, organization_id } = await request.json();

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Signup failed' }, { status: 400 });
  }

  // Insert into users table
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    full_name,
    role,
    organization_id: organization_id || uuidv4(),
  });

  if (profileError) {
    // Rollback: delete the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ user: { id: authData.user.id, email, full_name, role } }, { status: 201 });
}
