import * as Minio from 'minio';

// ─── MinIO client singleton ───────────────────────────────────────────────────
let minioClient: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }
  return minioClient;
}

export const MINIO_BUCKET = process.env.MINIO_BUCKET || 'vidscreener';

// ─── Object key builder (consistent path convention) ─────────────────────────
export function buildObjectKey(
  orgId: string,
  projectId: string,
  submissionId: string,
  filename: string
): string {
  return `org/${orgId}/project/${projectId}/submission/${submissionId}/${filename}`;
}

// ─── Ensure the bucket exists (call this on startup or first upload) ──────────
export async function ensureBucketExists(): Promise<void> {
  const client = getMinioClient();
  const exists = await client.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await client.makeBucket(MINIO_BUCKET, 'us-east-1');
  }
}

// ─── Pre-signed PUT URL (client uploads directly to MinIO) ───────────────────
export async function generateUploadUrl(
  objectKey: string,
  expirySeconds = 3600
): Promise<string> {
  const client = getMinioClient();
  await ensureBucketExists();
  return client.presignedPutObject(MINIO_BUCKET, objectKey, expirySeconds);
}

// ─── Pre-signed GET URL (evaluator streams video) ────────────────────────────
export async function generatePlaybackUrl(
  objectKey: string,
  expirySeconds = 3600
): Promise<string> {
  const client = getMinioClient();
  return client.presignedGetObject(MINIO_BUCKET, objectKey, expirySeconds);
}

// ─── Delete an object ────────────────────────────────────────────────────────
export async function deleteObject(objectKey: string): Promise<void> {
  const client = getMinioClient();
  await client.removeObject(MINIO_BUCKET, objectKey);
}
