import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';
import { RootState } from '@/app/store';

export default function CreatePurchaseContract() {
  const { t } = useTranslation();
  
  // Obtener el draft de purchase del estado global
  const purchaseDraft = useSelector((state: RootState) => state.contractDrafts.purchaseDraft);
  
  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <PurchaseContractForm 
        contractType="purchase" 
        mode="create" 
        initialContract={purchaseDraft || undefined}
      />
    </DashboardLayout>
  );
}