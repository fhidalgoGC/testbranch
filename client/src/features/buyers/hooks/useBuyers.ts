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
  const [pageSize, setPageSize] = useState(params.limit || 10);
  const [sortKey, setSortKey] = useState(params.sortKey || 'full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(params.sortDirection || 'asc');
  const [searchValue, setSearchValue] = useState(params.search || '');

  const buildApiUrl = useCallback(() => {
    const partitionKey = localStorage.getItem('partition_key');
    const baseUrl = import.meta.env.VITE_URL_CRM;
    
    console.log('Building API URL with:', { partitionKey, baseUrl, envVars: import.meta.env });
    
    if (!partitionKey || !baseUrl) {
      console.error('Missing required data:', { partitionKey, baseUrl, envVars: import.meta.env });
      throw new Error('Missing required environment variables or partition key');
    }

    // Build filter object
    const baseFilter = {
      "_partitionKey": partitionKey,
      "roles.slug": {"$in": ["buyer"]}
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
      console.log('Executing query function...');
      const jwt = localStorage.getItem('jwt');
      const partitionKey = localStorage.getItem('partition_key');
      
      console.log('Auth tokens:', { jwt: !!jwt, partitionKey });
      
      // If no auth tokens, return empty data
      if (!jwt || !partitionKey) {
        console.error('Missing authentication tokens');
        return {
          data: [],
          meta: {
            page_size: pageSize,
            page_number: currentPage,
            total_elements: 0,
            total_pages: 0
          }
        };
      }

      // If in demo mode, return mock data with recently created buyers
      if (jwt === 'demo-jwt-token-for-testing') {
        console.log('Buyers: Demo mode - returning mock data');
        
        // Get any demo buyers created in this session from localStorage
        const createdBuyersData = localStorage.getItem('demo_created_buyers');
        const createdBuyers = createdBuyersData ? JSON.parse(createdBuyersData) : [];
        
        const baseMockBuyers = [
          {
            _id: 'demo-buyer-123',
            full_name: 'Juan Pérez García',
            person_type: 'natural_person',
            first_name: 'Juan',
            last_name: 'Pérez García',
            emails: [{ value: 'juan.perez@example.com', type: 'principal', verified: false }],
            phones: [{ calling_code: '+1', phone_number: '5551234567', type: 'principal', verified: false }],
            roles: [{ slug: 'buyer' }],
            active: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: 'demo-buyer-456',
            full_name: 'Comercializadora ABC S.A.',
            person_type: 'juridical_person',
            organization_name: 'Comercializadora ABC S.A.',
            first_name: 'Comercializadora',
            last_name: 'ABC S.A.',
            emails: [{ value: 'contacto@abc.com', type: 'principal', verified: false }],
            phones: [{ calling_code: '+52', phone_number: '5555678901', type: 'principal', verified: false }],
            roles: [{ slug: 'buyer' }],
            active: true,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString()
          }
        ];

        // Combine created buyers with base mock data (created buyers first)
        const allMockBuyers = [...createdBuyers, ...baseMockBuyers];
        
        console.log('Demo buyers:', { createdCount: createdBuyers.length, totalCount: allMockBuyers.length });

        return {
          data: allMockBuyers,
          meta: {
            page_size: pageSize,
            page_number: currentPage,
            total_elements: allMockBuyers.length,
            total_pages: Math.ceil(allMockBuyers.length / pageSize)
          }
        };
      }

      const url = buildApiUrl();
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          '_partitionkey': partitionKey,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response:', response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Result:', result);
      console.log('API Result Structure:', {
        hasData: !!result.data,
        dataLength: result.data?.length,
        hasMeta: !!result.meta,
        has_meta: !!result._meta,
        hasLinks: !!result._links,
        keys: Object.keys(result)
      });
      
      // Transform the response to match expected structure
      const transformedResult = {
        data: result.data || [],
        meta: result._meta ? {
          page_size: result._meta.page_size,
          page_number: result._meta.page_number,
          total_elements: result._meta.total_elements,
          total_pages: result._meta.total_pages
        } : {
          page_size: 25,
          page_number: 1,
          total_elements: result.data?.length || 0,
          total_pages: 1
        }
      };
      
      console.log('Transformed result:', transformedResult);
      return transformedResult;
    },
    enabled: true, // Always enable the query to see what happens
    retry: 1,
    onError: (error) => {
      console.error('Query error:', error);
    },
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