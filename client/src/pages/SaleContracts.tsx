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



export default function SaleContracts() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { commodities, loading: commoditiesLoading, error: commoditiesError } = useCommodities();
  
  // Hook para persistir estado de la página
  const { pageState, updateState } = useContractsPageState('saleContracts');
  const { handleNavigateToPage } = useNavigationHandler();
  usePageTracking('/sale-contracts');
  
  // Notificar navegación al cargar la página
  useEffect(() => {
    console.log('🔄 SALE CONTRACTS PAGE: Cargando página y ejecutando navegación jerárquica');
    handleNavigateToPage('saleContracts');
  }, []);
  
  // Estado principal organizado como JSON
  const [pageStateData, setPageStateData] = useState<{
    selectedFilters: Record<string, any>;
    contracts: PurchaseContract[];
  }>(() => {
    // Inicializar filtros con valores por defecto o desde el estado persistido
    const defaultFilters = { pricingType: ['all'], commodity: ['all'] };
    const saved = pageState.filters;
    
    const selectedFilters = saved && (
      (saved.pricingType && !saved.pricingType.includes('all')) || 
      (saved.commodity && !saved.commodity.includes('all'))
    ) ? saved : defaultFilters;

    return {
      selectedFilters,
      contracts: pageState.contractsData || []
    };
  });

  // Estados adicionales para el control de la UI
  const [currentPage, setCurrentPage] = useState(pageState.currentPage || 1);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [totalContracts, setTotalContracts] = useState(0);

  // Para compatibilidad con componentes existentes
  const selectedFilters = pageStateData.selectedFilters;
  const contracts = pageStateData.contracts;
  
  // Estado para guardar los datos de la tabla que vienen del API (mantenido para compatibilidad)
  const [tableData, setTableData] = useState<{
    contracts: PurchaseContract[];
    totalElements: number;
    currentPage: number;
    filters: any;
  }>({
    contracts: [],
    totalElements: 0,
    currentPage: 1,
    filters: {}
  });

  // Estado para parámetros de tabla (paginación, búsqueda, etc)
  const [tableParams, setTableParams] = useState({
    page: 1,
    limit: 5,
    search: '',
    sort: null as any
  });

  // Efecto para persistir cambios de filtros y página
  useEffect(() => {
    updateState({
      filters: pageStateData.selectedFilters,
      currentPage,
      searchTerm: '',
      contractsData: pageStateData.contracts
    });
  }, [JSON.stringify(pageStateData.selectedFilters), currentPage, pageStateData.contracts.length]);

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

  // Auto-reload table data when selectedFilters change
  useEffect(() => {
    const reloadTableWithFilters = async () => {
      if (commodities.length > 0) {
        console.log('🔄 Filtros cambiaron, recargando tabla con nuevos filtros:', selectedFilters);
        
        const basicParams = {
          page: 1,
          pageSize: tableParams.limit,
          search: '',
          sort: undefined
        };
        
        await handleFetchContractsData(basicParams);
        console.log('✅ Tabla recargada con filtros actualizados');
      }
    };

    reloadTableWithFilters();
  }, [selectedFilters, commodities.length]);

  // Función de fetch de datos usando el servicio externo
  const handleFetchContractsData: DataFetchFunction<PurchaseContract> = async (params): Promise<{ data: PurchaseContract[]; total: number; totalPages: number; }> => {
    setContractsLoading(true);
    const startTime = Date.now();
    
    try {
      const partitionKey = localStorage.getItem('partitionKey') || localStorage.getItem('partition_key');
      const idToken = localStorage.getItem('id_token');
      const filters = selectedFilters;
      
      console.log('📤 ENVIANDO AL ENDPOINT - Filtros:', filters);
      console.log('📤 ENVIANDO AL ENDPOINT - Parámetros completos:', { ...params, filters });

      const result = await fetchContractsData({
        page: params.page,
        limit: params.pageSize,
        search: params.search,
        sort: params.sort,
        filters,
        commodities,
        authData: {
          partitionKey: partitionKey || '',
          idToken: idToken || ''
        },
        contractType: 'sale'
      });

      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 300;
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      setTableData({
        contracts: result.data || [],
        totalElements: result.total || 0,
        currentPage: params.page,
        filters: filters
      });

      setPageStateData(prev => ({ 
        ...prev, 
        contracts: result.data || []
      }));
      
      console.log('🔄 DATOS ACTUALIZADOS - Total contratos encontrados:', (result.data || []).length);
      console.log('🔄 DATOS ACTUALIZADOS - Contratos (primeros 2):', (result.data || []).slice(0, 2).map(c => ({ folio: c.folio, commodity: c.commodity?.name })));

      updateState({
        contractsData: result.data || []
      });

      return result;
    } catch (error) {
      console.error('❌ Error cargando contratos:', error);
      
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 300;
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      return {
        data: [] as PurchaseContract[],
        total: 0,
        totalPages: 0
      };
    } finally {
      setContractsLoading(false);
    }
  };

  // Función para toggle de filtros
  const toggleFilter = (filterKey: string, value: any) => {
    console.log('🔄 TOGGLE FILTER:', filterKey, 'Value:', value);
    console.log('Current filters before toggle:', selectedFilters);
    
    setPageStateData(prev => {
      const currentFilters = prev.selectedFilters;
      
      if (filterKey === 'pricingType') {
        const currentValues = currentFilters[filterKey] || [];
        const newValues = currentValues.includes(value) ? [] : [value];
        return { ...prev, selectedFilters: { ...currentFilters, [filterKey]: newValues } };
      }
      
      if (filterKey === 'commodity') {
        const currentValues = currentFilters[filterKey] || [];
        
        if (value === 'all') {
          if (currentValues.includes('all')) {
            return prev;
          }
          return { ...prev, selectedFilters: { ...currentFilters, [filterKey]: ['all'] } };
        }
        
        let newValues = currentValues.filter((v: any) => v !== 'all');
        
        if (newValues.includes(value)) {
          newValues = newValues.filter((v: any) => v !== value);
          if (newValues.length === 0) {
            newValues = ['all'];
          }
        } else {
          newValues = [...newValues, value];
        }
        
        console.log('📦 COMMODITY - New values:', newValues);
        return { ...prev, selectedFilters: { ...currentFilters, [filterKey]: newValues } };
      }
      
      const currentValues = currentFilters[filterKey] || [];
      const newValues = Array.isArray(currentValues)
        ? (currentValues.includes(value) 
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value])
        : [value];
      
      const newFilters = { ...currentFilters, [filterKey]: newValues };
      console.log('📋 Final filter result:', newFilters);
      return { ...prev, selectedFilters: newFilters };
    });
    setCurrentPage(1);
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<PurchaseContract>[] = [
    {
      key: 'pricingIndicator',
      titleKey: '',
      render: (contract: PurchaseContract) => {
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
      render: (contract: PurchaseContract) => {
        const buyer = contract.participants?.find(p => p.role === 'buyer');
        return (
          <span className="font-medium text-gray-900 dark:text-white">
            {buyer?.name || 'Unknown'}
          </span>
        );
      },
      sortable: true,
      width: '200px'
    },
    {
      key: 'date',
      titleKey: 'date',
      render: (contract: PurchaseContract) => {
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
      render: (contract: PurchaseContract) => (
        <span className="text-gray-900 dark:text-white">{contract.commodity.name}</span>
      ),
      sortable: true,
      width: '180px'
    },
    {
      key: 'quantity',
      titleKey: 'quantity',
      render: (contract: PurchaseContract) => {
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
      render: (contract: PurchaseContract) => {
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
      render: (contract: PurchaseContract) => {
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
      render: (contract: PurchaseContract) => {
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
      render: (contract: PurchaseContract) => {
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
      render: (contract: PurchaseContract) => (
        <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
          {contract.folio || contract._id}
        </span>
      ),
      sortable: true,
      width: '150px'
    }
  ];

  return (
    <DashboardLayout title={t('saleContracts')}>
      <div className="space-y-6">
        {/* Header with title and create button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('saleContractsList')}
          </h1>
          <Link href="/purchase-contracts/create" className="inline-block">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              {t('createSaleContract')}
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
                      ? 'bg-purple-500 hover:bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {t(filter.labelKey)}
            </Button>
          ))}
        </div>

        {/* Commodity Filters */}
        <div className="flex flex-wrap gap-2">
          {commodityFilters.map((commodity) => (
            <Button
              key={commodity.key}
              variant="ghost"
              size="sm"
              onClick={() => toggleFilter('commodity', commodity.value)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                selectedFilters.commodity?.includes(commodity.value)
                  ? 'bg-green-500 hover:bg-green-600 text-white border-green-600 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {commodity.value === 'all' ? t('filters.all') : commodity.label}
            </Button>
          ))}
        </div>

        {/* Table without filters, title, or create button */}
        <GenericTable
          columns={columns}
          data={tableData.contracts}
          totalElements={tableData.totalElements}
          totalPages={Math.ceil(tableData.totalElements / tableParams.limit)}
          loading={contractsLoading}
          getItemId={(item: PurchaseContract) => item._id}
          showFilters={false}
          sortFieldMapping={{
            'customer': 'participants.name',
            'date': 'contract_date',
            'commodity': 'commodity.name',
            'quantity': 'quantity',
            'price': 'price_schedule.price',
            'basis': 'price_schedule.basis',
            'future': 'price_schedule.future_price',
            'reserve': 'inventory.reserved',
            'id': 'folio'
          }}
          onPageChange={(page) => {
            const newParams = { page, pageSize: tableParams.limit, search: tableParams.search, sort: tableParams.sort };
            setTableParams({ ...tableParams, page });
            handleFetchContractsData(newParams);
          }}
          onRowClick={(contract) => {
            setLocation(`/purchase-contracts/${contract.id || contract._id}`);
          }}
          customActions={(contract) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/purchase-contracts/${contract.id || contract._id}`);
                  }}
                >
                  {t('viewDetails')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement edit functionality
                  }}
                >
                  {t('edit')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </div>
    </DashboardLayout>
  );
}