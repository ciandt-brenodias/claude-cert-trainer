import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  immersive?: boolean;
}

export function AppShell({ children, immersive = false }: AppShellProps) {
  if (immersive) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
