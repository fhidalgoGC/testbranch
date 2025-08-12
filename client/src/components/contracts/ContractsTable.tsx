import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { User, MoreHorizontal, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { DataTable, Column, TableData } from '@/components/ui/data-table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { PurchaseContract } from '@/types/purchaseContract.types';

export interface ContractsTableProps {
  contracts: PurchaseContract[];
  title?: string;
  description?: string;
  createButtonLabel?: string;
  createButtonHref?: string;
  showCreateButton?: boolean;
  showFilters?: boolean;
  availableCommodities?: string[];
  onContractAction?: (action: 'view' | 'edit' | 'delete', contract: PurchaseContract) => void;
}

export function ContractsTable({
  contracts,
  title,
  description,
  createButtonLabel,
  createButtonHref,
  showCreateButton = true,
  showFilters = true,
  availableCommodities = [],
  onContractAction
}: ContractsTableProps) {
  const { t } = useTranslation();
  
  // Estados para filtros y paginación
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>([]);
  const [selectedCommodityFilters, setSelectedCommodityFilters] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
            <DropdownMenuItem onClick={() => onContractAction?.('view', contract)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onContractAction?.('edit', contract)}>
              Edit Contract
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onContractAction?.('delete', contract)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      sortable: false,
      width: '80px'
    }
  ];

  // Función para toggle de filtros de tipo
  const toggleTypeFilter = (type: string) => {
    setSelectedTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1);
  };

  // Función para toggle de filtros de commodity
  const toggleCommodityFilter = (commodity: string) => {
    setSelectedCommodityFilters(prev => 
      prev.includes(commodity) 
        ? prev.filter(c => c !== commodity)
        : [...prev, commodity]
    );
    setCurrentPage(1);
  };

  // Lógica de filtrado
  const { filteredContracts, availablePricingTypes } = useMemo(() => {
    // Primero filtrar por búsqueda y commodity para determinar qué tipos están disponibles
    const searchAndCommodityFiltered = contracts.filter(contract => {
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
    const availableTypes = new Set<string>();
    searchAndCommodityFiltered.forEach(contract => {
      const pricingType = contract.price_schedule?.[0]?.pricing_type || 'fixed';
      availableTypes.add(pricingType);
    });

    // Filtrado final incluyendo el tipo de pricing
    const finalFiltered = searchAndCommodityFiltered.filter(contract => {
      const pricingType = contract.price_schedule?.[0]?.pricing_type || 'fixed';
      const matchesType = selectedTypeFilters.length === 0 || 
        selectedTypeFilters.includes(pricingType);
      
      return matchesType;
    });

    return {
      filteredContracts: finalFiltered,
      availablePricingTypes: availableTypes
    };
  }, [contracts, searchValue, selectedCommodityFilters, selectedTypeFilters]);

  // Cálculos de paginación
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

  // Handlers
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
    <div className="space-y-6">
      {/* Header with Add Button */}
      {(title || showCreateButton) && (
        <div className="flex justify-between items-center">
          {title && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
          
          {showCreateButton && createButtonHref && (
            <Link href={createButtonHref}>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                size="lg"
              >
                <Plus className="w-4 h-4" />
                {createButtonLabel || t('createContract')}
              </Button>
            </Link>
          )}
        </div>
      )}

      {showFilters && (
        <>
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
          {availableCommodities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {availableCommodities.map((commodity) => (
                <Button
                  key={commodity}
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCommodityFilter(commodity)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    selectedCommodityFilters.includes(commodity)
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {commodity}
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={tableData}
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
    </div>
  );
}