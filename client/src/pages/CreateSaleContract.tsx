import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from 'react-redux';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PurchaseContractForm } from "@/components/PurchaseContractForm/PurchaseContractForm";
import { RootState } from '@/app/store';

export default function CreateSaleContract() {
  const { t } = useTranslation();
  
  // Obtener el draft de sale del estado global
  const saleDraft = useSelector((state: RootState) => state.contractDrafts.saleDraft);

  return (
    <DashboardLayout title={t("createSaleContract")}>
      <PurchaseContractForm 
        contractType="sale" 
        mode="create" 
        initialContract={saleDraft || undefined}
      />
    </DashboardLayout>
  );
}
