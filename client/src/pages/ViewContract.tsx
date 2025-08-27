import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useRouter } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PurchaseContractForm } from '@/components/PurchaseContractForm/PurchaseContractForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PurchaseSaleContract } from '@/types/purchaseSaleContract.types';

export default function ViewContract() {
  const { t } = useTranslation();
  const params = useParams();
  const [location] = useLocation();
  const router = useRouter();
  const contractId = params.contractId;
  
  // Determinar el tipo de contrato desde la URL
  const contractType = location.includes('/purchase-contracts/') ? 'purchase' : 'sale';
  
  const [contractData, setContractData] = useState<PurchaseSaleContract | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener datos del contrato desde Redux según el tipo
  const contractsState = useSelector((state: any) => 
    contractType === 'purchase' 
      ? state.pageState.purchaseContracts 
      : state.pageState.saleContracts
  );
  const contractsData = contractsState?.contractsData || [];

  useEffect(() => {
    if (contractId && contractsData.length > 0) {
      // Buscar el contrato específico en los datos de Redux
      const foundContract = contractsData.find((contract: PurchaseSaleContract) => 
        contract._id === contractId
      );
      
      if (foundContract) {
        console.log('📄 CONTRACT VIEW: Contrato encontrado', foundContract);
        setContractData(foundContract);
      } else {
        console.warn('⚠️ CONTRACT VIEW: Contrato no encontrado en Redux');
      }
      setLoading(false);
    }
  }, [contractId, contractsData]);

  const handleCancel = () => {
    // Regresar al detalle del contrato
    router.push(`/${contractType}-contracts/${contractId}`);
  };

  if (loading) {
    return (
      <DashboardLayout title={t('viewContract')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contractData) {
    return (
      <DashboardLayout title={t('viewContract')}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contractNotFound')}
            </h1>
            <Button onClick={handleCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToContract')}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getPageTitle = () => {
    return contractType === 'purchase' 
      ? t('viewPurchaseContract') 
      : t('viewSaleContract');
  };

  return (
    <DashboardLayout title="">
      <div className="container mx-auto px-4 py-6">
        {/* Formulario en modo view */}
        <PurchaseContractForm
          contractType={contractType}
          mode="view"
          contractId={contractId}
          initialContract={contractData}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
}