import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';

export default function CreatePurchaseContract() {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <PurchaseContractForm />
    </DashboardLayout>
  );
}