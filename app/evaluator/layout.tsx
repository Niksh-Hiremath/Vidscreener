import { SidebarProvider } from '@/lib/SidebarContext';
import { AuthProvider } from '@/lib/AuthContext';
import { ReactNode } from 'react';

export default function EvaluatorLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </AuthProvider>
  );
}
