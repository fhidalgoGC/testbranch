import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function PurchaseContracts() {
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t('purchaseContracts')}>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {t('purchaseContracts')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('purchaseContractsDescription')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}