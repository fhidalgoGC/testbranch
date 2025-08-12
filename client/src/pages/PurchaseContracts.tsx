import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  GenericTable, 
  TableColumn, 
  ActionMenuItem, 
  DataFetchFunction, 
  TableFilter 
} from '@/components/contracts/ContractsTable';
import { PurchaseContract } from '@/types/purchaseContract.types';

export default function PurchaseContracts() {
  const { t } = useTranslation();
  
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
    
    // Aplicar filtros y búsqueda
    let filteredContracts = allContracts;
    
    // Filtro por búsqueda
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredContracts = filteredContracts.filter(contract => {
        const buyer = contract.participants?.find(p => p.role === 'buyer');
        const contractId = contract.folio || contract.id || '';
        return (buyer?.name || '').toLowerCase().includes(searchLower) ||
               contractId.toLowerCase().includes(searchLower);
      });
    }
    
    // Filtros por tipo de pricing
    if (params.filters?.pricingType?.length > 0) {
      filteredContracts = filteredContracts.filter(contract => {
        const pricingType = contract.price_schedule?.[0]?.pricing_type || 'fixed';
        return params.filters!.pricingType.includes(pricingType);
      });
    }
    
    // Filtros por commodity
    if (params.filters?.commodity?.length > 0) {
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
    
    const filteredContracts = generateMockContracts(params);
    const total = filteredContracts.length;
    const totalPages = Math.ceil(total / params.pageSize);
    
    // Paginación
    const startIndex = (params.page - 1) * params.pageSize;
    const paginatedContracts = filteredContracts.slice(startIndex, startIndex + params.pageSize);
    
    return {
      data: paginatedContracts,
      total,
      totalPages
    };
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<PurchaseContract>[] = [
    {
      key: 'customer',
      titleKey: 'customer',
      render: (contract) => {
        const buyer = contract.participants?.find(p => p.role === 'buyer');
        const pricingType = contract.price_schedule?.[0]?.pricing_type;
        const bgColor = pricingType === 'basis' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-cyan-100 dark:bg-cyan-900';
        const textColor = pricingType === 'basis' ? 'text-purple-600 dark:text-purple-400' : 'text-cyan-600 dark:text-cyan-400';
        
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
              <User className={`w-4 h-4 ${textColor}`} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {buyer?.name || 'Unknown'}
            </span>
          </div>
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
      render: (contract) => (
        <span className="text-gray-900 dark:text-white font-medium">
          {contract.quantity?.toLocaleString()},00 {contract.measurement_unit}
        </span>
      ),
      sortable: false,
      width: '150px'
    },
    {
      key: 'price',
      titleKey: 'price',
      render: (contract) => {
        const priceValue = contract.price_schedule?.[0]?.price || 0;
        return (
          <span className={`font-medium ${
            priceValue > 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            $ {priceValue}
          </span>
        );
      },
      sortable: true,
      width: '100px'
    },
    {
      key: 'basis',
      titleKey: 'basis',
      render: (contract) => {
        const basisValue = contract.price_schedule?.[0]?.basis || 0;
        const operation = contract.price_schedule?.[0]?.basis_operation;
        const displayValue = operation === 'subtract' && basisValue > 0 ? -basisValue : basisValue;
        return (
          <span className={`font-medium ${
            displayValue !== 0 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            $ {displayValue}
          </span>
        );
      },
      sortable: true,
      width: '100px'
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
      sortable: false,
      width: '100px'
    }
  ];

  // Definir filtros
  const filters: TableFilter[] = [
    {
      key: 'pricingType',
      titleKey: 'pricingType',
      type: 'button',
      availableValues: ['basis', 'fixed']
    },
    {
      key: 'commodity',
      titleKey: 'commodity',
      type: 'button',
      availableValues: [
        'YC - Yellow C...',
        'Soya 2025',
        'Semillas de gi...',
        'HRW - Wheat...',
        'Maíz Blanco',
        'SRW - Wheat ...',
        'Frijol amarillo 1'
      ]
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