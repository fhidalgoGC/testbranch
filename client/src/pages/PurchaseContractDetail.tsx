import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'wouter';
import { PurchaseContract } from '@/types/purchaseContract.types';
import { formatNumber } from '@/lib/numberFormatter';

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
        type: data.type,
        sub_type: data.sub_type,
        quantity: data.quantity,
        measurement_unit_id: data.measurement_unit_id,
        measurement_unit: data.measurement_unit,
        price_schedule: data.price_schedule,
        logistic_schedule: data.logistic_schedule,
        contract_date: data.created_at,
        status: data.active ? 'active' : 'inactive',
        inventory: {
          total: data.quantity || 0,
          open: data.quantity || 0,
          fixed: 0,
          unsettled: data.quantity || 0,
          settled: 0,
          reserved: 0
        }
      };

      setContract(mappedContract);
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch contract');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Purchase Contract Detail">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Loading...
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Loading contract data
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Purchase Contract Detail">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
              Error
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {error}
            </div>
            <Link href="/purchase-contracts">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Contracts
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout title="Purchase Contract Detail">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Contract not found
            </div>
            <Link href="/purchase-contracts">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Contracts
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const seller = contract.participants?.find(p => p.role === 'seller');
  const buyer = contract.participants?.find(p => p.role === 'buyer');
  const priceInfo = contract.price_schedule?.[0];
  const logisticInfo = contract.logistic_schedule?.[0];

  return (
    <DashboardLayout title="Purchase Contract Detail">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/purchase-contracts">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Purchase Contract Detail
            </h1>
          </div>
        </div>

        {/* Main Contract Header */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                ID Contract #{contract.folio || (contract.id ? contract.id.slice(-6) : 'N/A')}
              </h2>
            </div>
            <div className="flex flex-col space-y-2 items-end">
              <div className="flex items-center space-x-4">
                <Badge 
                  variant="secondary" 
                  className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                >
                  {priceInfo?.pricing_type || 'basis'}
                </Badge>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Status Contract: <span className="text-green-600 dark:text-green-400">created</span>
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Basic Contract Info Row */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contract Date:</p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {contract.contract_date 
                    ? new Date(contract.contract_date).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric', 
                        year: 'numeric'
                      })
                    : '7/31/2025'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reference Number:</p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {contract.reference_number || 'NA'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {seller?.name || 'Test Seller LLC'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Street 10, Arizona City, AZ 23412, USA
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - General Information */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Commodity:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-xs">
                  {contract.commodity?.name || 'HRW - Wheat Hard Red'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quantity / Units:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatNumber({ 
                    value: contract.quantity || 1400, 
                    minDecimals: 2, 
                    maxDecimals: 2,
                    formatPattern: '0,000.00',
                    roundMode: 'truncate'
                  })} {contract.measurement_unit || 'bu60'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Thresholds</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Min: {formatNumber({ 
                    value: contract.quantity ? contract.quantity * 0.9 : 1260, 
                    minDecimals: 0, 
                    maxDecimals: 0,
                    formatPattern: '0,000',
                    roundMode: 'truncate'
                  })} {contract.measurement_unit || 'bu60'} | Max: {formatNumber({ 
                    value: contract.quantity ? contract.quantity * 1.1 : 1540, 
                    minDecimals: 0, 
                    maxDecimals: 0,
                    formatPattern: '0,000',
                    roundMode: 'truncate'
                  })} {contract.measurement_unit || 'bu60'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Price:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  $ {formatNumber({ 
                    value: priceInfo?.price || 0, 
                    minDecimals: 2, 
                    maxDecimals: 2,
                    formatPattern: '0,000.00',
                    roundMode: 'truncate'
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Basis:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  $ {formatNumber({ 
                    value: priceInfo?.basis || 1500, 
                    minDecimals: 2, 
                    maxDecimals: 2,
                    formatPattern: '0,000.00',
                    roundMode: 'truncate'
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Future:</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  $ {formatNumber({ 
                    value: priceInfo?.future_price || 0, 
                    minDecimals: 2, 
                    maxDecimals: 2,
                    formatPattern: '0,000.00',
                    roundMode: 'truncate'
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Quantity Overview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Quantity Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fixed Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span>Fixed</span>
                    <span>Open</span>
                  </div>
                  <Progress 
                    value={0} 
                    className="w-full h-4"
                    indicatorClassName="bg-blue-500 dark:bg-blue-400"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber({ 
                        value: 0, 
                        minDecimals: 2, 
                        maxDecimals: 2,
                        formatPattern: '0,000.00',
                        roundMode: 'truncate'
                      })} bu60
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber({ 
                        value: contract.quantity || 1400, 
                        minDecimals: 2, 
                        maxDecimals: 2,
                        formatPattern: '0,000.00',
                        roundMode: 'truncate'
                      })} bu60
                    </div>
                  </div>
                </div>

                {/* Settled Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span>Settled</span>
                    <span>Unsettled</span>
                  </div>
                  <Progress 
                    value={0} 
                    className="w-full h-4"
                    indicatorClassName="bg-blue-500 dark:bg-blue-400"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber({ 
                        value: 0, 
                        minDecimals: 2, 
                        maxDecimals: 2,
                        formatPattern: '0,000.00',
                        roundMode: 'truncate'
                      })} bu60
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber({ 
                        value: contract.quantity || 1400, 
                        minDecimals: 2, 
                        maxDecimals: 2,
                        formatPattern: '0,000.00',
                        roundMode: 'truncate'
                      })} bu60
                    </div>
                  </div>
                </div>

                {/* Reserved Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span>Reserved</span>
                    <span>Available</span>
                  </div>
                  <Progress 
                    value={100} 
                    className="w-full h-4"
                    indicatorClassName="bg-green-500 dark:bg-green-400"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatNumber({ 
                        value: contract.quantity || 1400, 
                        minDecimals: 2, 
                        maxDecimals: 2,
                        formatPattern: '0,000.00',
                        roundMode: 'truncate'
                      })} bu60
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatNumber({ 
                        value: 0, 
                        minDecimals: 2, 
                        maxDecimals: 2,
                        formatPattern: '0,000.00',
                        roundMode: 'truncate'
                      })} bu60
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions / Remarks:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">-</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}