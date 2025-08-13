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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';

// Interface para la respuesta de contratos basada en la respuesta real de la API
interface ContractResponse {
  data: Array<{
    _id: string;
    folio: string;
    type: string;
    sub_type: string;
    commodity: {
      commodity_id: string;
      name: string;
    };
    characteristics: {
      configuration_id: string;
      configuration_name: string;
    };
    grade: number;
    participants: Array<{
      people_id: string;
      name: string;
      role: string;
    }>;
    price_schedule: Array<{
      pricing_type: string;
      price: number;
      basis: number;
      basis_operation: string;
      future_price: number;
      option_month: string;
      option_year: number;
      payment_currency: string;
      exchange: string;
    }>;
    logistic_schedule: Array<{
      logistic_payment_responsability: string;
      logistic_coordination_responsability: string;
      freight_cost: {
        type: string;
        min: number;
        max: number;
        cost: number;
      };
      payment_currency: string;
    }>;
    quantity: number;
    measurement_unit_id: string;
    measurement_unit: string;
    shipping_start_date: string;
    shipping_end_date: string;
    contract_date: string;
    delivered: string;
    transport: string;
    weights: string;
    inspections: string;
    proteins: string;
    application_priority: number;
    thresholds: {
      min_thresholds_percentage: number;
      min_thresholds_weight: number;
      max_thresholds_percentage: number;
      max_thresholds_weight: number;
    };
    status: string;
    inventory: {
      total: number;
      open: number;
      fixed: number;
      unsettled: number;
      settled: number;
      reserved: number;
    };
    created_at: string;
  }>;
  _meta: {
    page_size: number;
    page_number: number;
    total_elements: number;
    total_pages: number;
  };
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
      if (activeFilters.commodity && activeFilters.commodity !== 'all') {
        // Si activeFilters.commodity es un array, mapearlo; si no, convertirlo en array
        const commodityValues = Array.isArray(activeFilters.commodity) 
          ? activeFilters.commodity 
          : [activeFilters.commodity];
        
        const selectedCommodityIds = commodityValues
          .map((commodityValue: string) => commodities.find(c => c.value === commodityValue))
          .filter((commodity): commodity is NonNullable<typeof commodity> => commodity !== undefined)
          .map(commodity => commodity.key);
        
        if (selectedCommodityIds.length > 0) {
          filter['commodity.commodity_id'] = { $in: selectedCommodityIds };
        }
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

      const data: ContractResponse = await response.json();
      console.log('Contracts response:', data);

      // Mapear los datos de la API real a nuestro formato
      const mappedContracts: PurchaseContract[] = data.data.map(contract => ({
        id: contract._id,
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
      setContracts(mappedContracts);
      setTotalContracts(data._meta.total_elements);

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
      // Obtener datos de autenticación
      const partitionKey = localStorage.getItem('partition_key') || '';
      const idToken = localStorage.getItem('id_token') || '';

      if (!partitionKey || !idToken) {
        console.error('No hay datos de autenticación disponibles para contratos en fetchContractsData');
        return {
          data: [],
          total: 0,
          totalPages: 0
        };
      }

      // Construir filtros para la API usando $and structure
      const andConditions: any[] = [
        { type: 'purchase' }
      ];
      
      if (params.filters?.pricingType?.length && !params.filters.pricingType.includes('all')) {
        andConditions.push({ 'price_schedule.pricing_type': params.filters.pricingType[0] });
      }
      
      if (params.filters?.commodity?.length && !params.filters.commodity.includes('all')) {
        // Mapear todos los valores seleccionados a sus IDs correspondientes
        const selectedCommodityIds = params.filters.commodity
          .map((commodityValue: string) => commodities.find(c => c.value === commodityValue))
          .filter((commodity): commodity is NonNullable<typeof commodity> => commodity !== undefined)
          .map(commodity => commodity.key);
        
        if (selectedCommodityIds.length > 0) {
          andConditions.push({ 'commodity.commodity_id': { $in: selectedCommodityIds } });
        }
      }

      // Agregar búsqueda si existe - implementar OR sobre todos los campos relevantes
      if (params.search) {
        const searchTerm = params.search.trim();
        if (searchTerm) {
          const orConditions: any[] = [
            // Buscar en participantes (seller/buyer names)
            { 'participants.name': { '$regex': `.*${searchTerm}`, '$options': 'i' } },
            // Buscar en commodity name
            { 'commodity.name': { '$regex': `.*${searchTerm}`, '$options': 'i' } },
            // Buscar en folio/reference number
            { 'folio': { '$regex': `.*${searchTerm}`, '$options': 'i' } },
            // Buscar en measurement unit
            { 'measurement_unit': { '$regex': `.*${searchTerm}`, '$options': 'i' } }
          ];

          // Intentar convertir a número para campos numéricos
          const numericValue = parseFloat(searchTerm);
          if (!isNaN(numericValue)) {
            orConditions.push(
              { 'price_schedule.price': numericValue },
              { 'price_schedule.basis': numericValue },
              { 'price_schedule.future_price': numericValue },
              { 'quantity': numericValue }
            );
          }

          andConditions.push({ '$or': orConditions });
        }
      }

      const apiFilter = { '$and': andConditions };

      // Construir parámetros de consulta usando el mismo formato que fetchContracts
      const queryParams = new URLSearchParams({
        all: 'true',
        filter: JSON.stringify(apiFilter),
        page: (params.page || 1).toString(),
        limit: (params.pageSize || 10).toString()
      });

      // Mapear campos de la UI a campos de la API para ordenamiento
      const sortFieldMapping: Record<string, string> = {
        'customer': 'participants.name',
        'date': 'contract_date',
        'commodity': 'commodity.name',
        'quantity': 'quantity',
        'price': 'price_schedule.price',
        'basis': 'price_schedule.basis',
        'future': 'price_schedule.future_price',
        'reserve': 'reserved',
        'id': '_id'
      };

      // Agregar ordenamiento en el mismo formato que fetchContracts
      if (params.sort) {
        const apiFieldName = sortFieldMapping[params.sort.key] || params.sort.key;
        console.log('Sort mapping:', params.sort.key, '->', apiFieldName, params.sort.direction);
        queryParams.append(`sort[${apiFieldName}]`, params.sort.direction === 'asc' ? '1' : '-1');
      } else {
        // Ordenamiento por defecto por fecha de contrato descendente
        queryParams.append('sort[contract_date]', '-1');
      }

      const url = `https://trm-develop.grainchain.io/api/v1/contracts/sp-contracts?${queryParams.toString()}`;

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

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ContractResponse = await response.json();

      // Mapear los datos de la API real a nuestro formato
      const mappedContracts: PurchaseContract[] = data.data.map(contract => ({
        id: contract._id,
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

      // Retornar la estructura correcta usando _meta
      return {
        data: mappedContracts,
        total: data._meta.total_elements,
        totalPages: data._meta.total_pages
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
    },
    {
      key: 'actions',
      titleKey: 'actions',
      render: (contract) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold text-lg p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => console.log('Ver contrato:', contract.id)}>
              {t('view')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Editar contrato:', contract.id)}>
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Duplicar contrato:', contract.id)}>
              {t('duplicate')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log('Eliminar contrato:', contract.id)}
              className="text-red-600 dark:text-red-400"
            >
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      sortable: false,
      width: '80px'
    }
  ];

  return (
    <DashboardLayout title={t('purchaseContracts')}>
      <GenericTable
        columns={columns}
        fetchData={fetchContractsData}
        defaultFilters={{
          pricingType: ['all'],
          commodity: ['all']
        }}
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

        showPagination={true}
        showSearch={true}
        className="w-full"
      />
    </DashboardLayout>
  );
}