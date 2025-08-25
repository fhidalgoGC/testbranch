import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';
import { generateContractId } from '@/services/contractsService';

export default function CreatePurchaseContract() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [contractId, setContractId] = useState<string | undefined>();
  
  // Función para generar nuevo contrato usando el servicio
  const handleGenerateContractId = async () => {
    console.log('🆔 Generating new contract ID...');
    const contractIdGenerated = await generateContractId();
    if (contractIdGenerated) {
      console.log('✅ Contract ID generated:', contractIdGenerated);
      setContractId(contractIdGenerated);
    }
  };
  
  // Siempre generar contractId al montar el componente
  useEffect(() => {
    handleGenerateContractId();
  }, []);
  
  // Función para manejar cancelación - solo navegar
  const handleCancel = () => {
    console.log('🧹 CreatePurchaseContract: Navegando a purchase-contracts');
    setLocation('/purchase-contracts');
  };

  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <PurchaseContractForm 
        contractType="purchase" 
        mode="create" 
        contractId={contractId}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}