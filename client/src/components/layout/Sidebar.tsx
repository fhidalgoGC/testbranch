import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  ScrollText 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    key: 'buyers',
    icon: Users,
    path: '/buyers'
  },
  {
    key: 'sellers',
    icon: ShoppingCart,
    path: '/sellers'
  },
  {
    key: 'purchaseContracts',
    icon: FileText,
    path: '/purchase-contracts'
  },
  {
    key: 'saleContracts',
    icon: ScrollText,
    path: '/sale-contracts'
  }
];

export default function Sidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen shadow-sm">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
            GrainChain
          </h1>
          <div className="w-12 h-0.5 bg-gradient-to-r from-green-600 to-green-400 mt-2 rounded-full"></div>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.key} href={item.path}>
                <div className={cn(
                  "group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer relative overflow-hidden",
                  isActive 
                    ? "bg-gradient-to-r from-green-50 to-green-50/80 dark:from-green-900/30 dark:to-green-900/20 text-green-700 dark:text-green-400 shadow-sm ring-1 ring-green-200/50 dark:ring-green-700/50" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm"
                )}>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-600 to-green-500 rounded-r-full"></div>
                  )}
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  )} />
                  <span className={cn(
                    "font-medium transition-all duration-200",
                    isActive 
                      ? "text-green-800 dark:text-green-300" 
                      : "group-hover:text-gray-900 dark:group-hover:text-gray-200"
                  )}>
                    {t(item.key)}
                  </span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none"></div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}