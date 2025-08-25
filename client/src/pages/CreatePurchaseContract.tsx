import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';
import { RootState } from '@/app/store';
import { generateContractId } from '@/services/contractsService';
import { clearPurchaseDraft, setHasDraftPurchaseContract } from '@/features/contractDrafts/contractDraftsSlice';
import { clearContractDetailState, clearCreateSubContractState } from '@/store/slices/pageStateSlice';

export default function CreatePurchaseContract() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
  const [contractId, setContractId] = useState<string | undefined>();
  
  // Obtener el draft de purchase del estado global
  const purchaseDraft = useSelector((state: RootState) => state.contractDrafts.purchaseDraft);
  const hasDraftPurchaseContract = useSelector((state: RootState) => state.contractDrafts.hasDraftPurchaseContract);
  
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
    console.log('🎯 === PÁGINA HANDLECANCEL LLAMADO ===');
    console.log('🧹 CreatePurchaseContract: Iniciando limpieza completa...');
    console.log('🔍 Estado ANTES de limpiar - hasDraftPurchaseContract:', hasDraftPurchaseContract);
    
    // 1. Limpiar contractId local
    setContractId(undefined);
    
    // 2. Limpiar draft (esto ya desactiva el flag automáticamente)
    console.log('🧹 Ejecutando clearPurchaseDraft...');
    dispatch(clearPurchaseDraft()); 
    
    // 3. Verificar si el flag se desactivó
    setTimeout(() => {
      const newState = JSON.parse(localStorage.getItem('contractDrafts') || '{}');
      console.log('🔍 Estado DESPUÉS de limpiar - localStorage:', newState);
      console.log('🔍 hasDraftPurchaseContract después de clearPurchaseDraft:', newState.hasDraftPurchaseContract);
    }, 100);
    
    // 4. Limpiar page state
    if (contractId) {
      console.log('🧹 Limpiando page state para contractId:', contractId);
      dispatch(clearContractDetailState(contractId));
      dispatch(clearCreateSubContractState(contractId));
    }
    
    // 5. Navegar con wouter (solo)
    console.log('🔄 Navegando a purchase-contracts');
    setLocation('/purchase-contracts');
    
    console.log('✅ CreatePurchaseContract: Limpieza completa finalizada');
    console.log('🎯 === FIN PÁGINA HANDLECANCEL ===');
  };

  return (
    <DashboardLayout title={t('createPurchaseContract')}>
      <div className="mb-4">
        <Button
          onClick={() => {
            console.log('🔍 === DEBUG PURCHASE DRAFT STATE ===');
            console.log('purchaseDraft:', purchaseDraft);
            console.log('hasDraftPurchaseContract:', hasDraftPurchaseContract);
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
        key={`purchase-form-${contractId || 'new'}-${Date.now()}`}
        contractType="purchase" 
        mode="create" 
        initialContract={purchaseDraft || undefined}
        contractId={contractId}
        onCancel={handleCancel}
        onFormChange={(data) => {
          // Activar flag cuando se empiece a llenar el formulario desde la PÁGINA
          console.log('🔥 PÁGINA: onFormChange recibido', { data: !!data });
          console.log('🔥 PÁGINA: Activando hasDraftPurchaseContract = true por cambio en form');
          dispatch(setHasDraftPurchaseContract(true));
        }}
      />
    </DashboardLayout>
  );
}