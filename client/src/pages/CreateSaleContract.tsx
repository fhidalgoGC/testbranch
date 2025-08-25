import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from '@/components/ui/button';
import { PurchaseContractForm } from "@/components/PurchaseContractForm/PurchaseContractForm";
import { RootState } from '@/app/store';
import { generateContractId } from '@/services/contractsService';
import { clearSaleDraft, setHasDraftSaleContract } from '@/features/contractDrafts/contractDraftsSlice';
import { clearContractDetailState, clearCreateSubContractState } from '@/store/slices/pageStateSlice';

export default function CreateSaleContract() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
  const [contractId, setContractId] = useState<string | undefined>();
  
  // Obtener el draft de sale del estado global
  const saleDraft = useSelector((state: RootState) => state.contractDrafts.saleDraft);
  const hasDraftSaleContract = useSelector((state: RootState) => state.contractDrafts.hasDraftSaleContract);
  
  // Función para generar nuevo contrato usando el servicio
  const handleGenerateContractId = async () => {
    const contractIdGenerated = await generateContractId();
    if (contractIdGenerated) {
      setContractId(contractIdGenerated);
    }
  };
  
  // Efecto para generar contractId solo si no hay draft de sale
  useEffect(() => {
    // Solo generar ID si no hay draft de sale cargado
    if (!saleDraft && !contractId) {
      handleGenerateContractId();
    }
  }, [saleDraft, contractId]);

  // Función para manejar cancelación completa
  const handleCancel = () => {
    console.log('🎯 === PÁGINA HANDLECANCEL LLAMADO ===');
    console.log('🧹 CreateSaleContract: Iniciando limpieza completa...');
    console.log('🔍 Estado ANTES de limpiar - hasDraftSaleContract:', hasDraftSaleContract);
    
    // 1. Limpiar contractId local
    setContractId(undefined);
    
    // 2. Limpiar draft (esto ya desactiva el flag automáticamente)
    console.log('🧹 Ejecutando clearSaleDraft...');
    dispatch(clearSaleDraft()); 
    
    // 3. Verificar si el flag se desactivó
    setTimeout(() => {
      const newState = JSON.parse(localStorage.getItem('contractDrafts') || '{}');
      console.log('🔍 Estado DESPUÉS de limpiar - localStorage:', newState);
      console.log('🔍 hasDraftSaleContract después de clearSaleDraft:', newState.hasDraftSaleContract);
    }, 100);
    
    // 4. Limpiar page state
    if (contractId) {
      console.log('🧹 Limpiando page state para contractId:', contractId);
      dispatch(clearContractDetailState(contractId));
      dispatch(clearCreateSubContractState(contractId));
    }
    
    // 5. Navegar con wouter (solo)
    console.log('🔄 Navegando a sale-contracts');
    setLocation('/sale-contracts');
    
    console.log('✅ CreateSaleContract: Limpieza completa finalizada');
    console.log('🎯 === FIN PÁGINA HANDLECANCEL ===');
  };

  return (
    <DashboardLayout title={t("createSaleContract")}>
      <div className="mb-4">
        <Button
          onClick={() => {
            console.log('🔍 === DEBUG SALE DRAFT STATE ===');
            console.log('saleDraft:', saleDraft);
            console.log('hasDraftSaleContract:', hasDraftSaleContract);
            console.log('contractId:', contractId);
            console.log('saleDraft keys:', saleDraft ? Object.keys(saleDraft) : 'null');
            console.log('localStorage contractDrafts:', JSON.parse(localStorage.getItem('contractDrafts') || '{}'));
            console.log('================================');
          }}
          className="bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200 flex items-center gap-2"
        >
          🔍 Debug Sale Draft
        </Button>
      </div>
      <PurchaseContractForm 
        key={`sale-form-${contractId || 'new'}-${Date.now()}`}
        contractType="sale" 
        mode="create" 
        initialContract={saleDraft || undefined}
        contractId={contractId}
        onCancel={handleCancel}
        onFormChange={(data) => {
          // Activar flag cuando se empiece a llenar el formulario desde la PÁGINA
          console.log('🔥 PÁGINA: onFormChange recibido', { data: !!data });
          console.log('🔥 PÁGINA: Activando hasDraftSaleContract = true por cambio en form');
          dispatch(setHasDraftSaleContract(true));
        }}
      />
    </DashboardLayout>
  );
}
