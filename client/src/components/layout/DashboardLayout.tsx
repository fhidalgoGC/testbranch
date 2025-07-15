import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import NavBar from './NavBar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Bar */}
        <NavBar title={title} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}