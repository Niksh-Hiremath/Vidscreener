'use client';

import { useSidebar } from '@/lib/SidebarContext';
import { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export default function MainContent({ children, className = '' }: MainContentProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'} ${className}`}>
      {children}
    </div>
  );
}
