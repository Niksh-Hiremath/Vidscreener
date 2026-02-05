import { SidebarProvider } from '@/lib/SidebarContext';
import { ReactNode } from 'react';

export default function EvaluatorLayout({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
