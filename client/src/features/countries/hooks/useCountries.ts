import { useQuery } from '@tanstack/react-query';
import type { CountryApiResponse, UseCountriesParams } from '../types/country';

export function useCountries({ 
  page = 1, 
  limit = 10, 
  search = '', 
  language = 'en' 
}: UseCountriesParams = {}) {
  return useQuery({
    queryKey: ['countries', { page, limit, search, language }],
    queryFn: async (): Promise<CountryApiResponse> => {
      const crmUrl = import.meta.env.VITE_URL_CRM;
      const jwt = localStorage.getItem('jwt');
      
      if (!crmUrl) {
        throw new Error('CRM URL not configured');
      }

      // Build the URL with query parameters
      let url = `${crmUrl}/crm-locations/countries/find-countries?page=${page}&limit=${limit}`;
      
      // Add search filter if provided
      if (search && search.trim()) {
        const searchKey = language === 'es' ? 'names.es' : 'names.en';
        const filter = JSON.stringify({
          "$or": [{
            [searchKey]: {
              "$regex": `.*${search.trim()}`,
              "$options": "i"
            }
          }]
        });
        url += `&filter=${encodeURIComponent(filter)}`;
      }
      
      // Add sorting
      const sortKey = language === 'es' ? 'names.es' : 'names.en';
      const sort = JSON.stringify({ [sortKey]: 1 });
      url += `&sort=${encodeURIComponent(sort)}`;

      console.log('Countries API: Making request to:', url);

      // Check if we're in demo mode
      if (jwt === 'demo-jwt-token-for-testing') {
        console.log('Countries API: Demo mode - returning mock data');
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock response data
        const mockCountries = [
          {
            _id: "demo-country-mex",
            slug: "MEX",
            flag: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjgiIGZpbGw9IiNGRkZGRkYiLz4KPHJlY3QgeT0iOCIgd2lkdGg9IjMyIiBoZWlnaHQ9IjgiIGZpbGw9IiNGRjAwMDAiLz4KPHJlY3QgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSI4IiBmaWxsPSIjMDA4MDAwIi8+Cjwvc3ZnPgo=",
            names: {
              default: "Mexico",
              en: "Mexico",
              es: "México",
              pt: "México"
            },
            nationality: [],
            capital: "Ciudad de México",
            currency: "MXN",
            currency_name: "Mexican peso",
            currency_symbol: "$",
            phone_settings: {
              calling_code: "+52",
              mask: "",
              max_lenght: "",
              min_lenght: "",
              pattern: ""
            },
            extras: [],
            status: "",
            created_at: "2022-05-05T22:26:39.476Z",
            active: true,
            _partitionKey: "public",
            country_slug: "MEX",
            external: [],
            name: language === 'es' ? "México" : "Mexico"
          },
          {
            _id: "demo-country-usa",
            slug: "USA",
            flag: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjI0IiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkYwMDAwIi8+CjxyZWN0IHk9IjQiIHdpZHRoPSIzMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkYwMDAwIi8+CjxyZWN0IHk9IjgiIHdpZHRoPSIzMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkYwMDAwIi8+CjxyZWN0IHk9IjEyIiB3aWR0aD0iMzIiIGhlaWdodD0iMiIgZmlsbD0iI0ZGMDAwMCIvPgo8cmVjdCB5PSIxNiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjIiIGZpbGw9IiNGRjAwMDAiLz4KPHJlY3QgeT0iMjAiIHdpZHRoPSIzMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRkYwMDAwIi8+CjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgZmlsbD0iIzAwMjY4OCIvPgo8L3N2Zz4K",
            names: {
              default: "United States",
              en: "United States",
              es: "Estados Unidos",
              pt: "Estados Unidos"
            },
            nationality: [],
            capital: "Washington D.C.",
            currency: "USD",
            currency_name: "US Dollar",
            currency_symbol: "$",
            phone_settings: {
              calling_code: "+1",
              mask: "",
              max_lenght: "",
              min_lenght: "",
              pattern: ""
            },
            extras: [],
            status: "",
            created_at: "2022-05-05T22:26:39.476Z",
            active: true,
            _partitionKey: "public",
            country_slug: "USA",
            external: [],
            name: language === 'es' ? "Estados Unidos" : "United States"
          }
        ];

        // Filter by search if provided
        const filteredCountries = search 
          ? mockCountries.filter(country => 
              (language === 'es' ? country.names.es : country.names.en)
                .toLowerCase()
                .includes(search.toLowerCase())
            )
          : mockCountries;

        return {
          data: filteredCountries,
          _meta: {
            page_size: limit,
            page_number: page,
            total_elements: filteredCountries.length,
            total_pages: Math.ceil(filteredCountries.length / limit)
          },
          _links: {
            self: "",
            first: "",
            prev: "",
            next: "",
            last: ""
          }
        };
      }

      // Real API call
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Countries API request failed: ${response.status} ${response.statusText}`);
      }

      const data: CountryApiResponse = await response.json();
      
      console.log('Countries API: Success, received', data.data.length, 'countries');
      
      return data;
    },
    enabled: true,
  });
}