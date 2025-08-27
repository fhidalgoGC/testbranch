import { useState } from 'react';
import { CountryApiResponse, Country } from '../types/country';

interface UseCountriesParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
  language?: 'en' | 'es';
}

export function useCountries(params: UseCountriesParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = async (): Promise<CountryApiResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the CRM base URL - it should already include /api/v1
      const baseUrl = import.meta.env.VITE_URL_CRM || 'https://crm-develop.grainchain.io/api/v1';
      
      // Build sort object based on language and sort order
      const language = params.language || 'en';
      const sortOrder = params.sortOrder || 'asc';
      const sortKey = `names.${language}`;
      const sortValue = sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortKey]: sortValue };
      
        language,
        sortOrder,
        sortKey,
        sortValue,
        sortObject: sort
      });

      // Build filter object for search
      let filter: any = {};
      if (params.search && params.search.trim() !== '') {
        // Search in both English and Spanish names
        filter = {
          $or: [
            { "names.en": { $regex: `.*${params.search.trim()}.*`, $options: "i" } },
            { "names.es": { $regex: `.*${params.search.trim()}.*`, $options: "i" } }
          ]
        };
      }

      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.pageSize || 10).toString(),
        sort: JSON.stringify(sort)
      });

      // Add filter only if there's a search term
      if (Object.keys(filter).length > 0) {
        queryParams.append('filter', JSON.stringify(filter));
      }

      const url = `${baseUrl}/crm-locations/countries/find-countries?${queryParams.toString()}`;

      // Check for authentication tokens
      const jwt = localStorage.getItem('jwt_token');
      const partitionKey = localStorage.getItem('partition_key');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add authentication headers if available and not demo tokens
      if (jwt && jwt !== 'demo-jwt-token') {
        headers['Authorization'] = `Bearer ${jwt}`;
      }
      if (partitionKey && partitionKey !== 'demo-partition-key') {
        headers['X-Partition-Key'] = partitionKey;
      }


      const response = await fetch(url, {
        method: 'GET',
        headers
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('Countries API: Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data: CountryApiResponse = await response.json();
      
      // Log sample of received countries for debugging
      data.data.slice(0, 3).forEach(country => {
          id: country._id,
          slug: country.slug,
          nameEn: country.names?.en || country.name,
          nameEs: country.names?.es,
          hasFlag: !!country.flag,
          flagLength: country.flag?.length || 0
        });
      });
      
      return data;

    } catch (error) {
      console.error('Countries API: Error fetching countries:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchCountries,
    isLoading,
    error
  };
}