import { useQuery } from '@tanstack/react-query';

interface CharacteristicsConfigurationData {
  _id: string;
  name: string;
}

interface CharacteristicsConfigurationResponse {
  data: CharacteristicsConfigurationData[];
  path: string;
  code: string;
  messages: {
    name: string;
    value: string;
  };
  status: number;
}

interface CharacteristicsConfigurationOption {
  key: string;
  value: string;
  label: string;
}

interface UseCharacteristicsConfigurationsParams {
  commodityId?: string;
  subcategoryId?: string;
}

export function useCharacteristicsConfigurations({ 
  commodityId, 
  subcategoryId 
}: UseCharacteristicsConfigurationsParams) {
  return useQuery<CharacteristicsConfigurationOption[]>({
    queryKey: ['characteristics-configurations', commodityId, subcategoryId],
    queryFn: async () => {
      if (!commodityId || !subcategoryId) {
        return [];
      }

      // Get auth data from localStorage - check all available tokens
      const accessToken = localStorage.getItem('access_token');
      const idToken = localStorage.getItem('id_token');
      const partitionKey = localStorage.getItem('partition_key');
      
        hasAccessToken: !!accessToken,
        hasIdToken: !!idToken,
        hasPartition: !!partitionKey,
        accessTokenStart: accessToken?.substring(0, 20) || 'none',
        idTokenStart: idToken?.substring(0, 20) || 'none'
      });
      
      // Use id_token preferentially for this endpoint, with access_token fallback
      const authToken = idToken || accessToken;
      
      if (!authToken || !partitionKey) {
          hasAuthToken: !!authToken, 
          hasPartition: !!partitionKey 
        });
        return [];
      }
      
        tokenType: idToken ? 'id_token' : 'access_token',
        tokenLength: authToken.length,
        partitionKey: partitionKey
      });

      const url = `https://ssm-develop.grainchain.io/silosys-service/api/v1/chars-configs/summary?commodity_id=${commodityId}&subcategory_id=${subcategoryId}`;
      

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${authToken}`,
          '_partitionkey': partitionKey,
          'accept': '*/*',
          'accept-language': 'es-419,es;q=0.9',
          'bt-organization': partitionKey,
          'bt-uid': partitionKey,
          'organization_id': partitionKey,
          'origin': 'https://contracts-develop.grainchain.io',
          'pk-organization': partitionKey,
          'referer': 'https://contracts-develop.grainchain.io/',
          'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch characteristics configurations:', {
          status: response.status,
          statusText: response.statusText,
          url: url
        });
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const result: CharacteristicsConfigurationResponse = await response.json();
      

      // Map to standardized structure
      const mappedConfigurations = result.data.map((config: CharacteristicsConfigurationData) => ({
        key: config._id,
        value: config.name,
        label: config.name
      }));


      return mappedConfigurations;
    },
    enabled: !!(commodityId && subcategoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
}