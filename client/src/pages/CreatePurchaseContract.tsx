import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';

export default function CreatePurchaseContract() {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('createPurchaseContract')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('createPurchaseContractDescription')}
          </p>
        </div>

        <PurchaseContractForm />
      </div>
    </DashboardLayout>
  );
}