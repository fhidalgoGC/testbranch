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
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-8">
          GrainChain
        </h1>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.key} href={item.path}>
                <div className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
                  isActive 
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-l-4 border-green-600" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{t(item.key)}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}