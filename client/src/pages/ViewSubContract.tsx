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
import { Link } from 'wouter';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { formatNumber } from '@/lib/numberFormatter';
import { NUMBER_FORMAT_CONFIG } from '@/environment/environment';
import { authenticatedFetch } from '@/utils/apiInterceptors';
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
  const viewSubContractState = useSelector((state: any) => state.pageState.viewSubContract?.[contractId!]);
  const parentContractData = viewSubContractState?.parentContractData;
  const subContractsData = viewSubContractState?.subContractsData || [];
  const currentSubContractData = viewSubContractState?.currentSubContractData;
  
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
  const { measurementUnits: measurementUnitsData } = useMeasurementUnits();
  const measurementUnits = measurementUnitsData || [];
  
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
        setContractData({
          contractNumber: foundContract.folio || '',
          contractDate: foundContract.contract_date ? new Date(foundContract.contract_date).toLocaleDateString() : '',
          customerNumber: foundContract.participants?.find((p: any) => p.role === 'buyer')?.name || '',
          idContract: foundContract._id || '',
          referenceNumber: foundContract.reference_number || 'N/A',
          commodity: foundContract.commodity?.name || '',
          quantityUnits: foundContract.quantity || 0,
          price: foundContract.price_schedule?.[0]?.price || 0,
          basis: foundContract.price_schedule?.[0]?.basis || 0,
          future: foundContract.price_schedule?.[0]?.future_price || 0,
          contact: foundContract.participants?.find((p: any) => p.role === 'seller')?.name || '',
          shipmentPeriod: 'N/A'
        });
      }
      
      // Load sub-contract data
      loadSubContractData();
    }
  }, [contractId, subContractId, contractsData]);

  const loadSubContractData = async () => {
    try {
      console.log('🔍 Loading sub-contract data for viewing:', subContractId);
      
      const response = await authenticatedFetch(
        `https://trm-develop.grainchain.io/api/v1/contracts/sp-sub-contracts/${subContractId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load sub-contract: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Sub-contract loaded for viewing:', result);
      
      // The sub-contract data should be in result.data
      if (result.data) {
        // Store in Redux state for consistency with other pages
        // This would typically be done through a Redux action, but for now we'll handle it locally
      }
    } catch (error) {
      console.error('❌ Error loading sub-contract for viewing:', error);
    }
  };

  // Helper function to get measurement unit display
  const getMeasurementUnitDisplay = (unitId: string) => {
    const unit = measurementUnits?.find((u: any) => u.id === unitId);
    return unit ? unit.name : unitId;
  };

  // Get sub-contract data for display
  const displayData = currentSubContract || {};
  const priceSchedule = displayData.price_schedule?.[0] || {};

  return (
    <DashboardLayout title={t('subContract.viewTitle')}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToContract}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('contractDetail.backToContract')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('subContract.viewTitle')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {displayData.folio || subContractId} • {contractData.contractNumber}
              </p>
            </div>
          </div>
          
          <Badge variant="secondary">
            {t('common.viewMode')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contract Information (Read-only) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  {t('createSubContract.contractDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createSubContract.contractNumber')}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {contractData.contractNumber}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createSubContract.contractDate')}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {contractData.contractDate}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createSubContract.customerNumber')}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {contractData.customerNumber}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createSubContract.idContract')}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {contractData.idContract}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createSubContract.referenceNumber')}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {contractData.referenceNumber}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createSubContract.commodity')}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {contractData.commodity}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sub-Contract Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  {t('createSubContract.subContractDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('createSubContract.quantity')}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      {formatNumber(displayData.quantity || 0)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('createSubContract.measurementUnit')}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      {displayData.measurement_unit || getMeasurementUnitDisplay(displayData.measurement_unit_id || '') || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('createSubContract.basis')}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      ${formatNumber(priceSchedule.basis || 0)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('createSubContract.future')}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      ${formatNumber(priceSchedule.future_price || 0)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('createSubContract.price')}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      ${formatNumber(priceSchedule.price || 0)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('createSubContract.totalPrice')}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      ${formatNumber(displayData.total_price || 0)}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('createSubContract.subContractDate')}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                      {displayData.sub_contract_date ? new Date(displayData.sub_contract_date).toLocaleDateString() : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Overview */}
          <div className="space-y-6">
            {/* Date Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {t('createSubContract.dateInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('createSubContract.totalDate')}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {displayData.sub_contract_date ? new Date(displayData.sub_contract_date).toLocaleDateString() : ''}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{t('createSubContract.quantityOverview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <QuantityActualOverview
                  parentQuantity={contractData.quantityUnits}
                  mode="view"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}