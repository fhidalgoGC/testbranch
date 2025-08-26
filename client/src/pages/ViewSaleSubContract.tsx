import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Package, FileText } from 'lucide-react';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { QuantityActualOverview } from '@/components/contracts/QuantityActualOverview';
import { formatNumber } from '@/lib/numberFormatter';
import { authenticatedFetch } from '@/utils/apiInterceptors';
// No validation needed for view mode

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

interface SubContractFormData {
  subContractId: string;
  quantity: number;
  future: number;
  basis: number;
  price: number;
  totalPrice: number;
  totalDate: string;
  measurementUnitId: string;
}

export default function ViewSaleSubContract() {
  const { t } = useTranslation();
  const params = useParams();
  const [location, setLocation] = useLocation();
  
  const contractId = params.contractId;
  const subContractId = params.subContractId;
  
  const { handleNavigateToPage } = useNavigationHandler();
  
  // Obtener contratos del state de Redux para sale contracts
  const contractsState = useSelector((state: any) => state.pageState.saleContracts);
  const contractsData = contractsState.contractsData || [];
  
  usePageTracking('viewSaleSubContract');
  
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

  const [subContractData, setSubContractData] = useState<SubContractFormData>({
    subContractId: '',
    quantity: 0,
    future: 0,
    basis: 0,
    price: 0,
    totalPrice: 0,
    totalDate: '',
    measurementUnitId: ''
  });

  const [openInventory, setOpenInventory] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get measurement units
  const { measurementUnits, loading: measurementUnitsLoading, error: measurementUnitsError } = useMeasurementUnits();

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!contractId || !subContractId) return;

      setLoading(true);
      try {
        // Load parent contract data from Redux
        const foundContract = contractsData.find((contract: any) => 
          contract._id === contractId || contract.id === contractId
        );

        if (foundContract) {
          // Get buyer for sale contracts
          const buyer = foundContract.participants?.find((p: any) => p.role === 'buyer');
          const seller = foundContract.participants?.find((p: any) => p.role === 'seller');
          
          const contractInfo: ContractData = {
            contractNumber: foundContract.folio || '',
            contractDate: foundContract.contract_date ? new Date(foundContract.contract_date).toISOString().split('T')[0] : '',
            customerNumber: buyer?.name || 'Unknown Buyer',
            idContract: foundContract.folio || '',
            referenceNumber: foundContract.reference_number || foundContract.folio || '',
            commodity: foundContract.commodity?.name || '',
            quantityUnits: foundContract.quantity || 0,
            price: foundContract.price_schedule?.[0]?.price || 0,
            basis: foundContract.price_schedule?.[0]?.basis || 0,
            future: foundContract.price_schedule?.[0]?.future_price || 0,
            contact: seller?.name || '',
            shipmentPeriod: foundContract.shipping_start_date && foundContract.shipping_end_date ? 
              `${new Date(foundContract.shipping_start_date).toLocaleDateString()} - ${new Date(foundContract.shipping_end_date).toLocaleDateString()}` : ''
          };

          setContractData(contractInfo);
          setOpenInventory(foundContract.inventory?.open || 0);

          // Load sub-contract data
          const response = await authenticatedFetch(`/api/v1/subcontracts/${subContractId}`);
          if (!response.ok) {
            throw new Error('Failed to load sub-contract data');
          }
          
          const subContractResponse = await response.json();
          const subContract = subContractResponse.data || subContractResponse;
          
          setSubContractData({
            subContractId: subContract._id || subContract.id || '',
            quantity: subContract.quantity || 0,
            future: subContract.future_price || 0,
            basis: subContract.basis || 0,
            price: subContract.price || 0,
            totalPrice: subContract.total_price || subContract.price || 0,
            totalDate: subContract.delivery_date ? subContract.delivery_date.split('T')[0] : '',
            measurementUnitId: subContract.measurement_unit_id || ''
          });
        } else {
          setError('Contract not found');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contractId, subContractId, contractsData]);

  const handleBack = () => {
    setLocation(`/sale-contracts/${contractId}`);
  };

  const handleEdit = () => {
    setLocation(`/sale-contracts/${contractId}/sub-contracts/${subContractId}/edit`);
  };

  if (loading || measurementUnitsLoading) {
    return (
      <DashboardLayout title={t('viewSaleSubContract')}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || measurementUnitsError) {
    return (
      <DashboardLayout title={t('viewSaleSubContract')}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('error')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || measurementUnitsError}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Get measurement unit label
  const measurementUnitLabel = measurementUnits.find(unit => unit.value === subContractData.measurementUnitId)?.label || '';

  return (
    <DashboardLayout title={t('viewSaleSubContract')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('viewSaleSubContract')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subContractDetails')}
              </p>
            </div>
          </div>
          <Button onClick={handleEdit}>
            {t('edit')}
          </Button>
        </div>

        {/* Quantity Overview */}
        <QuantityActualOverview
          totalQuantity={contractData.quantityUnits}
          openInventory={openInventory}
          contractType="sale"
        />

        {/* Contract Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('contractInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contractDate')}
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {contractData.contractDate}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('buyer')} {/* Changed from seller to buyer for sale contracts */}
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {contractData.customerNumber}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contractNumber')}
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {contractData.idContract}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('commodity')}
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {contractData.commodity}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Contract Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quantity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('quantityInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('quantity')}
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber({
                      value: subContractData.quantity,
                      minDecimals: 2,
                      maxDecimals: 2,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {measurementUnitLabel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('priceInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('future')}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    ${formatNumber({
                      value: subContractData.future,
                      minDecimals: 2,
                      maxDecimals: 4,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('basis')}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    ${formatNumber({
                      value: subContractData.basis,
                      minDecimals: 2,
                      maxDecimals: 4,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('totalPrice')}
                </label>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${formatNumber({
                      value: subContractData.totalPrice,
                      minDecimals: 2,
                      maxDecimals: 2,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('deliveryInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('deliveryDate')}
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {subContractData.totalDate ? 
                  new Date(subContractData.totalDate).toLocaleDateString() : 
                  t('notSpecified')
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}