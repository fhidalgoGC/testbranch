import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BuyersResponse } from '../types';

interface UseBuyersParams {
  page?: number;
  limit?: number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}

export function useBuyers(params: UseBuyersParams = {}) {
  const [currentPage, setCurrentPage] = useState(params.page || 1);
  const [pageSize, setPageSize] = useState(params.limit || 25);
  const [sortKey, setSortKey] = useState(params.sortKey || 'full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(params.sortDirection || 'asc');
  const [searchValue, setSearchValue] = useState(params.search || '');

  const buildApiUrl = useCallback(() => {
    const partitionKey = localStorage.getItem('partition_key');
    const baseUrl = import.meta.env.VITE_URL_CRM;
    
    if (!partitionKey || !baseUrl) {
      throw new Error('Missing required environment variables or partition key');
    }

    // Build filter object
    const baseFilter = {
      "_partitionKey": partitionKey,
      "roles.slug": "{$in:['buyer']}"
    };

    let filter = baseFilter;
    
    if (searchValue.trim()) {
      filter = {
        ...baseFilter,
        "$or": [
          {
            "full_name": {
              "$regex": `.*${searchValue.trim()}`,
              "$options": "i"
            }
          },
          {
            "emails.value": {
              "$regex": `.*${searchValue.trim()}`,
              "$options": "i"
            }
          },
          {
            "phones.phone_number": {
              "$regex": `.*${searchValue.trim()}`,
              "$options": "i"
            }
          }
        ]
      };
    }

    // Build sort object
    const sort = {
      [sortKey]: sortDirection === 'asc' ? '1' : '-1'
    };

    // Build URL with query parameters
    const url = new URL(`${baseUrl}/crm-people/people`);
    url.searchParams.append('filter', JSON.stringify(filter));
    url.searchParams.append('page', currentPage.toString());
    url.searchParams.append('limit', pageSize.toString());
    url.searchParams.append('sort', JSON.stringify(sort));

    return url.toString();
  }, [currentPage, pageSize, sortKey, sortDirection, searchValue]);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<BuyersResponse>({
    queryKey: ['buyers', currentPage, pageSize, sortKey, sortDirection, searchValue],
    queryFn: async () => {
      const jwt = localStorage.getItem('jwt');
      const partitionKey = localStorage.getItem('partition_key');
      
      if (!jwt || !partitionKey) {
        throw new Error('Missing authentication tokens');
      }

      const url = buildApiUrl();
      
      const response = await apiRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          '_partitionkey': partitionKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!localStorage.getItem('jwt') && !!localStorage.getItem('partition_key'),
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const handleSortChange = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when changing sort
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchValue(search);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    currentPage,
    pageSize,
    sortKey,
    sortDirection,
    searchValue,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSearchChange,
  };
}