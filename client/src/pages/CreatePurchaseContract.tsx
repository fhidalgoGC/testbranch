import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';
import { RootState } from '@/app/store';
import { generateContractId } from '@/services/contractsService';
import { clearPurchaseDraft } from '@/features/contractDrafts/contractDraftsSlice';
import { clearContractDetailState, clearCreateSubContractState } from '@/store/slices/pageStateSlice';

export default function CreatePurchaseContract() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
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
  
  // Función para manejar cancelación completa
  const handleCancel = () => {
    console.log('🧹 CreatePurchaseContract: FORZANDO desmontaje del componente');
    
    // 1. INMEDIATAMENTE navegar para desmontar componente
    setLocation('/purchase-contracts');
    
    // 2. Limpiar estados DESPUÉS del desmontaje (usando setTimeout)
    setTimeout(() => {
      console.log('🧹 Limpiando estados después del desmontaje...');
      
      // Limpiar contractId local
      setContractId(undefined);
      
      // Limpiar draft
      if (purchaseDraft) {
        console.log('🧹 Limpiando purchase draft - ANTES:', purchaseDraft);
        dispatch(clearPurchaseDraft());
        console.log('🧹 Draft limpiado');
      }
      
      // Limpiar page state
      if (contractId) {
        console.log('🧹 Limpiando page state para contractId:', contractId);
        dispatch(clearContractDetailState(contractId));
        dispatch(clearCreateSubContractState(contractId));
      }
      
      console.log('✅ CreatePurchaseContract: Limpieza completa finalizada');
    }, 100); // Pequeño delay para asegurar desmontaje
  };

  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <PurchaseContractForm 
        contractType="purchase" 
        mode="create" 
        initialContract={purchaseDraft || undefined}
        contractId={contractId}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}