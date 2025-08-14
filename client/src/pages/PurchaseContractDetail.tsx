import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { useContractDetailState, usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import { useSelector } from 'react-redux';
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
  const [location, setLocation] = useLocation();
  
  const contractId = params.id;
  
  // Hook para persistir estado del detalle de contrato
  const { contractState, updateState } = useContractDetailState(contractId!);
  const { handleNavigateToPage } = useNavigationHandler();
  
  // Obtener contratos del state de Redux
  const contractsState = useSelector((state: any) => state.pageState.purchaseContracts);
  const contractsData = contractsState.contractsData || [];
  
  usePageTracking(`/purchase-contracts/${contractId}`);
  
  // Notificar navegación al cargar la página
  useEffect(() => {
    handleNavigateToPage('contractDetail', contractId);
  }, [contractId]);
  
  // Estados
  const [contract, setContract] = useState<PurchaseContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(contractState.activeTab || 'general');
  
  // Estado para el contrato específico encontrado
  const [currentContractData, setCurrentContractData] = useState<any>(null);
  
  // Función para cargar contrato específico desde API
  const loadSpecificContract = async (contractId: string) => {
    try {
      console.log('🔄 Cargando contrato específico desde API:', contractId);
      setLoading(true);
      
      const response = await fetch(`https://crm-develop.grainchain.io/api/v1/crm-contracts/contracts/${contractId}?access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjVieGczWHVjR09ldDJWd3lhUWMyQSJ9.eyJpc3MiOiJodHRwczovL2dyYWluY2hhaW4tZGV2LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NTBjNTkxN2UzMzE3ZTFhNWI1M2E1NmEiLCJhdWQiOlsiaHR0cHM6Ly9kZXZlbG9wZXJzLmdyYWluY2hhaW4uaW8iLCJodHRwczovL2dyYWluY2hhaW4tZGV2LnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NTUxNjQ1NDcsImV4cCI6MTc1NTI1MDk0Nywic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF6cCI6InhOUXQyNjhxVklkRThTczRPSGp2aGMzU2oyWG9nYmROIn0.dCWR8y8Y2xKd6wevNXx3b5lZdyJzgBmj_YQy9eIFgAGHWqjJh9Xt6S9Zl9_W0mXNuEUr9SdUzN7y_Ry9fUcx_WVBWyE2fwV5Hqy0Eo2nNZYzHUfZE_4JdJ5FfqO8VJ6mWjt_JA7hF5Z3Q7H4zP8yN4W1A6B9C3Y2E5I7U9xNqJ8vL2dG6rT1S0oMfJ3bK8pQ4eR7Nw5A3zZcXvY6lT8hN1sQ9pL4kF6gE2wIjC5bB8aD0yH3vU6nJ9mL7cV5tR4eN8wP1uK3fG5jZ2sY9bQ7lM6aE4dT1hV0xJ8cW3rN5oL9kP2gF6vB3yU7nT4mC1sE0dR5jL8aH2qV9kW3fN7pG5bS6uY1tM4lC0eV8hJ3rQ9xZ2nF5kP7oL1aW4jU6vB9yS3gT8mC5nE0dR2hL6fQ7kV1xN9pG3bY5oA8lM4uT2sC6rJ7vW0kF5eN1qH3gL9pZ8bY4mT7aC5vN2xJ6sE1dF9kR0uL3gP5oW8hV4nM7tC2eQ6jB9yS1kL0fZ3gH5pN8vU4rA7mT2dE6cW1xJ9sL5bY3oQ8hM0kF7nP4gV6uC2eR1tN9jL3sW5fH8bY0mQ7pA4vC6xE2gN1kU9oL5hT8rJ3dF0sW7nP4bY1mV6uC9eQ3gH2kN5jL8vT0sA7pF4bY6mU1rC3eW9xH5kL8gN0vT7sJ2pQ6uM4bF1cY9eR5hL3wN8kV0jG7sP2oA6mU4bT1yC9eQ5xH8kL0vN3sJ7pF6bY4mR1uC2eW9gH5kT8sL0jN7vP3oA6mU4bQ1yC9eR5xH8`);
      
      if (response.ok) {
        const contractData = await response.json();
        console.log('✅ Contrato cargado desde API:', contractData.data);
        setCurrentContractData(contractData.data);
        updateState({ currentContract: contractData.data });
        setError(null);
      } else {
        console.log('❌ Error al cargar contrato desde API:', response.status);
        setError('Contrato no encontrado');
        setCurrentContractData(null);
      }
    } catch (err) {
      console.log('❌ Error de red al cargar contrato:', err);
      setError('Error al cargar el contrato');
      setCurrentContractData(null);
    } finally {
      setLoading(false);
    }
  };

  // Buscar y establecer el contrato específico al cargar la página
  useEffect(() => {
    console.log('=== EFFECT DE BÚSQUEDA EJECUTADO ===');
    console.log('Contract ID:', contractId);
    console.log('Contracts Data Length:', contractsData.length);
    
    if (contractId) {
      // Primero intentar encontrar en los datos de Redux
      if (contractsData.length > 0) {
        console.log('Buscando contrato con ID:', contractId);
        console.log('IDs disponibles en contractsData:', contractsData.map((c: any) => c.id));
        
        const foundContract = contractsData.find((contract: any) => contract.id === contractId);
        
        if (foundContract) {
          console.log('✅ Contrato ENCONTRADO en Redux, estableciendo en estado del componente');
          console.log('Contrato encontrado:', foundContract.folio);
          setCurrentContractData(foundContract);
          setLoading(false);
          
          // Solo actualizar Redux si es diferente para evitar loops
          if (contractState.currentContract?.id !== foundContract.id) {
            updateState({ currentContract: foundContract });
          }
          return;
        }
      }
      
      // Si no se encuentra en Redux, cargar desde API
      console.log('❌ Contrato NO encontrado en Redux, cargando desde API');
      loadSpecificContract(contractId);
    } else {
      console.log('❌ No hay contractId');
      setLoading(false);
    }
    console.log('=== FIN EFFECT ===');
  }, [contractId, contractsData]);

  // Efecto para persistir cambios de tab activo
  useEffect(() => {
    if (contractState.activeTab !== activeTab) {
      updateState({ activeTab });
    }
  }, [activeTab]);

  // Configuración de campos para el componente agnóstico
  const fieldConfig: FieldConfig[] = [
    { key: 'price', label: t('contractDetail.price'), color: 'black', format: 'currency' },
    { key: 'basis', label: t('contractDetail.basis'), color: 'black', format: 'currency' },
    { key: 'future', label: t('contractDetail.future'), color: 'black', format: 'currency' },
    { key: 'reserved', label: t('contractDetail.reserved'), color: 'blue', unit: 'bu60' },
    { key: 'delivered', label: t('contractDetail.settled'), color: 'green', unit: 'bu60' },
    { key: 'balance', label: t('contractDetail.yourBalance'), color: 'black', unit: 'bu60' }
  ];

  // Configuración del progress bar - solo configuración y campos
  const progressBarConfig: ProgressBarConfig = {
    settledField: 'delivered', // Campo que contiene el valor entregado
    reservedField: 'reserved', // Campo que contiene el valor reservado  
    totalField: 'quantity', // Campo que contiene el total para porcentajes
    label: t('contractDetail.progress'),
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
        future: (99 + Math.random() * 4).toFixed(2), // 99.00-103.00 como precio futures
        totalPayment: quantity * (Math.floor(Math.random() * 1000) + 1500),
        borderColor: color.border,
        dotColor: color.dot,
        textColor: color.text
      };
    });

    // 5 cards adicionales con empates para probar prioridad de colores
    const tieCards = [
      // Card 11: Empate 240-240 (60% cada uno)
      {
        id: '11',
        contractNumber: 'SPC-46-SUBC-11',
        quantity: 400,
        reserved: 240, // 60%
        delivered: 240, // 60% - EMPATE
        balance: 160,
        unit: 'bu60',
        thresholds: { min: 360, max: 440 },
        basis: 1500,
        price: 2000,
        future: 101.25,
        totalPayment: 400 * 2000,
        borderColor: 'border-l-yellow-500',
        dotColor: 'bg-yellow-500',
        textColor: 'text-yellow-600'
      },
      // Card 12: Empate 360-360 (60% cada uno)
      {
        id: '12',
        contractNumber: 'SPC-46-SUBC-12',
        quantity: 600,
        reserved: 360, // 60%
        delivered: 360, // 60% - EMPATE
        balance: 240,
        unit: 'bu60',
        thresholds: { min: 540, max: 660 },
        basis: 1200,
        price: 1800,
        future: 99.75,
        totalPayment: 600 * 1800,
        borderColor: 'border-l-purple-500',
        dotColor: 'bg-purple-500',
        textColor: 'text-purple-600'
      },
      // Card 13: Empate 120-120 (60% cada uno)
      {
        id: '13',
        contractNumber: 'SPC-46-SUBC-13',
        quantity: 200,
        reserved: 120, // 60%
        delivered: 120, // 60% - EMPATE
        balance: 80,
        unit: 'bu60',
        thresholds: { min: 180, max: 220 },
        basis: 1800,
        price: 2200,
        future: 102.50,
        totalPayment: 200 * 2200,
        borderColor: 'border-l-pink-500',
        dotColor: 'bg-pink-500',
        textColor: 'text-pink-600'
      },
      // Card 14: Empate 300-300 (60% cada uno)
      {
        id: '14',
        contractNumber: 'SPC-46-SUBC-14',
        quantity: 500,
        reserved: 300, // 60%
        delivered: 300, // 60% - EMPATE
        balance: 200,
        unit: 'bu60',
        thresholds: { min: 450, max: 550 },
        basis: 1600,
        price: 1900,
        future: 100.80,
        totalPayment: 500 * 1900,
        borderColor: 'border-l-indigo-500',
        dotColor: 'bg-indigo-500',
        textColor: 'text-indigo-600'
      },
      // Card 15: Empate 480-480 (60% cada uno)
      {
        id: '15',
        contractNumber: 'SPC-46-SUBC-15',
        quantity: 800,
        reserved: 480, // 60%
        delivered: 480, // 60% - EMPATE
        balance: 320,
        unit: 'bu60',
        thresholds: { min: 720, max: 880 },
        basis: 1300,
        price: 2100,
        future: 98.95,
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
                ID Contract #{currentContractData?.folio || 'N/A'}
              </h2>
              <div className="flex gap-3 items-center mt-1">
                <span className="text-base font-bold text-gray-600 dark:text-gray-400">
                  Contract: {currentContractData?.type === 'purchase' ? 'Purchase' : 'Sale'}
                </span>
                <Badge 
                  variant="secondary" 
                  className={`text-sm px-2 py-1 ${
                    currentContractData?.price_schedule?.[0]?.pricing_type === 'fixed' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                  }`}
                >
                  {currentContractData?.price_schedule?.[0]?.pricing_type || 'basis'}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col space-y-2 items-end">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t('contractDetail.statusContract')}: <span className="text-green-600 dark:text-green-400">
                  {currentContractData?.status || 'Active'}
                </span>
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-gray-600 border-gray-600 hover:bg-gray-50">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  onClick={() => {
                    console.log('=== DEBUG: Estado del Componente ===');
                    console.log('Contract ID actual:', contractId);
                    console.log('Estado del componente currentContractData:');
                    
                    if (currentContractData) {
                      console.log(JSON.stringify(currentContractData, null, 2));
                    } else {
                      console.log('NULL - No hay contrato en el estado del componente');
                    }
                    
                    console.log('Estado Redux del componente:', contractState);
                    console.log('=== FIN DEBUG ===');
                  }}
                >
                  Debug
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
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {currentContractData?.participants?.find((p: any) => p.role === 'seller')?.name || 'Test Seller LLC'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Street 10, Arizona City, AZ 23412, USA
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6 h-[320px]">
          {/* Left Column - Tabs within Card */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">{t('contractDetail.generalInformation')}</TabsTrigger>
                  <TabsTrigger value="contact">{t('contractDetail.remarks')}</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.commodity')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-xs">
                        {currentContractData?.commodity?.name || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.quantityUnits')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatNumber({ 
                          value: currentContractData?.quantity || 0, 
                          minDecimals: 0, 
                          maxDecimals: 0,
                          formatPattern: '0,000.00',
                          roundMode: 'truncate'
                        })} {currentContractData?.measurement_unit || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.thresholds')}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('min')}: {formatNumber({ 
                          value: currentContractData?.thresholds?.min_thresholds_weight || 0, 
                          minDecimals: 0, 
                          maxDecimals: 0,
                          formatPattern: '0,000.00',
                          roundMode: 'truncate'
                        })} {currentContractData?.measurement_unit || 'N/A'} | {t('max')}: {formatNumber({ 
                          value: currentContractData?.thresholds?.max_thresholds_weight || 0, 
                          minDecimals: 0, 
                          maxDecimals: 0,
                          formatPattern: '0,000.00',
                          roundMode: 'truncate'
                        })} {currentContractData?.measurement_unit || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.price')}:</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        $ {formatNumber({ 
                          value: currentContractData?.price_schedule?.[0]?.price || 0, 
                          minDecimals: 2, 
                          maxDecimals: 2,
                          formatPattern: '0,000.00',
                          roundMode: 'truncate'
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('contractDetail.basis')}:</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        $ {formatNumber({ 
                          value: currentContractData?.price_schedule?.[0]?.basis || 0, 
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
                          value: currentContractData?.price_schedule?.[0]?.future_price || 0, 
                          minDecimals: 2, 
                          maxDecimals: 2,
                          formatPattern: '0,000.00',
                          roundMode: 'truncate'
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reference Number:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentContractData?.reference_number || 'N/A'}
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

                <TabsContent value="instructions" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Special Instructions:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">-</p>
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
            <CardContent className="space-y-3">
              {/* Fijado Section - Amarillo con datos aleatorios */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Fijado</span>
                  <span>Abierto</span>
                </div>
                <Progress 
                  value={65} 
                  className="w-full h-3"
                  indicatorClassName="bg-yellow-500 dark:bg-yellow-400"
                />
                <div className="flex justify-between items-center">
                  <div className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                    {formatNumber({ 
                      value: 910, 
                      minDecimals: 2, 
                      maxDecimals: 2,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })} bu60
                  </div>
                  <div className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                    {formatNumber({ 
                      value: 490, 
                      minDecimals: 2, 
                      maxDecimals: 2,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })} bu60
                  </div>
                </div>
              </div>

              {/* Reservado Section - Azul (movido al medio) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Reservado</span>
                  <span>Disponible</span>
                </div>
                <Progress 
                  value={75} 
                  className="w-full h-3"
                  indicatorClassName="bg-blue-500 dark:bg-blue-400"
                />
                <div className="flex justify-between items-center">
                  <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                    {formatNumber({ 
                      value: 1050, 
                      minDecimals: 2, 
                      maxDecimals: 2,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })} bu60
                  </div>
                  <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                    {formatNumber({ 
                      value: 350, 
                      minDecimals: 2, 
                      maxDecimals: 2,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })} bu60
                  </div>
                </div>
              </div>

              {/* Liquidado Section - Verde (movido abajo) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Liquidado</span>
                  <span>Sin liquidar</span>
                </div>
                <Progress 
                  value={25} 
                  className="w-full h-3"
                  indicatorClassName="bg-green-500 dark:bg-green-400"
                />
                <div className="flex justify-between items-center">
                  <div className="text-base font-bold text-green-600 dark:text-green-400">
                    {formatNumber({ 
                      value: 350, 
                      minDecimals: 2, 
                      maxDecimals: 2,
                      formatPattern: '0,000.00',
                      roundMode: 'truncate'
                    })} bu60
                  </div>
                  <div className="text-base font-bold text-green-600 dark:text-green-400">
                    {formatNumber({ 
                      value: 1050, 
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



        {/* Sub-contracts Section */}
        <div className="mt-8">
          <SubContractsSection
            subContracts={subContracts}
            fields={fieldConfig}
            progressBar={progressBarConfig}
            onNewSubContract={() => setLocation(`/purchase-contracts/${contractId}/sub-contracts/create`)}
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
