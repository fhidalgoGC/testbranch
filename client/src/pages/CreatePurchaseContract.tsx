import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
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
    console.log('🧹 CreatePurchaseContract: Iniciando limpieza completa...');
    
    // 1. Limpiar contractId local
    setContractId(undefined);
    
    // 2. Limpiar draft
    if (purchaseDraft) {
      console.log('🧹 Limpiando purchase draft');
      dispatch(clearPurchaseDraft());
    }
    
    // 3. Limpiar page state
    if (contractId) {
      console.log('🧹 Limpiando page state para contractId:', contractId);
      dispatch(clearContractDetailState(contractId));
      dispatch(clearCreateSubContractState(contractId));
    }
    
    // 4. Navegar con wouter (solo)
    console.log('🔄 Navegando a purchase-contracts');
    setLocation('/purchase-contracts');
    
    console.log('✅ CreatePurchaseContract: Limpieza completa finalizada');
  };

  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <div className="mb-4">
        <Button
          onClick={() => {
            console.log('🔍 === DEBUG PURCHASE DRAFT STATE ===');
            console.log('purchaseDraft:', purchaseDraft);
            console.log('contractId:', contractId);
            console.log('purchaseDraft keys:', purchaseDraft ? Object.keys(purchaseDraft) : 'null');
            console.log('localStorage contractDrafts:', JSON.parse(localStorage.getItem('contractDrafts') || '{}'));
            console.log('================================');
          }}
          className="bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200 flex items-center gap-2"
        >
          🔍 Debug Purchase Draft
        </Button>
      </div>
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