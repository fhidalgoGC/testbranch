import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from 'react-redux';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PurchaseContractForm } from "@/components/PurchaseContractForm/PurchaseContractForm";
import { RootState } from '@/app/store';
import { authenticatedFetch } from '@/utils/apiInterceptors';

export default function CreateSaleContract() {
  const { t } = useTranslation();
  const [contractId, setContractId] = useState<string | undefined>();
  
  // Obtener los drafts del estado global
  const purchaseDraft = useSelector((state: RootState) => state.contractDrafts.purchaseDraft);
  const saleDraft = useSelector((state: RootState) => state.contractDrafts.saleDraft);
  
  // Función para generar nuevo contrato
  const generateContractId = async () => {
    try {
      console.log('🆕 Generating new contract ID...');
      const response = await authenticatedFetch('https://trm-develop.grainchain.io/api/v1/contracts/sp-contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: ''
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Contract ID generated:', data.key);
      setContractId(data.key);
    } catch (error) {
      console.error('❌ Error generating contract ID:', error);
    }
  };
  
  // Efecto para generar contractId solo si no hay drafts
  useEffect(() => {
    // Solo generar ID si no hay ningún draft cargado (ni purchase ni sale)
    if (!purchaseDraft && !saleDraft && !contractId) {
      generateContractId();
    }
  }, [purchaseDraft, saleDraft, contractId]);

  return (
    <DashboardLayout title={t("createSaleContract")}>
      <PurchaseContractForm 
        contractType="sale" 
        mode="create" 
        initialContract={saleDraft || undefined}
        contractId={contractId}
      />
    </DashboardLayout>
  );
}
