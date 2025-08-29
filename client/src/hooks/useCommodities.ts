import { useState, useEffect } from 'react';
import { environment } from '@/environment/environment';

interface CommodityOption {
  key: string;
  value: string;
  label: string;
  data?: any; // Store original data for subcategory access
}

interface CommodityResponse {
  data: Array<{
    _id: string;
    name: string;
    active: boolean;
    _partitionKey: string;
    original_name_id?: {
      names?: {
        es?: string;
        en?: string;
        default?: string;
      };
    };
  }>;
}

export const useCommodities = () => {
  const [commodities, setCommodities] = useState<CommodityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get auth data from localStorage
        const partitionKey = localStorage.getItem('partition_key') || '';
        const accessToken = localStorage.getItem('access_token') || '';

        if (!partitionKey || !accessToken) {
          console.log('Missing authentication data for commodities');
          setCommodities([]);
          return;
        }

        // Construct the API URL with filter
        const filter = JSON.stringify({
          "_partitionKey": partitionKey
        });
        
        const url = `${environment.CRM_BASE_URL}/commodities/commodities?page=1&limit=20&filter=${encodeURIComponent(filter)}`;
        
        console.log('Fetching commodities from:', url);

        // Headers
        const headers = {
          '_partitionkey': partitionKey,
          'accept': '*/*',
          'accept-language': 'es-419,es;q=0.9',
          'authorization': `Bearer ${accessToken}`,
          'bt-organization': partitionKey,
          'bt-uid': partitionKey,
          'organization_id': partitionKey,
          'pk-organization': partitionKey,
          'Content-Type': 'application/json'
        };

        console.log('Headers:', headers);

        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CommodityResponse = await response.json();
        console.log('Commodities response:', data);
        console.log('Raw commodities from API:', data.data);

        // Map the response to the expected format
        const mappedCommodities: CommodityOption[] = data.data
          .filter(commodity => commodity.active) // Only active commodities
          .map(commodity => ({
            key: commodity._id,           // _id -> key
            value: commodity.name,        // name -> value  
            label: commodity.name,        // name -> label
            data: commodity               // Store original data for subcategory access
          }));

        console.log('Mapped commodities for UI:', mappedCommodities);
        setCommodities(mappedCommodities);
      } catch (err) {
        console.error('Error fetching commodities:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch commodities');
        setCommodities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommodities();
  }, []);

  return { commodities, loading, error };
};