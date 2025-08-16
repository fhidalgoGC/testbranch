import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Package, FileText } from 'lucide-react';
import { Link } from 'wouter';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { formatNumber } from '@/lib/numberFormatter';
import { NUMBER_FORMAT_CONFIG } from '@/environment/environment';
import { authenticatedFetch } from '@/utils/apiInterceptors';
import { QuantityActualOverview } from '@/components/contracts/QuantityActualOverview';

// Create a simple view schema (no validation needed for view mode)
const viewSubContractSchema = z.object({
  contractNumber: z.string(),
  contractDate: z.string(),
  customerNumber: z.string(),
  idContract: z.string(),
  referenceNumber: z.string(),
  commodity: z.string(),
  contact: z.string().optional(),
  shipmentPeriod: z.string().optional(),
  future: z.number().optional(),
  basis: z.number(),
  price: z.number(),
  totalPrice: z.number(),
  totalDate: z.string(),
  quantity: z.number(),
  measurementUnitId: z.string(),
});

type ViewSubContractFormData = z.infer<typeof viewSubContractSchema>;

interface ContractData {
  contractNumber: string;
  contractDate: string;
  customerNumber: string;
  idContract: string;
  referenceNumber: string;
  commodity: string;
  quantityUnits: number;
  price: number;
  basis: number;
  future: number;
  contact: string;
  shipmentPeriod: string;
}

interface SubContractData {
  _id: string;
  folio: string;
  quantity: number;
  measurement_unit_id: string;
  measurement_unit: string;
  price_schedule: Array<{
    pricing_type: string;
    price: number;
    basis: number;
    future_price: number;
    option_month: string;
    option_year: number;
  }>;
  total_price: number;
  sub_contract_date: string;
}

export default function ViewSubContract() {
  const { t } = useTranslation();
  const params = useParams();
  const [location, setLocation] = useLocation();
  
  const contractId = params.contractId;
  const subContractId = params.subContractId;
  
  const { handleNavigateToPage } = useNavigationHandler();
  
  // Obtener contratos del state de Redux para buscar el contrato actual
  const contractsState = useSelector((state: any) => state.pageState.purchaseContracts);
  const contractsData = contractsState.contractsData || [];
  
  // Obtener el estado del contrato principal para visualizar sub-contrato
  const editSubContractState = useSelector((state: any) => state.pageState.editSubContract[contractId!]);
  const parentContractData = editSubContractState?.parentContractData;
  const subContractsData = editSubContractState?.subContractsData || [];
  const currentSubContractData = editSubContractState?.currentSubContractData;
  
  // Use the specific sub-contract data from Redux state
  const currentSubContract = currentSubContractData;
  
  usePageTracking(`/purchase-contracts/${contractId}/sub-contracts/${subContractId}/view`);
  
  // State management
  const [contractData, setContractData] = useState<ContractData>({
    contractNumber: '',
    contractDate: '',
    customerNumber: '',
    idContract: '',
    referenceNumber: '',
    commodity: '',
    quantityUnits: 0,
    price: 0,
    basis: 0,
    future: 0,
    contact: '',
    shipmentPeriod: ''
  });
  
  // Load measurement units
  const { 
    data: measurementUnits = [], 
    isLoading: loadingUnits, 
    error: unitsError 
  } = useMeasurementUnits();
  
  // Available inventory calculation
  const availableInventory = parentContractData?.inventory?.open || 0;

  // React Hook Form setup for read-only mode
  const form = useForm<ViewSubContractFormData>({
    resolver: zodResolver(viewSubContractSchema),
    defaultValues: {
      contractNumber: '',
      contractDate: '',
      customerNumber: '',
      idContract: '',
      referenceNumber: '',
      commodity: '',
      contact: '',
      shipmentPeriod: '',
      future: 0,
      basis: 0,
      price: 0,
      totalPrice: 0,
      totalDate: '',
      quantity: 0,
      measurementUnitId: '',
    }
  });

  const { control, setValue, formState: { errors } } = form;

  // Navigate to parent contract detail
  const handleBackToContract = () => {
    handleNavigateToPage('contractDetail', contractId);
    setLocation(`/purchase-contracts/${contractId}`);
  };

  // Load parent contract data and current sub-contract data when component mounts
  useEffect(() => {
    if (contractId && subContractId) {
      console.log('🔍 VIEW SUB-CONTRACT: Loading contract and sub-contract data', { contractId, subContractId });
      
      // Find parent contract data from Redux state
      const foundContract = contractsData.find((contract: any) => contract._id === contractId);
      
      if (foundContract) {
        console.log('🔍 Parent contract found in Redux:', foundContract);
        
        // Set contract data for display
        const newContractData = {
          contractNumber: foundContract.folio || '',
          contractDate: foundContract.contract_date ? new Date(foundContract.contract_date).toLocaleDateString() : '',
          customerNumber: foundContract.participants?.find((p: any) => p.role === 'buyer')?.name || '',
          idContract: foundContract.folio || '',
          referenceNumber: foundContract.reference_number || 'N/A',
          commodity: foundContract.commodity?.name || '',
          quantityUnits: foundContract.quantity || 0,
          price: foundContract.price_schedule?.[0]?.price || 0,
          basis: foundContract.price_schedule?.[0]?.basis || 0,
          future: foundContract.price_schedule?.[0]?.future_price || 0,
          contact: foundContract.participants?.find((p: any) => p.role === 'seller')?.name || '',
          shipmentPeriod: 'N/A'
        };
        
        setContractData(newContractData);
        
        // Set form values for contract data
        setValue('contractNumber', newContractData.contractNumber);
        setValue('contractDate', newContractData.contractDate);
        setValue('customerNumber', newContractData.customerNumber);
        setValue('idContract', newContractData.idContract);
        setValue('referenceNumber', newContractData.referenceNumber);
        setValue('commodity', newContractData.commodity);
        setValue('contact', newContractData.contact);
        setValue('shipmentPeriod', newContractData.shipmentPeriod);
      }
      
      // Load and set sub-contract data if available
      if (currentSubContract) {
        const priceSchedule = currentSubContract.price_schedule?.[0] || {};
        setValue('future', priceSchedule.future_price || 0);
        setValue('basis', priceSchedule.basis || 0);
        setValue('price', priceSchedule.price || 0);
        setValue('totalPrice', currentSubContract.total_price || 0);
        setValue('quantity', currentSubContract.quantity || 0);
        setValue('measurementUnitId', currentSubContract.measurement_unit_id || '');
        setValue('totalDate', currentSubContract.sub_contract_date ? new Date(currentSubContract.sub_contract_date).toISOString().split('T')[0] : '');
      }
    }
  }, [contractId, subContractId, contractsData, currentSubContract, setValue]);

  if (!currentSubContract) {
    return (
      <DashboardLayout title={t('viewSubContract.viewSubContract')}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('viewSubContract.subContractNotFound')}
            </h1>
            <Button onClick={handleBackToContract}>
              {t('viewSubContract.backToContract')}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('viewSubContract.viewSubContract')}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Contract Details */}
          <div className="space-y-6">
            
            {/* Contract Overview Card */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>{t('viewSubContract.purchasePriceContract')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('viewSubContract.idContract')}</span>
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono">
                      #{contractData.idContract}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('viewSubContract.contractDate')}</span>
                    <span className="text-sm font-medium">{contractData.contractDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {parentContractData?.type === 'purchase' ? t('viewSubContract.seller') : t('viewSubContract.buyer')}
                    </span>
                    <span className="text-sm font-medium">{contractData.customerNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('viewSubContract.referenceNumber')}</span>
                    <span className="text-sm font-medium">{contractData.referenceNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Information Card */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span>{t('viewSubContract.generalInformation')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('viewSubContract.quantityUnits')}</span>
                    <span className="text-sm font-bold font-mono text-amber-500 dark:text-amber-400">
                      {(parentContractData?.quantity || contractData.quantityUnits).toLocaleString()} {parentContractData?.measurement_unit || 'bushel'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('viewSubContract.availableInventory')}</span>
                    <span className="text-sm font-bold font-mono text-green-600 dark:text-green-400">
                      {availableInventory.toLocaleString()} {parentContractData?.measurement_unit || 'bushel'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('viewSubContract.price')}</span>
                    <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                      $ {(parentContractData?.price_schedule?.[0]?.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('viewSubContract.basis')}</span>
                    <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                      $ {(parentContractData?.price_schedule?.[0]?.basis ?? 0).toFixed(2)} {parentContractData?.price_schedule?.[0]?.option_month || 'september'}{parentContractData?.price_schedule?.[0]?.option_year || '2025'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('viewSubContract.future')}</span>
                    <span className="text-sm font-bold font-mono text-orange-600 dark:text-orange-400">
                      $ {(parentContractData?.price_schedule?.[0]?.future_price ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quantity Overview */}
          <div className="space-y-6">
            
            {/* Quantity Overview Card - Using reusable component in view mode */}
            <QuantityActualOverview
              parentQuantity={contractData.quantityUnits}
              mode="view"
            />

            {/* View Mode Notice */}
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    {t('common.viewMode')}
                  </Badge>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {t('viewSubContract.viewModeNotice')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}