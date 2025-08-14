import { PurchaseContract } from '@/types/purchaseContract.types';

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
    min_thresholds_percentage: number;
    max_thresholds_percentage: number;
    inventory?: {
      reserved: number;
    };
    remarks: Array<{
      comment: string;
    }>;
  }>;
  _meta: {
    total_elements: number;
    total_pages: number;
    page_number: number;
    page_size: number;
  };
}

interface FetchContractsParams {
  page: number;
  limit: number;
  search?: string;
  filters?: Record<string, any>;
  sort?: { key: string; direction: 'asc' | 'desc' };
  commodities: Array<{ key: string; value: string; label: string }>;
  authData: {
    partitionKey: string;
    idToken: string;
  };
}

// Mapeo de campos de la UI a campos de la API para ordenamiento
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

export const fetchContractsData = async (params: FetchContractsParams) => {
  const { page, limit, search, filters, sort, commodities, authData } = params;
  const { partitionKey, idToken } = authData;

  try {
    // Validar tokens de autenticación
    if (!partitionKey || !idToken) {
      console.error('Missing authentication data');
      return {
        data: [] as PurchaseContract[],
        total: 0,
        totalPages: 0
      };
    }

    // Construir filtros para la API usando $and structure
    const andConditions: any[] = [
      { type: 'purchase' }
    ];
    
    console.log('🔍 SERVICIO - Filtros recibidos:', filters);
    
    if (filters?.pricingType?.length && !filters.pricingType.includes('all')) {
      console.log('📍 SERVICIO - Aplicando filtro pricingType:', filters.pricingType[0]);
      andConditions.push({ 'price_schedule.pricing_type': filters.pricingType[0] });
    }
    
    if (filters?.commodity?.length && !filters.commodity.includes('all')) {
      // Los filtros ya contienen los IDs directamente, solo necesitamos usarlos
      const selectedCommodityIds = filters.commodity;
      
      console.log('📍 SERVICIO - Commodities seleccionadas (IDs):', filters.commodity);
      console.log('📍 SERVICIO - Aplicando filtro con IDs:', selectedCommodityIds);
      
      if (selectedCommodityIds.length > 0) {
        andConditions.push({ 'commodity.commodity_id': { $in: selectedCommodityIds } });
      }
    }

    // Agregar búsqueda si existe - implementar OR sobre todos los campos relevantes
    if (search) {
      const searchTerm = search.trim();
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
    
    console.log('🎯 SERVICIO - Filtro final para API:', JSON.stringify(apiFilter, null, 2));

    // Construir parámetros de consulta usando el mismo formato que fetchContracts
    const queryParams = new URLSearchParams({
      all: 'true',
      filter: JSON.stringify(apiFilter),
      page: (page || 1).toString(),
      limit: (limit || 10).toString()
    });
    
    // Agregar ordenamiento en el mismo formato que fetchContracts
    console.log('🔧 SERVICIO - Sort recibido:', sort, 'Type:', typeof sort, 'Sort.key:', sort?.key);
    if (sort && sort.key && sort.key !== 'undefined' && sort.key !== null) {
      const apiFieldName = sortFieldMapping[sort.key] || sort.key;
      console.log('🔧 SERVICIO - Usando sort:', sort.key, '→', apiFieldName, 'Direction:', sort.direction);
      queryParams.append(`sort[${apiFieldName}]`, sort.direction === 'asc' ? '1' : '-1');
    } else {
      // Ordenamiento por defecto por fecha de contrato descendente
      console.log('🔧 SERVICIO - Usando sort por defecto: contract_date');
      queryParams.append('sort[contract_date]', '-1');
    }
    
    console.log('🌐 SERVICIO - URL con parámetros:', queryParams.toString());
    
    const url = `https://trm-develop.grainchain.io/api/v1/contracts/sp-contracts?${queryParams.toString()}`;
    console.log('📡 SERVICIO - URL completa:', url);

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
      _id: contract._id,
      folio: contract.folio,
      reference_number: contract.folio,
      commodity: contract.commodity,
      participants: contract.participants,
      characteristics: contract.characteristics,
      type: contract.type as 'purchase',
      sub_type: contract.sub_type as 'direct' | 'imported' | 'importedFreight',
      grade: contract.grade,
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
      min_thresholds_percentage: contract.min_thresholds_percentage,
      max_thresholds_percentage: contract.max_thresholds_percentage,
      thresholds: {
        min: contract.min_thresholds_percentage,
        max: contract.max_thresholds_percentage
      },
      inventory: contract.inventory,
      remarks: contract.remarks
    }));

    return {
      data: mappedContracts,
      total: data._meta.total_elements,
      totalPages: data._meta.total_pages
    };

  } catch (error) {
    console.error('Error fetching contracts:', error);
    return {
      data: [] as PurchaseContract[],
      total: 0,
      totalPages: 0
    };
  }
};