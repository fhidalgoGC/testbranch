import { useState } from 'react';
import { StatesResponse, State } from '../types/state';

// Demo states data for testing
const DEMO_STATES: Record<string, State[]> = {
  'COL': [
    {
      _id: "68700d82ff4c8f3072430056",
      _partitionKey: "public",
      active: true,
      code: "91",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "AMAZONAS",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430057",
      _partitionKey: "public",
      active: true,
      code: "05",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "ANTIOQUIA",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430058",
      _partitionKey: "public",
      active: true,
      code: "08",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "ATLÁNTICO",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430059",
      _partitionKey: "public",
      active: true,
      code: "11",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "BOGOTÁ D.C.",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430060",
      _partitionKey: "public",
      active: true,
      code: "13",
      country: "68700d82ff4c8f3072430038",
      country_slug: "COL",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "BOLÍVAR",
      status: ""
    }
  ],
  'GTM': [
    {
      _id: "68700d82ff4c8f3072430061",
      _partitionKey: "public",
      active: true,
      code: "01",
      country: "68700d82ff4c8f3072430039",
      country_slug: "GTM",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "GUATEMALA",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430062",
      _partitionKey: "public",
      active: true,
      code: "02",
      country: "68700d82ff4c8f3072430039",
      country_slug: "GTM",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "EL PROGRESO",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430063",
      _partitionKey: "public",
      active: true,
      code: "03",
      country: "68700d82ff4c8f3072430039",
      country_slug: "GTM",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "SACATEPÉQUEZ",
      status: ""
    }
  ],
  'USA': [
    {
      _id: "68700d82ff4c8f3072430064",
      _partitionKey: "public",
      active: true,
      code: "CA",
      country: "68700d82ff4c8f3072430040",
      country_slug: "USA",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "CALIFORNIA",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430065",
      _partitionKey: "public",
      active: true,
      code: "TX",
      country: "68700d82ff4c8f3072430040",
      country_slug: "USA",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "TEXAS",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430066",
      _partitionKey: "public",
      active: true,
      code: "FL",
      country: "68700d82ff4c8f3072430040",
      country_slug: "USA",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "FLORIDA",
      status: ""
    }
  ],
  'MEX': [
    {
      _id: "68700d82ff4c8f3072430067",
      _partitionKey: "public",
      active: true,
      code: "09",
      country: "68700d82ff4c8f3072430041",
      country_slug: "MEX",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "CIUDAD DE MÉXICO",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430068",
      _partitionKey: "public",
      active: true,
      code: "19",
      country: "68700d82ff4c8f3072430041",
      country_slug: "MEX",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "NUEVO LEÓN",
      status: ""
    },
    {
      _id: "68700d82ff4c8f3072430069",
      _partitionKey: "public",
      active: true,
      code: "15",
      country: "68700d82ff4c8f3072430041",
      country_slug: "MEX",
      created_at: "2025-07-10T20:35:45.418Z",
      etl: true,
      external: [],
      extras: [],
      name: "MÉXICO",
      status: ""
    }
  ]
};

interface UseStatesParams {
  countrySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
  language?: 'en' | 'es';
}

export function useStates(params: UseStatesParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStates = async (): Promise<StatesResponse | null> => {
    if (!params.countrySlug) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_URL_CRM || 'https://crm-develop.grainchain.io/api/v1';
      
      // Build filter object
      const filter: any = {
        country_slug: params.countrySlug
      };

      // Add search filter if provided
      if (params.search && params.search.trim() !== '') {
        filter.name = {
          $regex: `.*${params.search.trim()}.*`,
          $options: 'i'
        };
      }

      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.pageSize || 10).toString(),
        filter: JSON.stringify(filter),
        sort: JSON.stringify({ name: params.sortOrder === 'desc' ? -1 : 1 })
      });

      const url = `${baseUrl}/crm-locations/states/find-states?${queryParams.toString()}`;
      console.log('States API: Making request to:', url);

      // Check for authentication tokens
      const jwt = localStorage.getItem('jwt_token');
      const partitionKey = localStorage.getItem('partition_key');

      if (!jwt || jwt === 'demo-jwt-token' || !partitionKey || partitionKey === 'demo-partition-key') {
        console.warn('States API: No real authentication found, using demo mode');
        
        // Filter demo states by country slug
        let states = DEMO_STATES[params.countrySlug] || [];
        
        // Apply search filter to demo data
        if (params.search && params.search.trim() !== '') {
          const searchTerm = params.search.trim().toLowerCase();
          states = states.filter(state => 
            state.name.toLowerCase().includes(searchTerm)
          );
        }

        console.log('States API: Demo mode loaded', states.length, 'states for country', params.countrySlug);

        return {
          data: states,
          _meta: {
            page_size: params.pageSize || 10,
            page_number: params.page || 1,
            total_elements: states.length,
            total_pages: Math.ceil(states.length / (params.pageSize || 10))
          },
          _links: {
            self: `/api/v1/crm-locations/states/find-states?page=${params.page || 1}`,
            first: '/api/v1/crm-locations/states/find-states?page=1',
            prev: `/api/v1/crm-locations/states/find-states?page=${Math.max(1, (params.page || 1) - 1)}`,
            next: `/api/v1/crm-locations/states/find-states?page=${(params.page || 1) + 1}`,
            last: `/api/v1/crm-locations/states/find-states?page=${Math.ceil(states.length / (params.pageSize || 10))}`
          }
        };
      }

      // Make real API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'X-Partition-Key': partitionKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StatesResponse = await response.json();
      console.log('States API: Success response:', data);
      
      return data;

    } catch (error) {
      console.error('States API: Error fetching states:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchStates,
    isLoading,
    error
  };
}