import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from 'react-redux';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PurchaseContractForm } from "@/components/PurchaseContractForm/PurchaseContractForm";
import { RootState } from '@/app/store';
import { generateContractId } from '@/services/contractsService';

export default function CreateSaleContract() {
  const { t } = useTranslation();
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

  // Función para manejar cancelación y limpiar contractId
  const handleCancel = () => {
    setContractId(undefined);
    // La navegación se maneja en PurchaseContractForm
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
