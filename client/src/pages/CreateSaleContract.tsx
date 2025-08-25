import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from '@/components/ui/button';
import { PurchaseContractForm } from "@/components/PurchaseContractForm/PurchaseContractForm";
import { RootState } from '@/app/store';
import { generateContractId } from '@/services/contractsService';
import { clearSaleDraft } from '@/features/contractDrafts/contractDraftsSlice';
import { clearContractDetailState, clearCreateSubContractState } from '@/store/slices/pageStateSlice';

export default function CreateSaleContract() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
  const [contractId, setContractId] = useState<string | undefined>();
  
  // Obtener el draft de sale del estado global
  const saleDraft = useSelector((state: RootState) => state.contractDrafts.saleDraft);
  
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
    console.log('🧹 CreateSaleContract: Iniciando limpieza completa...');
    
    // 1. Limpiar contractId local
    setContractId(undefined);
    
    // 2. Limpiar draft
    if (saleDraft) {
      console.log('🧹 Limpiando sale draft');
      dispatch(clearSaleDraft());
    }
    
    // 3. Limpiar page state
    if (contractId) {
      console.log('🧹 Limpiando page state para contractId:', contractId);
      dispatch(clearContractDetailState(contractId));
      dispatch(clearCreateSubContractState(contractId));
    }
    
    // 4. Navegar con wouter (solo)
    console.log('🔄 Navegando a sale-contracts');
    setLocation('/sale-contracts');
    
    console.log('✅ CreateSaleContract: Limpieza completa finalizada');
  };

  return (
    <DashboardLayout title={t("createSaleContract")}>
      <div className="mb-4">
        <Button
          onClick={() => {
            console.log('🔍 === DEBUG SALE DRAFT STATE ===');
            console.log('saleDraft:', saleDraft);
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
        contractType="sale" 
        mode="create" 
        initialContract={saleDraft || undefined}
        contractId={contractId}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}
