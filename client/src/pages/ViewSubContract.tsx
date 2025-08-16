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
import { ArrowLeft, Calendar, Package, FileText, X, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { formatNumber } from '@/lib/numberFormatter';
import { NUMBER_FORMAT_CONFIG } from '@/environment/environment';
import { authenticatedFetch } from '@/utils/apiInterceptors';
import { QuantityActualOverview } from '@/components/contracts/QuantityActualOverview';

// View sub-contract form validation schema (simplified for view mode)
const viewSubContractValidationSchema = () => z.object({
  // Form display fields
  contractNumber: z.string(),
  contractDate: z.string(),
  customerNumber: z.string(),
  idContract: z.string(),
  referenceNumber: z.string(),
  commodity: z.string(),
  contact: z.string().optional(),
  shipmentPeriod: z.string().optional(),
  
  // API fields 
  future: z.number().optional(),
  basis: z.number(),
  price: z.number(),
  totalPrice: z.number(),
  totalDate: z.string(),
  quantity: z.number(),
  measurementUnitId: z.string(),
});

// Create a base schema for type inference
const baseSubContractSchema = z.object({
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

type SubContractFormData = z.infer<typeof baseSubContractSchema>;

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
  
  // Obtener el estado del contrato principal para editar sub-contrato (usar el mismo que edit)
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

  // React Hook Form setup - same as EditSubContract but in view mode
  const form = useForm<SubContractFormData>({
    resolver: zodResolver(viewSubContractValidationSchema()),
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

  const { control, setValue, reset, handleSubmit, formState: { errors } } = form;

  // Load data from Redux state exactly like EditSubContract does
  useEffect(() => {
    if (currentSubContract && parentContractData && contractsData.length > 0) {
      console.log('🔍 VIEW SUB-CONTRACT: Loading data from Redux state');
      console.log('Current sub-contract:', currentSubContract);
      console.log('Parent contract data:', parentContractData);
      
      // Find parent contract data from Redux state
      const parentContract = contractsData.find((contract: any) => contract._id === contractId);
      
      if (parentContract) {
        console.log('🔍 Parent contract found in Redux:', parentContract);
        
        // Set contract data for display (same logic as EditSubContract)
        setContractData({
          contractNumber: parentContract.folio || '',
          contractDate: parentContract.contract_date ? new Date(parentContract.contract_date).toLocaleDateString() : '',
          customerNumber: parentContract.participants?.find((p: any) => p.role === 'seller')?.name || 'N/A',
          idContract: parentContract.folio || '',
          referenceNumber: parentContract.reference_number || 'N/A',
          commodity: parentContract.commodity?.name || '',
          quantityUnits: parentContract.quantity || 0,
          price: parentContract.price_schedule?.[0]?.price || 0,
          basis: parentContract.price_schedule?.[0]?.basis || 0,
          future: parentContract.price_schedule?.[0]?.future_price || 0,
          contact: '',
          shipmentPeriod: ''
        });
        
        // Set form values with current sub-contract data (same logic as EditSubContract)
        const subContractDate = currentSubContract.sub_contract_date 
          ? new Date(currentSubContract.sub_contract_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        
        reset({
          contractNumber: parentContract.folio || '',
          contractDate: parentContract.contract_date ? new Date(parentContract.contract_date).toLocaleDateString() : '',
          customerNumber: parentContract.participants?.find((p: any) => p.role === 'seller')?.name || 'N/A',
          idContract: parentContract.folio || '',
          referenceNumber: parentContract.reference_number || 'N/A',
          commodity: parentContract.commodity?.name || '',
          contact: '',
          shipmentPeriod: '',
          future: currentSubContract.price_schedule?.[0]?.future_price || 0,
          basis: currentSubContract.price_schedule?.[0]?.basis || 0,
          price: currentSubContract.price_schedule?.[0]?.price || 0,
          totalPrice: currentSubContract.total_price || 0,
          totalDate: subContractDate,
          quantity: currentSubContract.quantity || 0,
          measurementUnitId: currentSubContract.measurement_unit || 'bu60'
        });
        
        console.log('📝 Form initialized with sub-contract data (VIEW MODE):', {
          subContractId: currentSubContract._id,
          quantity: currentSubContract.quantity,
          future: currentSubContract.price_schedule?.[0]?.future_price,
          basis: currentSubContract.price_schedule?.[0]?.basis,
          price: currentSubContract.price_schedule?.[0]?.price,
          totalPrice: currentSubContract.total_price,
          totalDate: subContractDate,
          measurementUnit: currentSubContract.measurement_unit
        });
      }
    }
  }, [currentSubContract, parentContractData, contractsData, contractId, reset]);
  
  // Helper function to format quantity (same as EditSubContract)
  const formatQuantity = (value: number) => {
    return formatNumber({
      minDecimals: NUMBER_FORMAT_CONFIG.minDecimals,
      maxDecimals: NUMBER_FORMAT_CONFIG.maxDecimals,
      value: value,
      formatPattern: NUMBER_FORMAT_CONFIG.formatPattern,
      roundMode: NUMBER_FORMAT_CONFIG.roundMode
    });
  };
  
  // Handle cancel - go back to contract detail
  const handleCancel = () => {
    setLocation(`/purchase-contracts/${contractId}`);
  };
  
  if (!currentSubContract) {
    return (
      <DashboardLayout title={t('viewSubContract.viewSubContract')}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('viewSubContract.subContractNotFound')}
            </h1>
            <Button onClick={handleCancel}>
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

        {/* Main Form - Exact same structure as EditSubContract */}
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
            
            {/* Quantity Overview Card - Using same component but in view mode */}
            <QuantityActualOverview
              control={control}
              errors={errors}
              setValue={setValue}
              parentContractData={parentContractData}
              contractData={contractData}
              measurementUnits={measurementUnits}
              loadingUnits={loadingUnits}
              unitsError={unitsError}
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