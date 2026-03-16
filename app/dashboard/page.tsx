import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export default async function DashboardPage() {
  let user: any = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      user = payload;
    }
  } catch {}
  if (!user) {
    redirect('/login');
  }
  return (
    <div className="max-w-xl mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <div>
        <div>Welcome, <b>{user?.name || user?.email}</b>!</div>
        <div>Role: <b>{user?.role}</b></div>
      </div>
    </div>
  );
}
