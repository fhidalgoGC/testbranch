import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortKey?: string;
}

export interface TableData<T> {
  data: T[];
  meta: {
    page_size: number;
    page_number: number;
    total_elements: number;
    total_pages: number;
  };
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: TableData<T> | null;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (key: string, direction: 'asc' | 'desc') => void;
  onSearchChange: (search: string) => void;
  currentPage: number;
  pageSize: number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  searchValue: string;
}

const pageSizeOptions = [10, 25, 50, 100];

export function DataTable<T>({
  columns,
  data,
  loading = false,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearchChange,
  currentPage,
  pageSize,
  sortKey,
  sortDirection,
  searchValue,
}: DataTableProps<T>) {
  const [searchInput, setSearchInput] = useState(searchValue);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(searchInput);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, onSearchChange]);

  // Sync searchInput with external searchValue
  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const key = column.sortKey || column.key;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(key, newDirection);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearchChange('');
  };

  const canGoToPreviousPage = currentPage > 1;
  const canGoToNextPage = data ? currentPage < data.meta.total_pages : false;

  const startItem = data ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = data ? Math.min(currentPage * pageSize, data.meta.total_elements) : 0;

  return (
    <div className="space-y-4">
      {/* Search and controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10 h-9 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filas por página:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
            <SelectTrigger className="w-20 h-9 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors duration-100"
                    )}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {column.sortable && (
                        <div className="flex flex-col">
                          {sortKey === (column.sortKey || column.key) ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            )
                          ) : (
                            <div className="w-3 h-3 opacity-30">
                              <ChevronUp className="w-3 h-3 -mb-1" />
                              <ChevronDown className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Cargando...
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                data?.data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-100">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {column.render ? column.render(item) : String((item as any)[column.key] || '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {startItem} a {endItem} de {data.meta.total_elements} resultados
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!canGoToPreviousPage}
              className="h-8 px-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoToPreviousPage}
              className="h-8 px-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Página {currentPage} de {data.meta.total_pages}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoToNextPage}
              className="h-8 px-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.meta.total_pages)}
              disabled={!canGoToNextPage}
              className="h-8 px-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}