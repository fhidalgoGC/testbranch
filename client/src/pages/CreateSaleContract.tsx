import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/layout/DashboardLayout";
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

  // Hook de desmontaje - se ejecuta SOLO al desmontar (sin dependencias para evitar proxy revoked)
  useEffect(() => {
    return () => {
      console.log('🧹 CreateSaleContract: Ejecutando cleanup final de desmontaje');
      
      // Usar dispatch directamente para limpiar todos los drafts
      dispatch(clearSaleDraft());
      if (contractId) {
        dispatch(clearContractDetailState(contractId));
        dispatch(clearCreateSubContractState(contractId));
      }
      
      console.log('✅ CreateSaleContract: Cleanup final completado');
    };
  }, []); // Array vacío para que solo se ejecute al desmontar

  // Función para manejar cancelación - solo navegar (cleanup automático por useEffect)
  const handleCancel = () => {
    console.log('🧹 CreateSaleContract: Navegando para desmontar componente');
    console.log('🧹 El cleanup se ejecutará automáticamente por useEffect');
    
    // Solo navegar - el cleanup se ejecuta automáticamente
    setLocation('/sale-contracts');
  };

  return (
    <DashboardLayout title={t("createSaleContract")}>
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
