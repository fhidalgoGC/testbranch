import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';
import { generateContractId, submitContract } from '@/services/contractsService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CreatePurchaseContract() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [contractId, setContractId] = useState<string | undefined>();
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  
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

  // Función para manejar submit del contrato
  const handleSubmitContract = async (contractData: any) => {
    if (!contractId) {
      throw new Error('No contract ID available');
    }

    console.log('📝 CreatePurchaseContract: Submitting contract', contractId);
    const result = await submitContract(contractId, contractData);
    
    if (result.success) {
      console.log('✅ Contract submitted successfully, redirecting...');
      setLocation('/purchase-contracts');
    } else {
      console.error('❌ Contract submission failed:', result.error);
      setErrorModal({
        open: true,
        message: result.error || 'Error desconocido al crear el contrato'
      });
      throw new Error(result.error);
    }
  };

  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <PurchaseContractForm 
        contractType="purchase" 
        mode="create" 
        contractId={contractId}
        onCancel={handleCancel}
        onSubmitContract={handleSubmitContract}
      />
      
      {/* Error Modal */}
      <AlertDialog open={errorModal.open} onOpenChange={(open) => setErrorModal(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error al crear contrato</AlertDialogTitle>
            <AlertDialogDescription>
              {errorModal.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorModal({ open: false, message: '' })}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}