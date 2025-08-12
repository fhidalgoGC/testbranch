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

// Definir el tipo de dato para los contratos
interface PurchaseContract {
  id: string;
  customer: string;
  date: string;
  quantity: string;
  price: string;
  basis: string;
  contractId: string;
  commodityType?: 'basis' | 'fixed';
}

export default function PurchaseContracts() {
  const { t } = useTranslation();

  // Estados para la paginación y búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
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

  // Datos de ejemplo para la tabla
  const mockContracts: PurchaseContract[] = [
    {
      id: 'SPC-48',
      customer: 'Andrés band...',
      date: '7/23/2025',
      quantity: '1,700,00 bu56.',
      price: '$ 370',
      basis: '$ 0',
      contractId: 'SPC-48',
      commodityType: 'fixed'
    },
    {
      id: 'SPC-47',
      customer: 'Test Seller ...',
      date: '7/23/2025',
      quantity: '1,500,00 longTon.',
      price: '$ 1500',
      basis: '$ 0',
      contractId: 'SPC-47',
      commodityType: 'fixed'
    },
    {
      id: 'SPC-46',
      customer: 'Test Seller ...',
      date: '7/31/2025',
      quantity: '1,400,00 bu60.',
      price: '$ 0',
      basis: '$ 1500',
      contractId: 'SPC-46',
      commodityType: 'basis'
    },
    {
      id: 'SPC-44',
      customer: 'Ferti Nova',
      date: '7/3/2025',
      quantity: '500.000,00 bu56.',
      price: '$ 3000',
      basis: '$ -1.75',
      contractId: 'SPC-44',
      commodityType: 'fixed'
    },
    {
      id: 'SPC-41',
      customer: 'Ferti Nova',
      date: '7/3/2025',
      quantity: '4.000,00 lb.',
      price: '$ 6000',
      basis: '$ -1.75',
      contractId: 'SPC-41',
      commodityType: 'fixed'
    },
    {
      id: 'SPC-39',
      customer: 'Agro Corp',
      date: '6/15/2025',
      quantity: '2,200,00 bu56.',
      price: '$ 0',
      basis: '$ 2.50',
      contractId: 'SPC-39',
      commodityType: 'basis'
    },
    {
      id: 'SPC-38',
      customer: 'Green Valley',
      date: '6/10/2025',
      quantity: '800,00 longTon.',
      price: '$ 950',
      basis: '$ 0',
      contractId: 'SPC-38',
      commodityType: 'fixed'
    },
    {
      id: 'SPC-37',
      customer: 'Harvest Co.',
      date: '6/5/2025',
      quantity: '1,100,00 bu60.',
      price: '$ 0',
      basis: '$ -0.75',
      contractId: 'SPC-37',
      commodityType: 'basis'
    }
  ];

  // Función para renderizar el avatar del cliente
  const CustomerAvatar = ({ customer, commodityType }: { customer: string, commodityType?: string }) => {
    const bgColor = commodityType === 'basis' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-cyan-100 dark:bg-cyan-900';
    const textColor = commodityType === 'basis' ? 'text-purple-600 dark:text-purple-400' : 'text-cyan-600 dark:text-cyan-400';
    
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
      render: (contract) => (
        <div className="flex items-center gap-3">
          <CustomerAvatar customer={contract.customer} commodityType={contract.commodityType} />
          <span className="font-medium text-gray-900 dark:text-white">
            {contract.customer}
          </span>
        </div>
      ),
      sortable: false,
      width: '200px'
    },
    {
      key: 'date',
      title: 'Date',
      render: (contract) => (
        <span className="text-gray-600 dark:text-gray-400">
          {contract.date}
        </span>
      ),
      sortable: true,
      width: '120px'
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (contract) => (
        <span className="text-gray-900 dark:text-white font-medium">
          {contract.quantity}
        </span>
      ),
      sortable: false,
      width: '150px'
    },
    {
      key: 'price',
      title: 'Price',
      render: (contract) => (
        <span className={`font-medium ${
          contract.price !== '$ 0' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-400 dark:text-gray-500'
        }`}>
          {contract.price}
        </span>
      ),
      sortable: true,
      width: '100px'
    },
    {
      key: 'basis',
      title: 'Basis',
      render: (contract) => (
        <span className={`font-medium ${
          contract.basis !== '$ 0' 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-400 dark:text-gray-500'
        }`}>
          {contract.basis}
        </span>
      ),
      sortable: true,
      width: '100px'
    },
    {
      key: 'id',
      title: 'Id',
      render: (contract) => (
        <span className="text-gray-900 dark:text-white font-medium">
          {contract.contractId}
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
    const matchesSearch = contract.customer.toLowerCase().includes(searchValue.toLowerCase()) ||
      contract.contractId.toLowerCase().includes(searchValue.toLowerCase());
    
    // Filtro por tipo (basis/fixed)
    const matchesType = selectedTypeFilters.length === 0 || 
      selectedTypeFilters.includes(contract.commodityType || 'fixed');
    
    // Filtro por commodity (por ahora solo simulamos que todos los contratos son compatibles)
    const matchesCommodity = selectedCommodityFilters.length === 0;
    
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