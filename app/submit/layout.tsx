import { AuthProvider } from '@/lib/AuthContext';
import { SidebarProvider } from '@/lib/SidebarContext';
import { ReactNode } from 'react';

export default function SubmitLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </AuthProvider>
  );
}
