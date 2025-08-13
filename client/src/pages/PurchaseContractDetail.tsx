import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, FileText, Truck, Users } from 'lucide-react';
import { Link } from 'wouter';
import { PurchaseContract } from '@/types/purchaseContract.types';

export default function PurchaseContractDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const [location] = useLocation();
  
  const contractId = params.id;
  
  // Estados
  const [contract, setContract] = useState<PurchaseContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del contrato
  useEffect(() => {
    if (contractId) {
      fetchContractDetail(contractId);
    }
  }, [contractId]);

  const fetchContractDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos de autenticación
      const partitionKey = localStorage.getItem('partitionKey') || localStorage.getItem('partition_key') || '';
      const idToken = localStorage.getItem('id_token') || '';

      if (!partitionKey || !idToken) {
        setError('No authentication data available');
        return;
      }

      const headers = {
        '_partitionkey': partitionKey,
        'accept': '*/*',
        'accept-language': 'es-419,es;q=0.9',
        'authorization': `Bearer ${idToken}`,
        'bt-organization': partitionKey,
        'bt-uid': partitionKey,
        'organization_id': partitionKey,
        'origin': 'https://contracts-develop.grainchain.io',
        'pk-organization': partitionKey
      };

      const response = await fetch(
        `https://trm-develop.grainchain.io/api/v1/contracts/sp-contracts/${id}`,
        {
          method: 'GET',
          headers: headers
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Mapear los datos igual que en la lista
      const mappedContract: PurchaseContract = {
        id: data._id,
        folio: data.folio,
        reference_number: data.folio,
        commodity: data.commodity,
        participants: data.participants,
        characteristics: data.characteristics,
        type: data.type as 'purchase',
        sub_type: data.sub_type as 'direct' | 'imported' | 'importedFreight',
        quantity: data.quantity,
        measurement_unit_id: data.measurement_unit_id,
        measurement_unit: data.measurement_unit,
        price_schedule: data.price_schedule,
        logistic_schedule: data.logistic_schedule,
        shipping_start_date: data.shipping_start_date,
        shipping_end_date: data.shipping_end_date,
        contract_date: data.contract_date,
        delivered: data.delivered,
        transport: data.transport,
        weights: data.weights,
        inspections: data.inspections,
        proteins: data.proteins,
        application_priority: data.application_priority,
        thresholds: data.thresholds,
        status: data.status,
        grade: typeof data.grade === 'string' ? parseInt(data.grade) || 0 : data.grade,
        inventory: data.inventory
      };

      setContract(mappedContract);
    } catch (err) {
      console.error('Error fetching contract detail:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={t('contractDetail')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout title={t('contractDetail')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              {error || 'Contract not found'}
            </p>
            <Link href="/purchase-contracts" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back')}
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const seller = contract.participants?.find(p => p.role === 'seller');
  const buyer = contract.participants?.find(p => p.role === 'buyer');
  

  const priceSchedule = contract.price_schedule?.[0];
  const logisticSchedule = contract.logistic_schedule?.[0];

  return (
    <DashboardLayout title={`${t('contractDetail')} - ${contract.folio}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/purchase-contracts">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('back')}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('contractDetail')} - {contract.folio}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(contract.contract_date || '').toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                {t('generateReport')}
              </Button>
            </div>
          </div>
        </div>

        {/* Contract Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Contract Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('contractType')}
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {contract.type} - {contract.sub_type}
                </p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('participants')}
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {seller?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  → {buyer?.name || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Commodity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">C</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('commodity')}
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {contract.commodity?.name || contract.commodity || 'Unknown Commodity'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {contract.quantity || 0} {contract.measurement_unit || 'units'}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('status')}
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {contract.status || 'Active'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pricing Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('pricingInformation')}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {priceSchedule && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('pricingType')}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {priceSchedule.pricing_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('price')}</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${priceSchedule.price?.toLocaleString() || '0'}
                    </span>
                  </div>
                  {priceSchedule.basis !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('basis')}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        ${priceSchedule.basis?.toLocaleString() || '0'}
                      </span>
                    </div>
                  )}
                  {priceSchedule.future_price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('futurePrice')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${priceSchedule.future_price?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {priceSchedule.payment_currency && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('currency')}</span>
                      <span className="font-medium text-gray-900 dark:text-white uppercase">
                        {priceSchedule.payment_currency}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Logistics Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('logisticsInformation')}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {logisticSchedule && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('paymentResponsibility')}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {logisticSchedule.logistic_payment_responsability}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('coordinationResponsibility')}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {logisticSchedule.logistic_coordination_responsability}
                    </span>
                  </div>
                  {logisticSchedule.freight_cost && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('freightType')}</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {logisticSchedule.freight_cost.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('freightCost')}</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          ${logisticSchedule.freight_cost.cost?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
              
              {contract.shipping_start_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('shippingStart')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(contract.shipping_start_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {contract.shipping_end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('shippingEnd')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(contract.shipping_end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}