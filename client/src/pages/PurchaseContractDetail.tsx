import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Trash2, Eye, Printer, Plus, Check } from 'lucide-react';
import { Link } from 'wouter';
import { PurchaseContract } from '@/types/purchaseContract.types';
import { formatNumber } from '@/lib/numberFormatter';
import SubContractsSection from '@/components/contracts/SubContractsSection';
import { SubContract, FieldConfig, ProgressBarConfig } from '@/components/contracts/SubContractCard';

export default function PurchaseContractDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const [location] = useLocation();
  
  const contractId = params.id;
  
  // Estados
  const [contract, setContract] = useState<PurchaseContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuración de campos para el componente agnóstico
  const fieldConfig: FieldConfig[] = [
    { key: 'price', label: 'Price', color: 'black', format: 'currency' },
    { key: 'basis', label: 'Basis', color: 'black', format: 'currency' },
    { key: 'future', label: 'Future', color: 'black', isCalculated: true, calculation: (data) => data.quantity * 0.2, unit: 'bu60' },
    { key: 'reserved', label: 'Reserved', color: 'blue', isCalculated: true, calculation: (data) => data.quantity * 0.8, unit: 'bu60' },
    { key: 'delivered', label: 'Settled', color: 'green', unit: 'bu60' },
    { key: 'balance', label: 'Your Balance', color: 'black', unit: 'bu60' }
  ];

  // Configuración del progress bar - completamente agnóstica
  const progressBarConfig: ProgressBarConfig = {
    settledPercentage: (data) => {
      // Verde: % de lo entregado vs total
      const settledAmount = data.delivered || 0;
      const totalQuantity = data.quantity || 1;
      return (settledAmount / totalQuantity) * 100;
    },
    reservedPercentage: (data) => {
      // Azul: % de lo reservado pendiente (reserved - delivered) vs total
      const settledAmount = data.delivered || 0;
      const reservedAmount = data.reserved || 0;
      const totalQuantity = data.quantity || 1;
      
      // Parte reservada que aún no está entregada
      const pendingReserved = Math.max(0, reservedAmount - settledAmount);
      return (pendingReserved / totalQuantity) * 100;
    },
    label: 'Progress',
    colorPriority: 'settled' // Verde tiene prioridad en caso de empate
  };

  // Generar 10 sub-contratos con datos random para testing
  const generateRandomSubContracts = (): SubContract[] => {
    const colors = [
      { border: 'border-l-blue-500', dot: 'bg-blue-500', text: 'text-blue-600' },
      { border: 'border-l-green-500', dot: 'bg-green-500', text: 'text-green-600' },
      { border: 'border-l-purple-500', dot: 'bg-purple-500', text: 'text-purple-600' },
      { border: 'border-l-orange-500', dot: 'bg-orange-500', text: 'text-orange-600' },
      { border: 'border-l-red-500', dot: 'bg-red-500', text: 'text-red-600' },
      { border: 'border-l-pink-500', dot: 'bg-pink-500', text: 'text-pink-600' },
      { border: 'border-l-yellow-500', dot: 'bg-yellow-500', text: 'text-yellow-600' },
      { border: 'border-l-indigo-500', dot: 'bg-indigo-500', text: 'text-indigo-600' },
      { border: 'border-l-cyan-500', dot: 'bg-cyan-500', text: 'text-cyan-600' },
      { border: 'border-l-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600' }
    ];

    // Primeros 10 cards con datos variados
    const regularCards = Array.from({ length: 10 }, (_, i) => {
      const quantity = Math.floor(Math.random() * 500) + 100; // 100-600
      
      // Datos más variados para progress bars realistas
      const reservedPercent = 0.2 + Math.random() * 0.7; // 20%-90% reserved
      const deliveredPercent = Math.random() * reservedPercent; // 0% a reservedPercent delivered
      
      const reserved = Math.floor(quantity * reservedPercent);
      const delivered = Math.floor(quantity * deliveredPercent);
      const balance = quantity - delivered;
      const color = colors[i];
      
      return {
        id: `${i + 1}`,
        contractNumber: `SPC-46-SUBC-${i + 1}`,
        quantity,
        reserved, // Agregamos campo reserved
        delivered,
        balance,
        unit: 'bu60',
        thresholds: { 
          min: quantity * 0.9, 
          max: quantity * 1.1 
        },
        basis: Math.floor(Math.random() * 1000) + 1000, // 1000-2000
        price: Math.floor(Math.random() * 1000) + 1500, // 1500-2500
        totalPayment: quantity * (Math.floor(Math.random() * 1000) + 1500),
        borderColor: color.border,
        dotColor: color.dot,
        textColor: color.text
      };
    });

    // 5 cards adicionales con empates para probar prioridad de colores
    const tieCards = [
      // Card 11: Empate perfecto 200-200
      {
        id: '11',
        contractNumber: 'SPC-46-SUBC-11',
        quantity: 400,
        reserved: 200, // 50%
        delivered: 200, // 50% - EMPATE
        balance: 200,
        unit: 'bu60',
        thresholds: { min: 360, max: 440 },
        basis: 1500,
        price: 2000,
        totalPayment: 400 * 2000,
        borderColor: 'border-l-yellow-500',
        dotColor: 'bg-yellow-500',
        textColor: 'text-yellow-600'
      },
      // Card 12: Empate en números redondos 300-300
      {
        id: '12',
        contractNumber: 'SPC-46-SUBC-12',
        quantity: 600,
        reserved: 300, // 50%
        delivered: 300, // 50% - EMPATE
        balance: 300,
        unit: 'bu60',
        thresholds: { min: 540, max: 660 },
        basis: 1200,
        price: 1800,
        totalPayment: 600 * 1800,
        borderColor: 'border-l-purple-500',
        dotColor: 'bg-purple-500',
        textColor: 'text-purple-600'
      },
      // Card 13: Empate pequeño 100-100
      {
        id: '13',
        contractNumber: 'SPC-46-SUBC-13',
        quantity: 200,
        reserved: 100, // 50%
        delivered: 100, // 50% - EMPATE
        balance: 100,
        unit: 'bu60',
        thresholds: { min: 180, max: 220 },
        basis: 1800,
        price: 2200,
        totalPayment: 200 * 2200,
        borderColor: 'border-l-pink-500',
        dotColor: 'bg-pink-500',
        textColor: 'text-pink-600'
      },
      // Card 14: Empate con decimales exactos 250-250
      {
        id: '14',
        contractNumber: 'SPC-46-SUBC-14',
        quantity: 500,
        reserved: 250, // 50%
        delivered: 250, // 50% - EMPATE
        balance: 250,
        unit: 'bu60',
        thresholds: { min: 450, max: 550 },
        basis: 1600,
        price: 1900,
        totalPayment: 500 * 1900,
        borderColor: 'border-l-indigo-500',
        dotColor: 'bg-indigo-500',
        textColor: 'text-indigo-600'
      },
      // Card 15: Empate grande 400-400
      {
        id: '15',
        contractNumber: 'SPC-46-SUBC-15',
        quantity: 800,
        reserved: 400, // 50%
        delivered: 400, // 50% - EMPATE
        balance: 400,
        unit: 'bu60',
        thresholds: { min: 720, max: 880 },
        basis: 1300,
        price: 2100,
        totalPayment: 800 * 2100,
        borderColor: 'border-l-teal-500',
        dotColor: 'bg-teal-500',
        textColor: 'text-teal-600'
      }
    ];

    return [...regularCards, ...tieCards];
  };

  const [subContracts] = useState<SubContract[]>(generateRandomSubContracts());

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
          <SubContractsSection
            subContracts={subContracts}
            fields={fieldConfig}
            progressBar={progressBarConfig}
            onNewSubContract={() => console.log('New sub-contract')}
            onViewSubContract={(id) => console.log('View sub-contract:', id)}
            onPrintSubContract={(id) => console.log('Print sub-contract:', id)}
            onEditSubContract={(id) => console.log('Edit sub-contract:', id)}
            onDeleteSubContract={(id) => console.log('Delete sub-contract:', id)}
            onSettleSubContract={(id) => console.log('Settle sub-contract:', id)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
