import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';

export default function CreatePurchaseContract() {
  return (
    <DashboardLayout title="Crear Contrato de Compra">
      <PurchaseContractForm />
    </DashboardLayout>
  );
}