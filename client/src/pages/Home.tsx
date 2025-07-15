import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout title={t('dashboard')}>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t('welcome')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('welcomeMessage')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {t('buyers')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('manageBuyers')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {t('sellers')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('manageSellers')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {t('purchaseContracts')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('managePurchaseContracts')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {t('saleContracts')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('manageSaleContracts')}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}