import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useContractsPageState, usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCommodities } from '@/hooks/useCommodities';
import { 
  GenericTable, 
  TableColumn, 
  FilterOption, 
  DataFetchFunction 
} from '@/components/general/StandardTable';
import { PurchaseContract } from '@/types/purchaseContract.types';
import { formatNumber } from '@/lib/numberFormatter';
import { fetchContractsData } from '@/services/contractsService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Link, useLocation } from 'wouter';



export default function PurchaseContracts() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { commodities, loading: commoditiesLoading, error: commoditiesError } = useCommodities();
  
  // Hook para persistir estado de la página
  const { pageState, updateState } = useContractsPageState('purchaseContracts');
  const { handleNavigateToPage } = useNavigationHandler();
  usePageTracking('/purchase-contracts');
  
  // Notificar navegación al cargar la página
  useEffect(() => {
    console.log('🔄 PURCHASE CONTRACTS PAGE: Cargando página y ejecutando navegación jerárquica');
    handleNavigateToPage('purchaseContracts');
  }, []);
  
  // Estados para la carga de contratos
  const [contracts, setContracts] = useState<PurchaseContract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [totalContracts, setTotalContracts] = useState(0);

  // Estados para filtros - siempre inicializar en 'all' por defecto
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(() => {
    // Forzar que siempre inicie en 'all' - ignorar estado persistido inicialmente
    const defaultFilters = { pricingType: ['all'], commodity: ['all'] };
    
    // Solo usar estado persistido si ya hay filtros aplicados diferentes a 'all'
    const saved = pageState.filters;
    if (saved && (
      (saved.pricingType && !saved.pricingType.includes('all')) || 
      (saved.commodity && !saved.commodity.includes('all'))
    )) {
      return saved;
    }
    
    return defaultFilters;
  });
  const [currentPage, setCurrentPage] = useState(pageState.currentPage || 1);

  // Efecto para persistir cambios de filtros y página - usando JSON.stringify para comparación profunda
  useEffect(() => {
    updateState({
      filters: selectedFilters,
      currentPage,
      searchTerm: '', // Agregar cuando implementemos búsqueda
    });
  }, [JSON.stringify(selectedFilters), currentPage]); // Eliminar updateState de deps

  // Debug: Log commodity data
  useEffect(() => {
    console.log('Commodities data:', commodities);
    console.log('Commodities loading:', commoditiesLoading);
    console.log('Commodities error:', commoditiesError);
  }, [commodities, commoditiesLoading, commoditiesError]);
  
  // Crear filtros de commodity basados en los datos reales
  const commodityFilters: FilterOption[] = [
    {
      key: 'all',
      value: 'all',
      label: { key: 'filters.all' }
    },
    ...commodities.map(commodity => ({
      key: commodity.key,
      value: commodity.value,
      label: commodity.label
    }))
  ];

  // Debug: Log commodity filters
  useEffect(() => {
    console.log('Commodity filters:', commodityFilters);
  }, [commodityFilters]);

  // Función para cargar contratos desde la API
  const fetchContracts = async (
    page: number = 1,
    limit: number = 10,
    activeFilters: Record<string, any> = {},
    searchTerm: string = '',
    sortConfig: { field: string; direction: string } | null = null
  ) => {
    try {
      setContractsLoading(true);
      setContractsError(null);

      // Obtener datos de autenticación
      const partitionKey = localStorage.getItem('partition_key') || '';
      const idToken = localStorage.getItem('id_token') || '';

      if (!partitionKey || !idToken) {
        console.error('No hay datos de autenticación disponibles para contratos');
        setContracts([]);
        return;
      }

      // Construir filtro
      const filter: any = {
        type: "purchase"
      };

      // Agregar filtro de commodity si está seleccionado
      if (activeFilters.commodity && !activeFilters.commodity.includes('all')) {
        // Mapear todos los valores seleccionados a sus IDs correspondientes
        const selectedCommodityIds = activeFilters.commodity
          .map((commodityValue: string) => commodities.find((c: any) => c.value === commodityValue))
          .filter((commodity: any): commodity is NonNullable<typeof commodity> => commodity !== undefined)
          .map((commodity: any) => commodity.key);
        
        if (selectedCommodityIds.length > 0) {
          filter['commodity.commodity_id'] = { $in: selectedCommodityIds };
        }
      }

      // Agregar filtro de pricing_type si está seleccionado
      if (activeFilters.pricingType && !activeFilters.pricingType.includes('all')) {
        filter['price_schedule.pricing_type'] = activeFilters.pricingType[0];
      }

      // Construir parámetros de URL
      const params = new URLSearchParams({
        all: 'true',
        filter: JSON.stringify(filter),
        page: page.toString(),
        limit: limit.toString()
      });

      // Agregar ordenamiento si existe
      if (sortConfig) {
        params.append(`sort[${sortConfig.field}]`, sortConfig.direction === 'asc' ? '1' : '-1');
      } else {
        // Ordenamiento por defecto por fecha de creación descendente
        params.append('sort[created_at]', '-1');
      }

      const url = `https://trm-develop.grainchain.io/api/v1/contracts/sp-contracts?${params.toString()}`;
      console.log('Fetching contracts from:', url);

      // Headers de la petición
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

      console.log('Fetching contracts with headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();
      console.log('Contracts response:', data);

      // Mapear los datos de la API real a nuestro formato
      const mappedContracts: PurchaseContract[] = data.data.map((contract: any) => ({
        id: contract._id || contract.id,
        folio: contract.folio,
        reference_number: contract.folio,
        commodity: contract.commodity,
        participants: contract.participants,
        characteristics: contract.characteristics,
        type: contract.type as 'purchase',
        sub_type: contract.sub_type as 'direct' | 'imported' | 'importedFreight',
        quantity: contract.quantity,
        measurement_unit_id: contract.measurement_unit_id,
        measurement_unit: contract.measurement_unit,
        price_schedule: contract.price_schedule,
        logistic_schedule: contract.logistic_schedule,
        shipping_start_date: contract.shipping_start_date,
        shipping_end_date: contract.shipping_end_date,
        contract_date: contract.contract_date,
        delivered: contract.delivered,
        transport: contract.transport,
        weights: contract.weights,
        inspections: contract.inspections,
        proteins: contract.proteins,
        application_priority: contract.application_priority,
        thresholds: contract.thresholds,
        status: contract.status,
        grade: typeof contract.grade === 'string' ? parseInt(contract.grade) || 0 : contract.grade,
        inventory: contract.inventory
      }));

      console.log('Mapped contracts:', mappedContracts);
      console.log('Setting contracts in state. Total contracts:', mappedContracts.length);
      console.log('First contract example:', mappedContracts[0] || 'No contracts found');
      console.log('=== TODOS LOS IDs MAPEADOS ===');
      console.log('IDs de contratos cargados:', mappedContracts.map(c => ({ id: c.id, folio: c.folio })));
      console.log('===========================');
      
      setContracts(mappedContracts);
      setTotalContracts(data._meta.total_elements);
      
      // Guardar contratos en Redux state para uso en otras páginas
      updateState({
        contractsData: mappedContracts
      });

    } catch (error) {
      console.error('Error al cargar contratos:', error);
      setContractsError(error instanceof Error ? error.message : 'Error al cargar contratos');
      setContracts([]);
    } finally {
      setContractsLoading(false);
    }
  };

  // Cargar contratos al montar el componente
  useEffect(() => {
    fetchContracts();
  }, []);

  // Función de fetch de datos usando el servicio externo
  const handleFetchContractsData: DataFetchFunction<PurchaseContract> = async (params) => {
    // Obtener datos de autenticación desde localStorage
    const partitionKey = localStorage.getItem('partitionKey') || localStorage.getItem('partition_key');
    const idToken = localStorage.getItem('id_token');

    // Aplicar filtros seleccionados
    const filters = selectedFilters;

    return await fetchContractsData({
      ...params,
      filters,
      commodities,
      authData: {
        partitionKey: partitionKey || '',
        idToken: idToken || ''
      }
    });
  };

  // Función para toggle de filtros
  const toggleFilter = (filterKey: string, value: any) => {
    setSelectedFilters(prev => {
      // Comportamiento especial para pricingType: solo un valor a la vez
      if (filterKey === 'pricingType') {
        const currentValues = prev[filterKey] || [];
        // Si ya está seleccionado, lo deseleccionamos (permitir quitar el filtro)
        const newValues = currentValues.includes(value) 
          ? [] 
          : [value]; // Solo un valor seleccionado a la vez
        
        return { ...prev, [filterKey]: newValues };
      }
      
      // Comportamiento especial para commodity: "All" es mutuamente exclusivo
      if (filterKey === 'commodity') {
        const currentValues = prev[filterKey] || [];
        
        // Si se selecciona "all"
        if (value === 'all') {
          // Si "all" ya está seleccionado, no hacer nada (mantenerlo seleccionado)
          if (currentValues.includes('all')) {
            return prev;
          }
          // Si "all" no está seleccionado, seleccionarlo y deseleccionar todo lo demás
          return { ...prev, [filterKey]: ['all'] };
        }
        
        // Si se selecciona cualquier valor que no es "all"
        // Primero remover "all" si está presente
        let newValues = currentValues.filter((v: any) => v !== 'all');
        
        // Luego aplicar la lógica normal de toggle
        if (newValues.includes(value)) {
          newValues = newValues.filter((v: any) => v !== value);
          // Si no queda ningún valor seleccionado, volver a "all"
          if (newValues.length === 0) {
            newValues = ['all'];
          }
        } else {
          newValues = [...newValues, value];
        }
        
        return { ...prev, [filterKey]: newValues };
      }
      
      // Comportamiento por defecto para otros filtros (múltiple selección)
      const currentValues = prev[filterKey] || [];
      const newValues = Array.isArray(currentValues)
        ? (currentValues.includes(value) 
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value])
        : [value];
      
      return { ...prev, [filterKey]: newValues };
    });
    setCurrentPage(1);
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<PurchaseContract>[] = [
    {
      key: 'pricingIndicator',
      titleKey: '', // Sin título para esta columna
      render: (contract) => {
        const pricingType = contract.price_schedule?.[0]?.pricing_type;
        const bgColor = pricingType === 'basis' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900';
        
        return (
          <div className={`w-6 h-6 rounded-full ${bgColor}`}></div>
        );
      },
      sortable: false,
      width: '50px'
    },
    {
      key: 'customer',
      titleKey: 'customer',
      render: (contract) => {
        const seller = contract.participants?.find(p => p.role === 'seller');
        return (
          <span className="font-medium text-gray-900 dark:text-white">
            {seller?.name || 'Unknown'}
          </span>
        );
      },
      sortable: true,
      width: '200px'
    },
    {
      key: 'date',
      titleKey: 'date',
      render: (contract) => {
        const date = new Date(contract.contract_date || '');
        const formattedDate = date.toLocaleDateString('en-US', { 
          month: 'numeric', 
          day: 'numeric', 
          year: 'numeric' 
        });
        return <span className="text-gray-700 dark:text-gray-300">{formattedDate}</span>;
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'commodity',
      titleKey: 'commodity',
      render: (contract) => (
        <span className="text-gray-900 dark:text-white">{contract.commodity.name}</span>
      ),
      sortable: true,
      width: '180px'
    },
    {
      key: 'quantity',
      titleKey: 'quantity',
      render: (contract) => {
        const formattedQuantity = formatNumber({
          value: contract.quantity || 0,
          minDecimals: 2,
          maxDecimals: 2,
          formatPattern: "0,000.00",
          roundMode: "truncate"
        });
        return (
          <span className="text-gray-900 dark:text-white font-medium">
            {formattedQuantity} <span className="text-gray-500 dark:text-gray-400 text-sm">{contract.measurement_unit}</span>
          </span>
        );
      },
      sortable: true,
      width: '150px'
    },
    {
      key: 'price',
      titleKey: 'price',
      render: (contract) => {
        const priceValue = contract.price_schedule?.[0]?.price || 0;
        const formattedPrice = formatNumber({
          value: priceValue,
          minDecimals: 2,
          maxDecimals: 4,
          formatPattern: "0,000.00",
          roundMode: "truncate"
        });
        return <span className="text-green-600 dark:text-green-400 font-bold font-mono">$ {formattedPrice}</span>;
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'basis',
      titleKey: 'basis',
      render: (contract) => {
        const basisValue = contract.price_schedule?.[0]?.basis || 0;
        const formattedBasis = formatNumber({
          value: basisValue,
          minDecimals: 2,
          maxDecimals: 4,
          formatPattern: "0,000.00",
          roundMode: "truncate"
        });
        return <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">$ {formattedBasis}</span>;
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'future',
      titleKey: 'future',
      render: (contract) => {
        const futureValue = contract.price_schedule?.[0]?.future_price || 0;
        const formattedFuture = formatNumber({
          value: futureValue,
          minDecimals: 2,
          maxDecimals: 4,
          formatPattern: "0,000.00",
          roundMode: "truncate"
        });
        return <span className="text-orange-600 dark:text-orange-400 font-bold font-mono">$ {formattedFuture}</span>;
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'reserve',
      titleKey: 'reserve',
      render: (contract) => {
        const reserveValue = contract.inventory?.reserved || 0;
        const formattedReserve = formatNumber({
          value: reserveValue,
          minDecimals: 2,
          maxDecimals: 4,
          formatPattern: "0,000.00",
          roundMode: "truncate"
        });
        return (
          <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">
            {formattedReserve} <span className="text-gray-500 dark:text-gray-400 text-sm">{contract.measurement_unit}</span>
          </span>
        );
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'id',
      titleKey: 'id',
      render: (contract) => (
        <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
          {contract.folio || contract.id}
        </span>
      ),
      sortable: true,
      width: '150px'
    }
  ];

  return (
    <DashboardLayout title={t('purchaseContracts')}>
      <div className="space-y-6">
        {/* Header with title and create button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('purchaseContractsList')}
          </h1>
          <Link href="/purchase-contracts/create" className="inline-block">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              {t('createContract')}
            </Button>
          </Link>
        </div>

        {/* Pricing Type Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', value: 'all', labelKey: 'filters.all' },
            { key: 'fixed', value: 'fixed', labelKey: 'filters.fixed' },
            { key: 'basis', value: 'basis', labelKey: 'filters.basis' }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant="ghost"
              size="sm"
              onClick={() => toggleFilter('pricingType', filter.value)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                selectedFilters.pricingType?.includes(filter.value)
                  ? filter.value === 'all'
                    ? 'bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800/60 dark:to-blue-800/60 border-purple-400 dark:border-purple-500 text-purple-800 dark:text-purple-200 shadow-md hover:from-purple-300 hover:to-blue-300 dark:hover:from-purple-900/70 dark:hover:to-blue-900/70'
                    : filter.value === 'basis'
                    ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 shadow-md hover:bg-purple-200 hover:border-purple-400 dark:hover:bg-purple-900/50'
                    : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-md hover:bg-blue-200 hover:border-blue-400 dark:hover:bg-blue-900/50'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-purple-100 hover:border-purple-400 hover:text-purple-800 dark:hover:bg-purple-900/40 dark:hover:border-purple-400 dark:hover:text-purple-200'
              }`}
            >
              {t(filter.labelKey)}
            </Button>
          ))}
        </div>

        {/* Commodity Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFilter('commodity', 'all')}
            className={`px-4 py-2 rounded-full border transition-colors ${
              selectedFilters.commodity?.includes('all')
                ? 'bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800/60 dark:to-emerald-800/60 border-green-400 dark:border-green-500 text-green-800 dark:text-green-200 shadow-md hover:from-green-300 hover:to-emerald-300 dark:hover:from-green-900/70 dark:hover:to-emerald-900/70'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-100 hover:border-green-400 hover:text-green-800 dark:hover:bg-green-900/40 dark:hover:border-green-400 dark:hover:text-green-200'
            }`}
          >
            {t('filters.all')}
          </Button>
          {commodities.map((commodity) => (
            <Button
              key={commodity.key}
              variant="ghost"
              size="sm"
              onClick={() => toggleFilter('commodity', commodity.value)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                selectedFilters.commodity?.includes(commodity.value) && !selectedFilters.commodity?.includes('all')
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 shadow-md hover:bg-green-200 hover:border-green-400 dark:hover:bg-green-900/50'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-100 hover:border-green-400 hover:text-green-800 dark:hover:bg-green-900/40 dark:hover:border-green-400 dark:hover:text-green-200'
              }`}
            >
              {commodity.label}
            </Button>
          ))}
        </div>

        {/* Table without filters, title, or create button */}
        <GenericTable
          key={`${JSON.stringify(selectedFilters)}`}
          columns={columns}
          fetchData={handleFetchContractsData}
          defaultFilters={selectedFilters}
          actionMenuItems={[
            {
              key: 'view',
              labelKey: 'view',
              action: (contract: PurchaseContract) => {
                console.log('Ver contrato:', contract.id);
                handleNavigateToPage('contractDetail', contract.id);
                setLocation(`/purchase-contracts/${contract.id}`);
              }
            },
            {
              key: 'edit',
              labelKey: 'edit',
              action: (contract: PurchaseContract) => {
                console.log('Editar contrato:', contract.id);
                // Implementar navegación a editar
              }
            },
            {
              key: 'duplicate',
              labelKey: 'duplicate',
              action: (contract: PurchaseContract) => {
                console.log('Duplicar contrato:', contract.id);
                // Implementar duplicación
              }
            },
            {
              key: 'delete',
              labelKey: 'delete',
              action: (contract: PurchaseContract) => {
                console.log('Eliminar contrato:', contract.id);
                // Implementar eliminación
              },
              className: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            }
          ]}
        />
      </div>
    </DashboardLayout>
  );
}