import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, MoreHorizontal, User } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column, TableData } from '@/components/ui/data-table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { PurchaseContract } from '@/types/purchaseContract.types';

export default function PurchaseContracts() {
  const { t } = useTranslation();

  // Estados para la paginación y búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchValue, setSearchValue] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Estados para los filtros
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>(['basis', 'fixed']);
  const [selectedCommodityFilters, setSelectedCommodityFilters] = useState<string[]>([]);
  
  // Lista de commodities disponibles
  const availableCommodities = [
    'YC - Yellow C...',
    'Soya 2025',
    'Semillas de gi...',
    'HRW - Wheat...',
    'Maíz Blanco',
    'SRW - Wheat ...',
    'Frijol amarillo 1'
  ];

  // Función para generar datos fake
  const generateMockContracts = (): PurchaseContract[] => {
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
    
    const contracts: PurchaseContract[] = [];
    
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
      const basis = pricingType === 'basis' ? (Math.random() - 0.5) * 10 : 0; // Can be negative
      const basisOperation = basis >= 0 ? 'add' : 'subtract';
      
      contracts.push({
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
    
    return contracts;
  };

  // Generar 500 contratos fake
  const mockContracts = generateMockContracts();

  // Función para renderizar el avatar del cliente
  const CustomerAvatar = ({ pricingType }: { pricingType?: string }) => {
    const bgColor = pricingType === 'basis' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-cyan-100 dark:bg-cyan-900';
    const textColor = pricingType === 'basis' ? 'text-purple-600 dark:text-purple-400' : 'text-cyan-600 dark:text-cyan-400';
    
    return (
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
        <User className={`w-4 h-4 ${textColor}`} />
      </div>
    );
  };

  // Definir las columnas de la tabla
  const columns: Column<PurchaseContract>[] = [
    {
      key: 'customer',
      title: 'Customer',
      render: (contract) => {
        const buyer = contract.participants?.find(p => p.role === 'buyer');
        const pricingType = contract.price_schedule?.[0]?.pricing_type;
        return (
          <div className="flex items-center gap-3">
            <CustomerAvatar pricingType={pricingType} />
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
      title: 'Date',
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
      title: 'Quantity',
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
      title: 'Price',
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
      title: 'Basis',
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
      title: 'Id',
      render: (contract) => (
        <span className="text-gray-900 dark:text-white font-medium">
          {contract.folio || contract.id}
        </span>
      ),
      sortable: false,
      width: '100px'
    },
    {
      key: 'action',
      title: 'Action',
      render: (contract) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              Edit Contract
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      sortable: false,
      width: '80px'
    }
  ];

  // Funciones para manejar filtros
  const toggleTypeFilter = (type: string) => {
    setSelectedTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  const toggleCommodityFilter = (commodity: string) => {
    setSelectedCommodityFilters(prev => 
      prev.includes(commodity) 
        ? prev.filter(c => c !== commodity)
        : [...prev, commodity]
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Primero filtrar por búsqueda y commodity para determinar qué tipos están disponibles
  const searchAndCommodityFilteredContracts = mockContracts.filter(contract => {
    // Filtro por búsqueda
    const buyer = contract.participants?.find(p => p.role === 'buyer');
    const contractId = contract.folio || contract.id || '';
    const matchesSearch = (buyer?.name || '').toLowerCase().includes(searchValue.toLowerCase()) ||
      contractId.toLowerCase().includes(searchValue.toLowerCase());
    
    // Filtro por commodity
    const commodityName = contract.commodity?.name || '';
    const matchesCommodity = selectedCommodityFilters.length === 0 || 
      selectedCommodityFilters.includes(commodityName);
    
    return matchesSearch && matchesCommodity;
  });

  // Determinar qué tipos de pricing están disponibles en los contratos filtrados
  const availablePricingTypes = new Set<string>();
  searchAndCommodityFilteredContracts.forEach(contract => {
    const pricingType = contract.price_schedule?.[0]?.pricing_type || 'fixed';
    availablePricingTypes.add(pricingType);
  });

  // Filtrado final incluyendo el tipo de pricing
  const filteredContracts = searchAndCommodityFilteredContracts.filter(contract => {
    const pricingType = contract.price_schedule?.[0]?.pricing_type || 'fixed';
    const matchesType = selectedTypeFilters.length === 0 || 
      selectedTypeFilters.includes(pricingType);
    
    return matchesType;
  });

  const totalContracts = filteredContracts.length;
  const totalPages = Math.ceil(totalContracts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedContracts = filteredContracts.slice(startIndex, startIndex + pageSize);

  const tableData: TableData<PurchaseContract> = {
    data: paginatedContracts,
    meta: {
      page_size: pageSize,
      page_number: currentPage,
      total_elements: totalContracts,
      total_pages: totalPages
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };
  const handleSearchChange = (search: string) => {
    if (search !== searchValue) {
      setSearchValue(search);
      setCurrentPage(1);
    }
  };

  return (
    <DashboardLayout title={t('purchaseContracts')}>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('purchaseContracts')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('purchaseContractsDescription')}
            </p>
          </div>
          
          <Link href="/purchase-contracts/create">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              {t('createContract')}
            </Button>
          </Link>
        </div>

        {/* Commodity Type Filters - Solo mostrar si hay datos de ese tipo */}
        {(availablePricingTypes.has('basis') || availablePricingTypes.has('fixed')) && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              {availablePricingTypes.has('basis') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTypeFilter('basis')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors ${
                    selectedTypeFilters.includes('basis')
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    selectedTypeFilters.includes('basis') ? 'bg-purple-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm ${
                    selectedTypeFilters.includes('basis') 
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>Basis</span>
                </Button>
              )}
              {availablePricingTypes.has('fixed') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTypeFilter('fixed')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors ${
                    selectedTypeFilters.includes('fixed')
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-600'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    selectedTypeFilters.includes('fixed') ? 'bg-cyan-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm ${
                    selectedTypeFilters.includes('fixed') 
                      ? 'text-cyan-700 dark:text-cyan-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>Fixed</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Commodity Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {availableCommodities.map((commodity) => (
            <Button
              key={commodity}
              variant="outline"
              size="sm"
              onClick={() => toggleCommodityFilter(commodity)}
              className={`rounded-full transition-colors ${
                selectedCommodityFilters.includes(commodity)
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {commodity}
            </Button>
          ))}
        </div>

        {/* Contracts Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={tableData}
              loading={false}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortChange={handleSortChange}
              onSearchChange={handleSearchChange}
              currentPage={currentPage}
              pageSize={pageSize}
              sortKey={sortKey}
              sortDirection={sortDirection}
              searchValue={searchValue}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}