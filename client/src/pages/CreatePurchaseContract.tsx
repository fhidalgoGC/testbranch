import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';
import { RootState } from '@/app/store';
import { generateContractId } from '@/services/contractsService';

export default function CreatePurchaseContract() {
  const { t } = useTranslation();
  const [contractId, setContractId] = useState<string | undefined>();
  
  // Obtener el draft de purchase del estado global
  const purchaseDraft = useSelector((state: RootState) => state.contractDrafts.purchaseDraft);
  
  // Función para generar nuevo contrato usando el servicio
  const handleGenerateContractId = async () => {
    const contractIdGenerated = await generateContractId();
    if (contractIdGenerated) {
      setContractId(contractIdGenerated);
    }
  };
  
  // Efecto para generar contractId solo si no hay draft de purchase
  useEffect(() => {
    // Solo generar ID si no hay draft de purchase cargado
    if (!purchaseDraft && !contractId) {
      handleGenerateContractId();
    }
  }, [purchaseDraft, contractId]);
  
  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <PurchaseContractForm 
        contractType="purchase" 
        mode="create" 
        initialContract={purchaseDraft || undefined}
        contractId={contractId}
      />
    </DashboardLayout>
  );
}