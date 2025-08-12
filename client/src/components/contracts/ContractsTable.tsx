import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { DataTable, Column, TableData } from '@/components/ui/data-table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Definición de tipos genéricos
export interface TableColumn<T = any> {
  key: string;
  titleKey: string; // Clave para i18n
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  dataMapping?: string; // Ruta para acceder al dato (ej: "participants[0].name")
}

export interface FilterOption {
  key: string;
  value: string;
  label: string;
}

export interface TableFilter {
  key: string;
  titleKey: string;
  type: 'button' | 'select';
  options?: string[];
  availableValues?: string[] | FilterOption[];
}

export interface ActionMenuItem {
  key: string;
  labelKey: string; // Clave para i18n
  action: (item: any) => void;
  className?: string;
}

export interface DataFetchFunction<T = any> {
  (params: {
    page: number;
    pageSize: number;
    search?: string;
    filters?: Record<string, any>;
    sort?: { key: string; direction: 'asc' | 'desc' };
    columns?: TableColumn<T>[]; // Pasar las columnas para la búsqueda
  }): Promise<{
    data: T[];
    total: number;
    totalPages: number;
  }>;
}

export interface GenericTableProps<T = any> {
  // Configuración básica
  columns: TableColumn<T>[];
  fetchData: DataFetchFunction<T>;
  title?: string;
  titleKey?: string; // Clave para i18n del título
  description?: string;
  descriptionKey?: string; // Clave para i18n de la descripción
  
  // Botón de creación
  createButtonLabelKey?: string;
  createButtonHref?: string;
  showCreateButton?: boolean;
  
  // Filtros
  showFilters?: boolean;
  filters?: TableFilter[];
  
  // Acciones
  showActionColumn?: boolean;
  actionMenuItems?: ActionMenuItem[];
  actionColumnTitleKey?: string;
}

// Función auxiliar para obtener valor anidado usando dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    // Manejo de arrays: "participants[0].name"
    if (key.includes('[') && key.includes(']')) {
      const arrayKey = key.substring(0, key.indexOf('['));
      const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
      return current?.[arrayKey]?.[index];
    }
    return current?.[key];
  }, obj);
}

// Función auxiliar para buscar en todas las columnas
function searchInAllColumns<T>(item: T, searchTerm: string, columns: TableColumn<T>[]): boolean {
  const searchLower = searchTerm.toLowerCase();
  
  return columns.some(column => {
    let value: any;
    
    // Si la columna tiene dataMapping, usar eso
    if (column.dataMapping) {
      value = getNestedValue(item, column.dataMapping);
    } else {
      value = (item as any)[column.key];
    }
    
    // Convertir a string y buscar
    if (value != null) {
      const stringValue = value.toString().toLowerCase();
      return stringValue.includes(searchLower);
    }
    
    return false;
  });
}

export function GenericTable<T = any>({
  columns,
  fetchData,
  title,
  titleKey,
  description,
  descriptionKey,
  createButtonLabelKey = 'create',
  createButtonHref,
  showCreateButton = true,
  showFilters = true,
  filters = [],
  showActionColumn = true,
  actionMenuItems = [],
  actionColumnTitleKey = 'actions'
}: GenericTableProps<T>) {
  const { t } = useTranslation();
  
  // Estados para filtros y paginación
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({
    pricingType: ['all'] // Establecer "Todos" como seleccionado por defecto
  });
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Estados para datos
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Función para cargar datos
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData({
        page: currentPage,
        pageSize,
        search: searchValue,
        filters: selectedFilters,
        sort: sortKey ? { key: sortKey, direction: sortDirection } : undefined,
        columns // Pasar las columnas para la búsqueda
      });
      
      setData(result.data);
      setTotalElements(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambien los parámetros
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, searchValue, selectedFilters, sortKey, sortDirection]);

  // Crear las columnas de la tabla con i18n
  const tableColumns: Column<T>[] = useMemo(() => {
    const cols: Column<T>[] = columns.map(col => ({
      key: col.key,
      title: t(col.titleKey),
      render: col.render || ((item: T) => {
        if (col.dataMapping) {
          const value = getNestedValue(item, col.dataMapping);
          return value?.toString() || '';
        }
        return (item as any)[col.key]?.toString() || '';
      }),
      sortable: col.sortable ?? false,
      width: col.width
    }));

    // Agregar columna de acciones si está habilitada
    if (showActionColumn && actionMenuItems.length > 0) {
      cols.push({
        key: 'actions',
        title: t(actionColumnTitleKey || 'actions'),
        render: (item: T) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actionMenuItems.map((menuItem) => (
                <DropdownMenuItem 
                  key={menuItem.key}
                  onClick={() => menuItem.action(item)}
                  className={menuItem.className}
                >
                  {t(menuItem.labelKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        sortable: false,
        width: '80px'
      });
    }

    return cols;
  }, [columns, t, showActionColumn, actionMenuItems, actionColumnTitleKey]);

  // Crear estructura de datos para DataTable
  const tableData: TableData<T> = {
    data: data,
    meta: {
      page_size: pageSize,
      page_number: currentPage,
      total_elements: totalElements,
      total_pages: totalPages
    }
  };

  // Función para toggle de filtros
  const toggleFilter = (filterKey: string, value: any) => {
    setSelectedFilters(prev => {
      // Comportamiento especial para pricingType: solo un valor a la vez
      if (filterKey === 'pricingType') {
        const currentValues = prev[filterKey] || [];
        // Si ya está seleccionado, lo deseleccionamos (permitir quitar el filtro)
        const newValues = currentValues.includes(value) 
          ? [] 
          : [value]; // Solo un valor seleccionado a la vez
        
        return { ...prev, [filterKey]: newValues };
      }
      
      // Comportamiento por defecto para otros filtros (múltiple selección)
      const currentValues = prev[filterKey] || [];
      const newValues = Array.isArray(currentValues)
        ? (currentValues.includes(value) 
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value])
        : [value];
      
      return { ...prev, [filterKey]: newValues };
    });
    setCurrentPage(1);
  };

  // Handlers para la tabla
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
      {(title || titleKey || showCreateButton) && (
        <div className="flex justify-between items-center">
          {(title || titleKey) && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title || (titleKey && t(titleKey))}
              </h1>
              {(description || descriptionKey) && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {description || (descriptionKey && t(descriptionKey))}
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
                {t(createButtonLabelKey)}
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Filtros */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap gap-6 mb-6">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-wrap gap-2">
              {filter.type === 'button' && filter.availableValues?.map((value) => {
                // Manejar tanto strings como FilterOption objects
                const isObject = typeof value === 'object' && value !== null;
                const displayValue = isObject ? (value as FilterOption).label : value as string;
                const filterValue = isObject ? (value as FilterOption).value : value as string;
                const uniqueKey = isObject ? (value as FilterOption).key : value as string;
                
                // Definir colores específicos para pricing type
                const getButtonStyles = () => {
                  if (filter.key === 'pricingType') {
                    if (filterValue === 'all') {
                      return selectedFilters[filter.key]?.includes(filterValue)
                        ? 'bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800/60 dark:to-blue-800/60 border-purple-400 dark:border-purple-500 text-purple-800 dark:text-purple-200'
                        : 'bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30';
                    } else if (filterValue === 'basis') {
                      return selectedFilters[filter.key]?.includes(filterValue)
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                        : 'bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300';
                    } else if (filterValue === 'fixed') {
                      return selectedFilters[filter.key]?.includes(filterValue)
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300';
                    }
                  }
                  // Estilos por defecto para otros filtros
                  return selectedFilters[filter.key]?.includes(filterValue)
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
                };
                
                return (
                  <Button
                    key={uniqueKey}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFilter(filter.key, filterValue)}
                    className={`px-4 py-2 rounded-full border transition-colors ${getButtonStyles()}`}
                  >
                    {displayValue}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={tableColumns}
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
        loading={loading}
      />
    </div>
  );
}

// Mantener compatibilidad con el componente anterior
export const ContractsTable = GenericTable;