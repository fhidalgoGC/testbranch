import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
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

// Interface para la respuesta de contratos
interface ContractResponse {
  data: Array<{
    _id: string;
    contract_number: string;
    commodity: {
      commodity_id: string;
      name: string;
    };
    customer: {
      name: string;
    };
    pricing_type: string;
    price?: number;
    basis?: number;
    futures?: number;
    freight_cost?: number;
    quantity: number;
    measurement_unit: string;
    delivery_date: string;
    created_at: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

export default function PurchaseContracts() {
  const { t } = useTranslation();
  const { commodities, loading: commoditiesLoading, error: commoditiesError } = useCommodities();
  
  // Estados para la carga de contratos
  const [contracts, setContracts] = useState<PurchaseContract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [totalContracts, setTotalContracts] = useState(0);

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
      const accessToken = localStorage.getItem('access_token') || '';

      if (!partitionKey || !accessToken) {
        console.error('No hay datos de autenticación disponibles para contratos');
        setContracts([]);
        return;
      }

      // Construir filtro
      const filter: any = {
        type: "purchase"
      };

      // Agregar filtro de commodity si está seleccionado
      if (activeFilters.commodity && activeFilters.commodity !== 'all') {
        filter['commodity.commodity_id'] = { $in: [activeFilters.commodity] };
      }

      // Agregar filtro de pricing_type si está seleccionado
      if (activeFilters.pricingType && activeFilters.pricingType !== 'all') {
        filter.pricing_type = activeFilters.pricingType;
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
        'authorization': `Bearer ${accessToken}`,
        'bt-organization': partitionKey,
        'bt-uid': partitionKey,
        'organization_id': partitionKey,
        'origin': 'https://contracts-develop.grainchain.io',
        'pk-organization': partitionKey
      };

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ContractResponse = await response.json();
      console.log('Contracts response:', data);

      // Mapear los datos a nuestro formato
      const mappedContracts: PurchaseContract[] = data.data.map(contract => ({
        id: contract._id,
        folio: contract.contract_number,
        reference_number: contract.contract_number,
        commodity: contract.commodity,
        participants: [
          {
            people_id: '1',
            name: contract.customer.name,
            role: 'buyer' as const
          }
        ],
        characteristics: {},
        type: 'purchase',
        sub_type: 'standard',
        quantity: contract.quantity,
        measurement_unit_id: contract.measurement_unit,
        measurement_unit: contract.measurement_unit,
        price_schedule: [{
          pricing_type: contract.pricing_type as 'fixed' | 'basis',
          price: contract.price || 0,
          basis: contract.basis || 0,
          basis_operation: 'add' as const,
          future_price: contract.futures || 0,
          option_month: 'Dec',
          option_year: 2025,
          payment_currency: 'USD' as const,
          exchange: 'CBOT'
        }],
        logistic_schedule: [{
          logistic_payment_responsability: 'buyer' as const,
          logistic_coordination_responsability: 'seller' as const,
          freight_cost: {
            type: 'fixed' as const,
            min: 0,
            max: 0,
            cost: contract.freight_cost || 0
          },
          payment_currency: 'USD' as const
        }],
        shipping_start_date: contract.delivery_date,
        shipping_end_date: contract.delivery_date,
        contract_date: contract.created_at,
        delivered: 'FOB',
        transport: 'Truck',
        weights: 'Standard',
        inspections: 'Required',
        proteins: 'Standard',
        application_priority: 1,
        thresholds: {
          min_thresholds_percentage: 5,
          min_thresholds_weight: Math.floor(contract.quantity * 0.05),
          max_thresholds_percentage: 95,
          max_thresholds_weight: Math.floor(contract.quantity * 0.95)
        },
        status: 'active',
        grade: 'standard',
        inventory: {
          total: contract.quantity,
          open: contract.quantity,
          fixed: 0,
          unsettled: 0,
          settled: 0,
          reserved: 0
        }
      }));

      console.log('Mapped contracts:', mappedContracts);
      setContracts(mappedContracts);
      setTotalContracts(data.total);

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

  // Función de fetch de datos que llama a la API real
  const fetchContractsData: DataFetchFunction<PurchaseContract> = async (params) => {
    try {
      // Convertir filtros al formato esperado por la API
      const activeFilters: Record<string, any> = {};
      
      if (params.filters?.pricingType?.length && !params.filters.pricingType.includes('all')) {
        activeFilters.pricingType = params.filters.pricingType[0]; // Solo tomar el primer filtro
      }
      
      if (params.filters?.commodity?.length && !params.filters.commodity.includes('all')) {
        activeFilters.commodity = params.filters.commodity[0]; // Solo tomar el primer filtro
      }
      
      // Construir sortConfig si hay ordenamiento
      let sortConfig = null;
      if (params.sort) {
        sortConfig = {
          field: params.sort.key,
          direction: params.sort.direction
        };
      }
      
      // Llamar a la función fetchContracts
      await fetchContracts(
        params.page || 1,
        params.pageSize || 10,
        activeFilters,
        params.search || '',
        sortConfig
      );
      
      // Retornar la estructura correcta
      return {
        data: contracts,
        total: totalContracts,
        totalPages: Math.ceil(totalContracts / (params.pageSize || 10))
      };
    } catch (error) {
      console.error('Error in fetchContractsData:', error);
      return {
        data: [],
        total: 0,
        totalPages: 0
      };
    }
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
          <span className="text-gray-900 dark:text-white">
            {formattedQuantity} {contract.measurement_unit}
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
        return <span className="text-gray-900 dark:text-white font-mono">$ {formattedPrice}</span>;
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
        return <span className="text-gray-900 dark:text-white font-mono">{formattedBasis}</span>;
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
        return <span className="text-gray-900 dark:text-white font-mono">{formattedFuture}</span>;
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'reserve',
      titleKey: 'reserve',
      render: (contract) => {
        const reserveValue = contract.logistic_schedule?.[0]?.freight_cost?.cost || 0;
        const formattedReserve = formatNumber({
          value: reserveValue,
          minDecimals: 2,
          maxDecimals: 4,
          formatPattern: "0,000.00",
          roundMode: "truncate"
        });
        return <span className="text-gray-900 dark:text-white font-mono">$ {formattedReserve}</span>;
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
      <GenericTable
        columns={columns}
        fetchData={fetchContractsData}
        data={contracts}
        loading={contractsLoading}
        totalItems={totalContracts}
        searchable={true}
        filters={[
          {
            key: 'pricingType',
            titleKey: 'pricingType',
            type: 'button',
            availableValues: [
              {
                key: 'all',
                value: 'all',
                label: { key: 'filters.all' }
              },
              {
                key: 'fixed',
                value: 'fixed',
                label: { key: 'filters.fixed' }
              },
              {
                key: 'basis',
                value: 'basis',
                label: { key: 'filters.basis' }
              }
            ]
          },
          {
            key: 'commodity',
            titleKey: 'commodity',
            type: 'button',
            availableValues: commodityFilters
          }
        ]}
        defaultFilters={{
          pricingType: ['all'],
          commodity: ['all']
        }}
        showPagination={true}
        showSearch={true}
        className="w-full"
      />
    </DashboardLayout>
  );
}