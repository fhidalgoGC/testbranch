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

  // Datos de ejemplo para la tabla usando la interfaz PurchaseContract real
  const mockContracts: PurchaseContract[] = [
    // YC - Yellow C... contracts
    {
      id: 'SPC-48',
      type: 'purchase',
      sub_type: 'direct',
      folio: 'SPC-48',
      reference_number: 'REF-48',
      commodity: {
        commodity_id: 'yc-001',
        name: 'YC - Yellow C...'
      },
      characteristics: {
        configuration_id: 'config-001',
        configuration_name: 'Standard Yellow Corn'
      },
      grade: 2,
      participants: [
        {
          people_id: 'buyer-001',
          name: 'Andrés band...',
          role: 'buyer'
        }
      ],
      price_schedule: [
        {
          pricing_type: 'fixed',
          price: 370,
          basis: 0,
          basis_operation: 'add',
          future_price: 0,
          option_month: 'Dec',
          option_year: 2025,
          payment_currency: 'USD',
          exchange: 'CBOT'
        }
      ],
      logistic_schedule: [
        {
          logistic_payment_responsability: 'buyer',
          logistic_coordination_responsability: 'seller',
          freight_cost: {
            type: 'fixed',
            min: 0,
            max: 0,
            cost: 50
          },
          payment_currency: 'USD'
        }
      ],
      quantity: 1700,
      measurement_unit_id: 'bu56',
      measurement_unit: 'bu56',
      shipping_start_date: '2025-07-23',
      shipping_end_date: '2025-08-23',
      contract_date: '2025-07-23',
      application_priority: 1,
      delivered: 'FOB',
      transport: 'Truck',
      weights: 'Standard',
      inspections: 'Required',
      proteins: 'Standard',
      thresholds: {
        min_thresholds_percentage: 5,
        min_thresholds_weight: 85,
        max_thresholds_percentage: 95,
        max_thresholds_weight: 1615
      },
      status: 'active'
    },
    // Crear contratos adicionales para cada commodity
    {
      id: 'SPC-47',
      type: 'purchase',
      sub_type: 'direct',
      folio: 'SPC-47',
      reference_number: 'REF-47',
      commodity: { commodity_id: 'yc-001', name: 'YC - Yellow C...' },
      characteristics: { configuration_id: 'config-001', configuration_name: 'Standard Yellow Corn' },
      grade: 2,
      participants: [{ people_id: 'buyer-002', name: 'Test Seller ...', role: 'buyer' }],
      price_schedule: [{ pricing_type: 'basis', price: 0, basis: 1.25, basis_operation: 'add', future_price: 0, option_month: 'Dec', option_year: 2025, payment_currency: 'USD', exchange: 'CBOT' }],
      logistic_schedule: [{ logistic_payment_responsability: 'buyer', logistic_coordination_responsability: 'seller', freight_cost: { type: 'fixed', min: 0, max: 0, cost: 50 }, payment_currency: 'USD' }],
      quantity: 1500, measurement_unit_id: 'bu56', measurement_unit: 'bu56', shipping_start_date: '2025-07-23', shipping_end_date: '2025-08-23', contract_date: '2025-07-23',
      application_priority: 1, delivered: 'FOB', transport: 'Truck', weights: 'Standard', inspections: 'Required', proteins: 'Standard',
      thresholds: { min_thresholds_percentage: 5, min_thresholds_weight: 75, max_thresholds_percentage: 95, max_thresholds_weight: 1425 }, status: 'active'
    },
    {
      id: 'SPC-46',
      type: 'purchase',
      sub_type: 'direct',
      folio: 'SPC-46',
      reference_number: 'REF-46',
      commodity: { commodity_id: 'soya-001', name: 'Soya 2025' },
      characteristics: { configuration_id: 'config-002', configuration_name: 'Standard Soybean' },
      grade: 1,
      participants: [{ people_id: 'buyer-003', name: 'Soja Corp', role: 'buyer' }],
      price_schedule: [{ pricing_type: 'fixed', price: 1500, basis: 0, basis_operation: 'add', future_price: 0, option_month: 'Nov', option_year: 2025, payment_currency: 'USD', exchange: 'CBOT' }],
      logistic_schedule: [{ logistic_payment_responsability: 'seller', logistic_coordination_responsability: 'buyer', freight_cost: { type: 'fixed', min: 0, max: 0, cost: 75 }, payment_currency: 'USD' }],
      quantity: 1400, measurement_unit_id: 'bu60', measurement_unit: 'bu60', shipping_start_date: '2025-07-31', shipping_end_date: '2025-08-31', contract_date: '2025-07-31',
      application_priority: 1, delivered: 'FOB', transport: 'Truck', weights: 'Standard', inspections: 'Required', proteins: 'Standard',
      thresholds: { min_thresholds_percentage: 5, min_thresholds_weight: 70, max_thresholds_percentage: 95, max_thresholds_weight: 1330 }, status: 'active'
    },
    {
      id: 'SPC-45',
      type: 'purchase',
      sub_type: 'direct',
      folio: 'SPC-45',
      reference_number: 'REF-45',
      commodity: { commodity_id: 'soya-001', name: 'Soya 2025' },
      characteristics: { configuration_id: 'config-002', configuration_name: 'Standard Soybean' },
      grade: 1,
      participants: [{ people_id: 'buyer-004', name: 'AgriTrade Ltd', role: 'buyer' }],
      price_schedule: [{ pricing_type: 'basis', price: 0, basis: 0.50, basis_operation: 'subtract', future_price: 0, option_month: 'Nov', option_year: 2025, payment_currency: 'USD', exchange: 'CBOT' }],
      logistic_schedule: [{ logistic_payment_responsability: 'buyer', logistic_coordination_responsability: 'seller', freight_cost: { type: 'variable', min: 60, max: 90, cost: 75 }, payment_currency: 'USD' }],
      quantity: 900, measurement_unit_id: 'bu60', measurement_unit: 'bu60', shipping_start_date: '2025-07-28', shipping_end_date: '2025-08-28', contract_date: '2025-07-28',
      application_priority: 2, delivered: 'CIF', transport: 'Rail', weights: 'Certified', inspections: 'Optional', proteins: 'High',
      thresholds: { min_thresholds_percentage: 3, min_thresholds_weight: 45, max_thresholds_percentage: 97, max_thresholds_weight: 873 }, status: 'active'
    },
    {
      id: 'SPC-44',
      type: 'purchase',
      sub_type: 'direct',
      folio: 'SPC-44',
      reference_number: 'REF-44',
      commodity: { commodity_id: 'seeds-001', name: 'Semillas de gi...' },
      characteristics: { configuration_id: 'config-003', configuration_name: 'Premium Seeds' },
      grade: 1,
      participants: [{ people_id: 'buyer-005', name: 'Seeds Master Co', role: 'buyer' }],
      price_schedule: [{ pricing_type: 'fixed', price: 3000, basis: 0, basis_operation: 'add', future_price: 0, option_month: 'Sep', option_year: 2025, payment_currency: 'USD', exchange: 'MATIF' }],
      logistic_schedule: [{ logistic_payment_responsability: 'buyer', logistic_coordination_responsability: 'seller', freight_cost: { type: 'fixed', min: 0, max: 0, cost: 120 }, payment_currency: 'USD' }],
      quantity: 500, measurement_unit_id: 'kg', measurement_unit: 'kg', shipping_start_date: '2025-07-03', shipping_end_date: '2025-08-03', contract_date: '2025-07-03',
      application_priority: 1, delivered: 'EXW', transport: 'Truck', weights: 'Precision', inspections: 'Mandatory', proteins: 'Standard',
      thresholds: { min_thresholds_percentage: 2, min_thresholds_weight: 10, max_thresholds_percentage: 98, max_thresholds_weight: 490 }, status: 'active'
    },
    {
      id: 'SPC-43',
      type: 'purchase',
      sub_type: 'imported',
      folio: 'SPC-43',
      reference_number: 'REF-43',
      commodity: { commodity_id: 'hwm-001', name: 'HRW - Wheat...' },
      characteristics: { configuration_id: 'config-004', configuration_name: 'Hard Red Winter Wheat' },
      grade: 2,
      participants: [{ people_id: 'buyer-006', name: 'Wheat Global Inc', role: 'buyer' }],
      price_schedule: [{ pricing_type: 'basis', price: 0, basis: 1.75, basis_operation: 'subtract', future_price: 0, option_month: 'Dec', option_year: 2025, payment_currency: 'USD', exchange: 'KCBT' }],
      logistic_schedule: [{ logistic_payment_responsability: 'seller', logistic_coordination_responsability: 'buyer', freight_cost: { type: 'variable', min: 80, max: 120, cost: 100 }, payment_currency: 'USD' }],
      quantity: 2000, measurement_unit_id: 'bu', measurement_unit: 'bu', shipping_start_date: '2025-06-25', shipping_end_date: '2025-07-25', contract_date: '2025-06-25',
      application_priority: 1, delivered: 'CFR', transport: 'Ship', weights: 'Standard', inspections: 'Required', proteins: 'High',
      thresholds: { min_thresholds_percentage: 4, min_thresholds_weight: 80, max_thresholds_percentage: 96, max_thresholds_weight: 1920 }, status: 'active'
    },
    {
      id: 'SPC-42',
      type: 'purchase',
      sub_type: 'direct',
      folio: 'SPC-42',
      reference_number: 'REF-42',
      commodity: { commodity_id: 'maiz-001', name: 'Maíz Blanco' },
      characteristics: { configuration_id: 'config-005', configuration_name: 'White Corn Premium' },
      grade: 1,
      participants: [{ people_id: 'buyer-007', name: 'Maíz Corporation', role: 'buyer' }],
      price_schedule: [{ pricing_type: 'fixed', price: 2800, basis: 0, basis_operation: 'add', future_price: 0, option_month: 'Dec', option_year: 2025, payment_currency: 'USD', exchange: 'CBOT' }],
      logistic_schedule: [{ logistic_payment_responsability: 'buyer', logistic_coordination_responsability: 'seller', freight_cost: { type: 'fixed', min: 0, max: 0, cost: 65 }, payment_currency: 'USD' }],
      quantity: 3200, measurement_unit_id: 'bu56', measurement_unit: 'bu56', shipping_start_date: '2025-06-20', shipping_end_date: '2025-07-20', contract_date: '2025-06-20',
      application_priority: 1, delivered: 'FOB', transport: 'Truck', weights: 'Standard', inspections: 'Required', proteins: 'Standard',
      thresholds: { min_thresholds_percentage: 5, min_thresholds_weight: 160, max_thresholds_percentage: 95, max_thresholds_weight: 3040 }, status: 'active'
    },
    {
      id: 'SPC-41',
      type: 'purchase',
      sub_type: 'direct',
      folio: 'SPC-41',
      reference_number: 'REF-41',
      commodity: { commodity_id: 'srw-001', name: 'SRW - Wheat ...' },
      characteristics: { configuration_id: 'config-006', configuration_name: 'Soft Red Winter' },
      grade: 2,
      participants: [{ people_id: 'buyer-008', name: 'Harvest Innovations', role: 'buyer' }],
      price_schedule: [{ pricing_type: 'basis', price: 0, basis: 0.75, basis_operation: 'subtract', future_price: 0, option_month: 'Dec', option_year: 2025, payment_currency: 'USD', exchange: 'CBOT' }],
      logistic_schedule: [{ logistic_payment_responsability: 'seller', logistic_coordination_responsability: 'buyer', freight_cost: { type: 'variable', min: 70, max: 100, cost: 85 }, payment_currency: 'USD' }],
      quantity: 1600, measurement_unit_id: 'bu', measurement_unit: 'bu', shipping_start_date: '2025-06-10', shipping_end_date: '2025-07-10', contract_date: '2025-06-10',
      application_priority: 2, delivered: 'CIF', transport: 'Rail', weights: 'Certified', inspections: 'Required', proteins: 'Medium',
      thresholds: { min_thresholds_percentage: 3, min_thresholds_weight: 48, max_thresholds_percentage: 97, max_thresholds_weight: 1552 }, status: 'active'
    },
    {
      id: 'SPC-40',
      type: 'purchase',
      sub_type: 'imported',
      folio: 'SPC-40',
      reference_number: 'REF-40',
      commodity: { commodity_id: 'frijol-001', name: 'Frijol amarillo 1' },
      characteristics: { configuration_id: 'config-007', configuration_name: 'Yellow Bean Grade 1' },
      grade: 1,
      participants: [{ people_id: 'buyer-009', name: 'Legume Traders', role: 'buyer' }],
      price_schedule: [{ pricing_type: 'fixed', price: 1200, basis: 0, basis_operation: 'add', future_price: 0, option_month: 'Nov', option_year: 2025, payment_currency: 'USD', exchange: 'CME' }],
      logistic_schedule: [{ logistic_payment_responsability: 'buyer', logistic_coordination_responsability: 'seller', freight_cost: { type: 'fixed', min: 0, max: 0, cost: 40 }, payment_currency: 'USD' }],
      quantity: 800, measurement_unit_id: 'lb', measurement_unit: 'lb', shipping_start_date: '2025-05-28', shipping_end_date: '2025-06-28', contract_date: '2025-05-28',
      application_priority: 1, delivered: 'DAP', transport: 'Truck', weights: 'Standard', inspections: 'Optional', proteins: 'High',
      thresholds: { min_thresholds_percentage: 2, min_thresholds_weight: 16, max_thresholds_percentage: 98, max_thresholds_weight: 784 }, status: 'active'
    }
  ];

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

  // Simular paginación y filtrado
  const filteredContracts = mockContracts.filter(contract => {
    // Filtro por búsqueda
    const buyer = contract.participants?.find(p => p.role === 'buyer');
    const contractId = contract.folio || contract.id || '';
    const matchesSearch = (buyer?.name || '').toLowerCase().includes(searchValue.toLowerCase()) ||
      contractId.toLowerCase().includes(searchValue.toLowerCase());
    
    // Filtro por tipo (basis/fixed)
    const pricingType = contract.price_schedule?.[0]?.pricing_type || 'fixed';
    const matchesType = selectedTypeFilters.length === 0 || 
      selectedTypeFilters.includes(pricingType);
    
    // Filtro por commodity
    const commodityName = contract.commodity?.name || '';
    const matchesCommodity = selectedCommodityFilters.length === 0 || 
      selectedCommodityFilters.includes(commodityName);
    
    return matchesSearch && matchesType && matchesCommodity;
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
    setSearchValue(search);
    setCurrentPage(1);
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

        {/* Commodity Type Filters */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
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
          </div>
        </div>

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