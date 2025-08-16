import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Package, FileText } from 'lucide-react';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { QuantityActualOverview } from '@/components/contracts/QuantityActualOverview';

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
  const currentSubContractData = editSubContractState?.currentSubContractData;
  
  // Use the specific sub-contract data from Redux state
  const currentSubContract = currentSubContractData;
  
  usePageTracking('viewSubContract');
  
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
  const { data: measurementUnits = [], isLoading: loadingUnits, error: unitsError } = useMeasurementUnits();
  
  // Available inventory calculation
  const availableInventory = parentContractData?.inventory?.open || 0;

  // Handle cancel - go back to contract detail
  const handleCancel = () => {
    setLocation(`/purchase-contracts/${contractId}`);
  };

  // Load data from Redux state exactly like EditSubContract does
  useEffect(() => {
    if (currentSubContract && parentContractData && contractsData.length > 0) {
      console.log('🔍 VIEW SUB-CONTRACT: Loading data from Redux state');
      
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
      }
    }
  }, [currentSubContract, parentContractData, contractsData, contractId]);
  
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

        {/* Main Form - Exact same structure as EditSubContract but disabled */}
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

          {/* Right Column - Form Fields (disabled) */}
          <div className="space-y-6">
            
            {/* Sub-Contract Form Card - Same as EditSubContract but disabled */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span>{t('viewSubContract.viewSubContract')} Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  
                  {/* Quantity Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editSubContract.quantity')} ({parentContractData?.measurement_unit || 'bu60'})
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={currentSubContract?.quantity?.toLocaleString() || '0'}
                        disabled
                        className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                                 font-mono text-right cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Future Price Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editSubContract.future')} (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        type="text"
                        value={currentSubContract?.price_schedule?.[0]?.future_price?.toFixed(2) || '0.00'}
                        disabled
                        className="w-full pl-8 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                                 font-mono text-right cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Basis Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editSubContract.basis')} (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        type="text"
                        value={currentSubContract?.price_schedule?.[0]?.basis?.toFixed(2) || '0.00'}
                        disabled
                        className="w-full pl-8 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                                 font-mono text-right cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Price Field (Calculated) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editSubContract.price')} (USD) - Calculated
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        type="text"
                        value={currentSubContract?.price_schedule?.[0]?.price?.toFixed(2) || '0.00'}
                        disabled
                        className="w-full pl-8 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 
                                 font-mono text-right cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Total Price Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Price (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        type="text"
                        value={currentSubContract?.total_price?.toLocaleString() || '0'}
                        disabled
                        className="w-full pl-8 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 
                                 font-mono text-right cursor-not-allowed font-bold"
                      />
                    </div>
                  </div>

                  {/* Date Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sub-Contract Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={currentSubContract?.sub_contract_date ? new Date(currentSubContract.sub_contract_date).toLocaleDateString() : ''}
                        disabled
                        className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                                 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Measurement Unit Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editSubContract.measurementUnit')}
                    </label>
                    <input
                      type="text"
                      value={currentSubContract?.measurement_unit || ''}
                      disabled
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                               cursor-not-allowed"
                    />
                  </div>

                </div>
              </CardContent>
            </Card>

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