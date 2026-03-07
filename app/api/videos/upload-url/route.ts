import { NextResponse } from 'next/server';
import { generateUploadUrl, buildObjectKey } from '@/lib/minio';
import { v4 as uuidv4 } from 'uuid';

// POST /api/videos/upload-url (Publicly accessible for submitters)
export async function POST(request: Request) {
  const { organization_id, project_id, filename } = await request.json();

  if (!organization_id || !project_id || !filename) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // We don't have a submission ID until they submit the form, so we generate a temp ID 
  // just for the storage path to avoid collisions.
  const tempId = uuidv4();
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const objectKey = buildObjectKey(organization_id, project_id, tempId, safeFilename);

  try {
    const uploadUrl = await generateUploadUrl(objectKey, 3600); // 1 hour expiry
    return NextResponse.json({ uploadUrl, minio_object_key: objectKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
