import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useContractsPageState, usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Sellers() {
  const { t } = useTranslation();
  const { handleNavigateToPage } = useNavigationHandler();
  const { pageState, updateState } = useContractsPageState('sellers');
  usePageTracking('/sellers');
  
  // Notificar navegación jerárquica al cargar la página
  useEffect(() => {
    console.log('🔄 SELLERS PAGE: Cargando página y ejecutando navegación jerárquica');
    handleNavigateToPage('sellers');
  }, []);

  return (
    <DashboardLayout title={t('sellers')}>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {t('sellers')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('sellersDescription')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}