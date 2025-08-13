import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Trash2, Eye, Printer } from 'lucide-react';
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
      <DashboardLayout title={t('contractDetail.title')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('loading')}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {t('contractDetail.loadingContract')}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t('contractDetail.title')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
              {t('contractDetail.errorLoadingContract')}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {error}
            </div>
            <Link href="/purchase-contracts">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToList')}
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout title={t('contractDetail.title')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('contractDetail.contractNotFound')}
            </div>
            <Link href="/purchase-contracts">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToList')}
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
    <DashboardLayout title={t('contractDetail.title')}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/purchase-contracts">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('contractDetail.title')}
            </h1>
          </div>
        </div>

        {/* Main Contract Header */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                ID Contract #{contract.folio || (contract.id ? contract.id.slice(-6) : 'N/A')}
              </h2>
              <Badge 
                variant="secondary" 
                className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-base px-3 py-1"
              >
                {priceInfo?.pricing_type || 'basis'}
              </Badge>
            </div>
            <div className="flex flex-col space-y-2 items-end">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('contractDetail.statusContract')}: <span className="text-green-600 dark:text-green-400">{t('contractDetail.created')}</span>
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-gray-600 border-gray-600 hover:bg-gray-50">
                  <Printer className="w-4 h-4" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.contractDate')}:</p>
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
        <div className="grid grid-cols-2 gap-6 h-[400px]">
          {/* Left Column - Tabs within Card */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">{t('contractDetail.generalInformation')}</TabsTrigger>
                  <TabsTrigger value="contact">{t('contractDetail.remarks')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.commodity')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-xs">
                        {contract.commodity?.name || 'HRW - Wheat Hard Red'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.quantityUnits')}:</span>
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
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.thresholds')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('min')}: {formatNumber({ 
                          value: contract.quantity ? contract.quantity * 0.9 : 1260, 
                          minDecimals: 0, 
                          maxDecimals: 0,
                          formatPattern: '0,000.00',
                          roundMode: 'truncate'
                        })} {contract.measurement_unit || 'bu60'} | {t('max')}: {formatNumber({ 
                          value: contract.quantity ? contract.quantity * 1.1 : 1540, 
                          minDecimals: 0, 
                          maxDecimals: 0,
                          formatPattern: '0,000.00',
                          roundMode: 'truncate'
                        })} {contract.measurement_unit || 'bu60'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.price')}:</span>
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
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.contractType')}:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {contract.type === 'purchase' ? t('contractDetail.purchase') : t('contractDetail.sale')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.basis')}:</span>
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
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.future')}:</span>
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
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.contact')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">-</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.shipment')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">-</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.paymentTerms')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">-</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.premiumDiscount')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">-</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Right Column - Quantity Overview */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{t('contractDetail.quantityOverview')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fixed Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>{t('contractDetail.fixed')}</span>
                  <span>{t('contractDetail.open')}</span>
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
                  <span>{t('contractDetail.settled')}</span>
                  <span>{t('contractDetail.unsettled')}</span>
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
                  <span>{t('contractDetail.reserved')}</span>
                  <span>{t('contractDetail.available')}</span>
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

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('contractDetail.specialInstructions')}:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">-</p>
          </CardContent>
        </Card>

        {/* Sub-contracts Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('contractDetail.subContracts')} (3)
            </h2>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              + {t('contractDetail.newSubContract')}
            </Button>
          </div>

          <div className="flex gap-6 h-[400px]">
            {/* Left Column - Pie Chart */}
            <Card className="h-full w-[300px] flex-shrink-0">
              <CardHeader>
                <CardTitle>{t('contractDetail.position')}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-full p-4">
                <div className="flex items-center space-x-4 w-full">
                  {/* Legend - Left Side */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>
                      <span>SPC-46</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                      <span>SPC-46-SUBC-3</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-pink-500 rounded mr-2"></div>
                      <span>SPC-46-SUBC-2</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                      <span>SPC-46-SUBC-1</span>
                    </div>
                  </div>
                  
                  {/* Pie Chart - Right Side */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative">
                      <div className="absolute inset-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                          <div className="text-sm font-bold">100%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Sub-contracts Cards with Border and Scroll */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full flex-1">
              <div className="h-full overflow-y-auto space-y-3 pr-2" style={{maxHeight: '340px'}}>
                {/* Sub-contract 1 */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="font-medium text-blue-600">ID Contract#SPC-46-SUBC-3</span>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        {t('contractDetail.printSubContract')}
                      </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">{t('contractDetail.quantityUnits')}:</p>
                        <p className="font-medium text-green-600">300.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.thresholds')} (bu60):</p>
                        <p className="font-medium">Min: 270.00 | Max: 330.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.basis')}:</p>
                        <p className="font-medium text-blue-600">$ 1,500.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.price')}:</p>
                        <p className="font-medium text-green-600">$ 1,800.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.delivered')}:</p>
                        <p className="font-medium text-blue-600">0.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.yourBalance')}:</p>
                        <p className="font-medium">0.00 bu60</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm"><span className="text-gray-500">{t('contractDetail.totalPayment')}:</span> <span className="font-bold text-green-600">$ 540,000.00</span></p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-contract 2 */}
                <Card className="border-l-4 border-l-pink-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-pink-500 rounded"></div>
                        <span className="font-medium text-pink-600">ID Contract#SPC-46-SUBC-2</span>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        {t('contractDetail.printSubContract')}
                      </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">{t('contractDetail.quantityUnits')}:</p>
                        <p className="font-medium text-green-600">200.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.thresholds')} (bu60):</p>
                        <p className="font-medium">Min: 180.00 | Max: 220.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.basis')}:</p>
                        <p className="font-medium text-blue-600">$ 1,500.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.price')}:</p>
                        <p className="font-medium text-green-600">$ 1,500.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.delivered')}:</p>
                        <p className="font-medium text-blue-600">0.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.yourBalance')}:</p>
                        <p className="font-medium">0.00 bu60</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm"><span className="text-gray-500">{t('contractDetail.totalPayment')}:</span> <span className="font-bold text-green-600">$ 300,000.00</span></p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-contract 3 */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span className="font-medium text-purple-600">ID Contract#SPC-46-SUBC-1</span>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        {t('contractDetail.printSubContract')}
                      </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">{t('contractDetail.quantityUnits')}:</p>
                        <p className="font-medium text-green-600">150.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.thresholds')} (bu60):</p>
                        <p className="font-medium">Min: 135.00 | Max: 165.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.basis')}:</p>
                        <p className="font-medium text-blue-600">$ 1,500.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.price')}:</p>
                        <p className="font-medium text-green-600">$ 1,700.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.delivered')}:</p>
                        <p className="font-medium text-blue-600">0.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.yourBalance')}:</p>
                        <p className="font-medium">0.00 bu60</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm"><span className="text-gray-500">{t('contractDetail.totalPayment')}:</span> <span className="font-bold text-green-600">$ 255,000.00</span></p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-contract 4 */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span className="font-medium text-orange-600">ID Contract#SPC-46-SUBC-4</span>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        {t('contractDetail.printSubContract')}
                      </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">{t('contractDetail.quantityUnits')}:</p>
                        <p className="font-medium text-green-600">250.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.thresholds')} (bu60):</p>
                        <p className="font-medium">Min: 225.00 | Max: 275.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.basis')}:</p>
                        <p className="font-medium text-blue-600">$ 1,500.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.price')}:</p>
                        <p className="font-medium text-green-600">$ 1,600.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.delivered')}:</p>
                        <p className="font-medium text-blue-600">0.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.yourBalance')}:</p>
                        <p className="font-medium">0.00 bu60</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm"><span className="text-gray-500">{t('contractDetail.totalPayment')}:</span> <span className="font-bold text-green-600">$ 400,000.00</span></p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-contract 5 */}
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="font-medium text-green-600">ID Contract#SPC-46-SUBC-5</span>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        {t('contractDetail.printSubContract')}
                      </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">{t('contractDetail.quantityUnits')}:</p>
                        <p className="font-medium text-green-600">180.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.thresholds')} (bu60):</p>
                        <p className="font-medium">Min: 162.00 | Max: 198.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.basis')}:</p>
                        <p className="font-medium text-blue-600">$ 1,500.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.price')}:</p>
                        <p className="font-medium text-green-600">$ 1,750.00</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.delivered')}:</p>
                        <p className="font-medium text-blue-600">0.00 bu60</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('contractDetail.yourBalance')}:</p>
                        <p className="font-medium">0.00 bu60</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm"><span className="text-gray-500">{t('contractDetail.totalPayment')}:</span> <span className="font-bold text-green-600">$ 315,000.00</span></p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}