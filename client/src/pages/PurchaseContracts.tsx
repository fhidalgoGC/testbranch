import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCommodities } from '@/hooks/useCommodities';
import { 
  GenericTable, 
  TableColumn, 
  ActionMenuItem, 
  DataFetchFunction, 
  TableFilter,
  FilterOption
} from '@/components/general/StandardTable';
import { PurchaseContract } from '@/types/purchaseContract.types';
import { formatNumber } from '@/lib/numberFormatter';

export default function PurchaseContracts() {
  const { t } = useTranslation();
  const { commodities, loading: commoditiesLoading, error: commoditiesError } = useCommodities();
  
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
  
  // Función para generar datos fake
  const generateMockContracts = (params: {
    page: number;
    pageSize: number;
    search?: string;
    filters?: Record<string, any>;
    sort?: { key: string; direction: 'asc' | 'desc' };
  }): PurchaseContract[] => {
    const commodities = [
      'YC - Yellow C...', 'Soya 2025', 'Semillas de gi...', 'HRW - Wheat...',
      'Maíz Blanco', 'SRW - Wheat ...', 'Frijol amarillo 1'
    ];
    
    const buyers = [
      'Andrés band...', 'Test Seller ...', 'Soja Corp', 'AgriTrade Ltd', 'Seeds Master Co',
      'Wheat Global Inc', 'Maíz Corporation', 'Harvest Innovations', 'Legume Traders',
      'Green Valley Farms', 'Prairie Holdings', 'Midwest Grain Co', 'Golden Harvest Inc',
      'Continental Agri', 'Premium Commodities', 'Global Trade Partners', 'Harvest Moon LLC',
      'Grain Masters Corp', 'Agricultural Solutions', 'Crop Excellence Inc', 'Farm Direct Trading'
    ];

    const measurementUnits = ['bu56', 'bu60', 'bu', 'kg', 'lb', 'mt'];
    const pricingTypes: ('fixed' | 'basis')[] = ['fixed', 'basis'];
    
    const allContracts: PurchaseContract[] = [];
    
    for (let i = 0; i < 500; i++) {
      const contractNumber = 5000 - i;
      const commodityName = commodities[Math.floor(Math.random() * commodities.length)];
      const buyerName = buyers[Math.floor(Math.random() * buyers.length)];
      const pricingType = pricingTypes[Math.floor(Math.random() * pricingTypes.length)];
      const measurementUnit = measurementUnits[Math.floor(Math.random() * measurementUnits.length)];
      
      // Generar fechas aleatorias en 2025
      const startDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      const quantity = Math.floor(Math.random() * 5000) + 500;
      const price = pricingType === 'fixed' ? Math.floor(Math.random() * 5000) + 200 : 0;
      const basis = pricingType === 'basis' ? (Math.random() - 0.5) * 10 : 0;
      const basisOperation = basis >= 0 ? 'add' : 'subtract';
      
      allContracts.push({
        id: `SPC-${contractNumber}`,
        type: 'purchase',
        sub_type: 'direct',
        folio: `SPC-${contractNumber}`,
        reference_number: `REF-${contractNumber}`,
        commodity: {
          commodity_id: `commodity-${i}`,
          name: commodityName
        },
        characteristics: {
          configuration_id: `config-${i}`,
          configuration_name: `Config ${commodityName}`
        },
        grade: Math.floor(Math.random() * 3) + 1,
        participants: [{
          people_id: `buyer-${i}`,
          name: buyerName,
          role: 'buyer'
        }],
        price_schedule: [{
          pricing_type: pricingType,
          price: price,
          basis: Math.abs(basis),
          basis_operation: basisOperation,
          future_price: Math.floor(Math.random() * 1000),
          option_month: ['Jan', 'Feb', 'Mar', 'Dec', 'Nov', 'Sep'][Math.floor(Math.random() * 6)],
          option_year: 2025,
          payment_currency: 'USD',
          exchange: ['CBOT', 'KCBT', 'MATIF', 'CME'][Math.floor(Math.random() * 4)]
        }],
        logistic_schedule: [{
          logistic_payment_responsability: 'buyer',
          logistic_coordination_responsability: 'seller',
          freight_cost: {
            type: 'fixed',
            min: 0,
            max: 0,
            cost: Math.floor(Math.random() * 200) + 40
          },
          payment_currency: 'USD'
        }],
        quantity: quantity,
        measurement_unit_id: measurementUnit,
        measurement_unit: measurementUnit,
        shipping_start_date: startDate.toISOString().split('T')[0],
        shipping_end_date: endDate.toISOString().split('T')[0],
        contract_date: startDate.toISOString().split('T')[0],
        application_priority: Math.floor(Math.random() * 3) + 1,
        delivered: ['FOB', 'CIF', 'EXW', 'CFR', 'DAP'][Math.floor(Math.random() * 5)],
        transport: ['Truck', 'Rail', 'Ship'][Math.floor(Math.random() * 3)],
        weights: 'Standard',
        inspections: 'Required',
        proteins: 'Standard',
        thresholds: {
          min_thresholds_percentage: Math.floor(Math.random() * 5) + 2,
          min_thresholds_weight: Math.floor(quantity * 0.05),
          max_thresholds_percentage: 95 + Math.floor(Math.random() * 3),
          max_thresholds_weight: Math.floor(quantity * 0.95)
        },
        status: 'active'
      });
    }
    
    // Aplicar solo filtros (la búsqueda se maneja en fetchContractsData)
    let filteredContracts = allContracts;
    
    // Filtros por tipo de pricing
    if (params.filters && params.filters.pricingType?.length > 0 && !params.filters.pricingType.includes('all')) {
      filteredContracts = filteredContracts.filter(contract => {
        const pricingType = contract.price_schedule?.[0]?.pricing_type || 'fixed';
        // Los filtros ahora usan la estructura con value, así que comparamos directamente
        return params.filters!.pricingType.includes(pricingType);
      });
    }
    
    // Filtros por commodity
    if (params.filters?.commodity?.length > 0 && !params.filters?.commodity.includes('all')) {
      filteredContracts = filteredContracts.filter(contract => {
        const commodityName = contract.commodity?.name || '';
        return params.filters!.commodity.includes(commodityName);
      });
    }
    
    return filteredContracts;
  };

  // Función de fetch de datos que simula llamada a API
  const fetchContractsData: DataFetchFunction<PurchaseContract> = async (params) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generar todos los contratos
    let allContracts = generateMockContracts(params);
    
    // Aplicar filtros de búsqueda en todas las columnas si se proporciona búsqueda
    if (params.search && params.columns) {
      const searchInAllColumns = (item: PurchaseContract, searchTerm: string) => {
        const searchLower = searchTerm.toLowerCase();
        
        return params.columns!.some(column => {
          let value: any;
          
          // Si la columna tiene dataMapping, usar eso
          if (column.dataMapping) {
            const getNestedValue = (obj: any, path: string): any => {
              return path.split('.').reduce((current, key) => {
                if (key.includes('[') && key.includes(']')) {
                  const arrayKey = key.substring(0, key.indexOf('['));
                  const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
                  return current?.[arrayKey]?.[index];
                }
                return current?.[key];
              }, obj);
            };
            value = getNestedValue(item, column.dataMapping);
          } else {
            value = (item as any)[column.key];
          }
          
          // Búsqueda especial para columnas específicas
          if (column.key === 'customer') {
            const buyer = item.participants?.find(p => p.role === 'buyer');
            const buyerName = buyer?.name || '';
            return buyerName.toLowerCase().includes(searchLower);
          }
          
          if (column.key === 'date') {
            const date = new Date(item.contract_date || '');
            const formattedDate = date.toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric' 
            });
            return formattedDate.toLowerCase().includes(searchLower);
          }
          
          if (column.key === 'quantity') {
            const formattedQuantity = formatNumber({
              value: item.quantity || 0,
              minDecimals: 2,
              maxDecimals: 2,
              formatPattern: "0,000.00",
              roundMode: "truncate"
            });
            const quantityText = `${formattedQuantity} ${item.measurement_unit}`;
            return quantityText.toLowerCase().includes(searchLower);
          }
          
          if (column.key === 'price') {
            const priceValue = item.price_schedule?.[0]?.price || 0;
            const formattedPrice = formatNumber({
              value: priceValue,
              minDecimals: 2,
              maxDecimals: 4,
              formatPattern: "0,000.00",
              roundMode: "truncate"
            });
            return formattedPrice.includes(searchLower) || priceValue.toString().includes(searchLower);
          }
          
          if (column.key === 'basis') {
            const basisValue = item.price_schedule?.[0]?.basis || 0;
            const operation = item.price_schedule?.[0]?.basis_operation;
            const displayValue = operation === 'subtract' && basisValue > 0 ? -basisValue : basisValue;
            const formattedBasis = formatNumber({
              value: displayValue,
              minDecimals: 2,
              maxDecimals: 4,
              formatPattern: "0,000.00",
              roundMode: "truncate"
            });
            return formattedBasis.includes(searchLower) || displayValue.toString().includes(searchLower);
          }
          
          if (column.key === 'future') {
            const futureValue = item.price_schedule?.[0]?.future_price || 0;
            const formattedFuture = formatNumber({
              value: futureValue,
              minDecimals: 2,
              maxDecimals: 4,
              formatPattern: "0,000.00",
              roundMode: "truncate"
            });
            return formattedFuture.includes(searchLower) || futureValue.toString().includes(searchLower);
          }
          
          if (column.key === 'reserve') {
            const reserveValue = item.logistic_schedule?.[0]?.freight_cost?.cost || 0;
            const formattedReserve = formatNumber({
              value: reserveValue,
              minDecimals: 2,
              maxDecimals: 4,
              formatPattern: "0,000.00",
              roundMode: "truncate"
            });
            return formattedReserve.includes(searchLower) || reserveValue.toString().includes(searchLower);
          }
          
          if (column.key === 'id') {
            const contractId = item.folio || item.id || '';
            return contractId.toLowerCase().includes(searchLower);
          }
          
          // Convertir a string y buscar para otros campos
          if (value != null) {
            const stringValue = value.toString().toLowerCase();
            return stringValue.includes(searchLower);
          }
          
          return false;
        });
      };
      
      allContracts = allContracts.filter(contract => searchInAllColumns(contract, params.search!));
    }
    
    // Aplicar ordenamiento si se especifica
    if (params.sort) {
      const { key, direction } = params.sort;
      
      allContracts.sort((a, b) => {
        let aValue: any, bValue: any;
        
        // Obtener valores para ordenamiento
        switch (key) {
          case 'customer':
            aValue = a.participants?.find(p => p.role === 'buyer')?.name || '';
            bValue = b.participants?.find(p => p.role === 'buyer')?.name || '';
            break;
          case 'date':
            aValue = new Date(a.contract_date || '').getTime();
            bValue = new Date(b.contract_date || '').getTime();
            break;
          case 'quantity':
            aValue = a.quantity || 0;
            bValue = b.quantity || 0;
            break;
          case 'price':
            aValue = a.price_schedule?.[0]?.price || 0;
            bValue = b.price_schedule?.[0]?.price || 0;
            break;
          case 'basis':
            const aBasis = a.price_schedule?.[0]?.basis || 0;
            const aOperation = a.price_schedule?.[0]?.basis_operation;
            aValue = aOperation === 'subtract' && aBasis > 0 ? -aBasis : aBasis;
            
            const bBasis = b.price_schedule?.[0]?.basis || 0;
            const bOperation = b.price_schedule?.[0]?.basis_operation;
            bValue = bOperation === 'subtract' && bBasis > 0 ? -bBasis : bBasis;
            break;
          case 'future':
            aValue = a.price_schedule?.[0]?.future_price || 0;
            bValue = b.price_schedule?.[0]?.future_price || 0;
            break;
          case 'reserve':
            aValue = a.logistic_schedule?.[0]?.freight_cost?.cost || 0;
            bValue = b.logistic_schedule?.[0]?.freight_cost?.cost || 0;
            break;
          case 'id':
            aValue = a.folio || a.id || '';
            bValue = b.folio || b.id || '';
            break;
          default:
            aValue = (a as any)[key];
            bValue = (b as any)[key];
        }
        
        // Comparar valores
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return direction === 'desc' ? -comparison : comparison;
        }
        
        if (aValue < bValue) return direction === 'desc' ? 1 : -1;
        if (aValue > bValue) return direction === 'desc' ? -1 : 1;
        return 0;
      });
    }
    
    const total = allContracts.length;
    const totalPages = Math.ceil(total / params.pageSize);
    
    // Paginación después del ordenamiento
    const startIndex = (params.page - 1) * params.pageSize;
    const paginatedContracts = allContracts.slice(startIndex, startIndex + params.pageSize);
    
    return {
      data: paginatedContracts,
      total,
      totalPages
    };
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
      sortable: false,
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
        return (
          <span className="text-gray-600 dark:text-gray-400">
            {formattedDate}
          </span>
        );
      },
      sortable: true,
      width: '120px'
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
        return (
          <span className={`font-medium ${
            priceValue > 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            $ {formattedPrice}
          </span>
        );
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'basis',
      titleKey: 'basis',
      render: (contract) => {
        const basisValue = contract.price_schedule?.[0]?.basis || 0;
        const operation = contract.price_schedule?.[0]?.basis_operation;
        const displayValue = operation === 'subtract' && basisValue > 0 ? -basisValue : basisValue;
        const formattedBasis = formatNumber({
          value: displayValue,
          minDecimals: 2,
          maxDecimals: 4,
          formatPattern: "0,000.00",
          roundMode: "truncate"
        });
        return (
          <span className={`font-medium ${
            displayValue !== 0 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            $ {formattedBasis}
          </span>
        );
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
        return (
          <span className={`font-medium ${
            futureValue > 0 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            $ {formattedFuture}
          </span>
        );
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'reserve',
      titleKey: 'reserve',
      render: (contract) => {
        // Simular un valor de reserva basado en el freight cost
        const reserveValue = contract.logistic_schedule?.[0]?.freight_cost?.cost || 0;
        const formattedReserve = formatNumber({
          value: reserveValue,
          minDecimals: 2,
          maxDecimals: 4,
          formatPattern: "0,000.00",
          roundMode: "truncate"
        });
        return (
          <span className={`font-medium ${
            reserveValue > 0 
              ? 'text-purple-600 dark:text-purple-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            $ {formattedReserve}
          </span>
        );
      },
      sortable: true,
      width: '120px'
    },
    {
      key: 'id',
      titleKey: 'id',
      dataMapping: 'folio',
      render: (contract) => (
        <span className="text-gray-900 dark:text-white font-medium">
          {contract.folio || contract.id}
        </span>
      ),
      sortable: true,
      width: '100px'
    }
  ];

  // Definir filtros con estructura de select estándar
  const filters: TableFilter[] = [
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
          key: 'basis',
          value: 'basis',
          label: { key: 'filters.basis' }
        },
        {
          key: 'fixed',
          value: 'fixed', 
          label: { key: 'filters.fixed' }
        }
      ]
    },
    {
      key: 'commodity',
      titleKey: 'commodity',
      type: 'button',
      availableValues: commodityFilters
    }
  ];

  // Definir acciones del menú
  const actionMenuItems: ActionMenuItem[] = [
    {
      key: 'view',
      labelKey: 'viewDetails',
      action: (contract: PurchaseContract) => {
        console.log('View contract:', contract);
        // Navegar a la vista de detalle
      }
    },
    {
      key: 'edit',
      labelKey: 'editContract',
      action: (contract: PurchaseContract) => {
        console.log('Edit contract:', contract);
        // Navegar a la edición
      }
    },
    {
      key: 'delete',
      labelKey: 'deleteContract',
      action: (contract: PurchaseContract) => {
        console.log('Delete contract:', contract);
        // Confirmar y eliminar
      },
      className: 'text-red-600'
    }
  ];

  return (
    <DashboardLayout title={t('purchaseContracts')}>
      <GenericTable
        columns={columns}
        fetchData={fetchContractsData}
        titleKey="purchaseContracts"
        descriptionKey="purchaseContractsDescription"
        createButtonLabelKey="createContract"
        createButtonHref="/purchase-contracts/create"
        showCreateButton={true}
        showFilters={true}
        filters={filters}
        showActionColumn={true}
        actionMenuItems={actionMenuItems}
        actionColumnTitleKey="actions"
      />
    </DashboardLayout>
  );
}