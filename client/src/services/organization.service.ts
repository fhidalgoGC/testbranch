import { authenticatedFetch } from '@/utils/apiInterceptors';

export interface Organization {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  logo?: string;
  initials?: string;
}

export interface OrganizationOption {
  key: string;
  value: string;
  label: string;
  organization: Organization;
}

const ORGANIZATION_ENDPOINT = 'https://un4grlwfx2.execute-api.us-west-2.amazonaws.com/dev/identity/v2/customers';

export const organizationService = {
  async getPartitionKeys(): Promise<OrganizationOption[]> {
    // Get customer ID and JWT token from localStorage
    const customerId = localStorage.getItem('customer_id') || 'a328b9b8f1996eadd36d375f';
    const jwt = localStorage.getItem('jwt') || localStorage.getItem('id_token');
    
    try {
      
      if (!jwt) {
        console.warn('No JWT token found for partition keys request');
        return [];
      }
      
      const response = await fetch(
        `${ORGANIZATION_ENDPOINT}/${customerId}/partition_keys`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': `Bearer ${jwt}`,
            'origin': window.location.origin,
            'referer': window.location.href,
            'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch partition keys: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Raw partition keys data received:', data);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array but received:', typeof data, data);
        return [];
      }
      
      // Save to localStorage for future use
      localStorage.setItem('partition_keys_data', JSON.stringify(data));
      
      // Transform the response data to match our interface
      const transformedData = data.map((item: any) => ({
        key: item.partitionKey || item.id,
        value: item.partitionKey || item.id,
        label: item.organization || 'Unknown Organization',
        organization: {
          _id: item.partitionKey || item.id,
          name: item.organization || 'Unknown Organization',
          description: item.type || '',
          type: item.type,
          logo: item.logo,
          initials: getInitials(item.organization || 'Unknown Organization')
        }
      }));
      
      console.log('Transformed organizations data:', transformedData);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching partition keys:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        customerId: customerId,
        jwt: jwt ? 'Present' : 'Missing',
        url: `${ORGANIZATION_ENDPOINT}/${customerId}/partition_keys`
      });
      
      // Try to get data from localStorage as fallback
      try {
        const cachedData = localStorage.getItem('partition_keys_data');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          console.log('Using cached partition keys data:', parsedData);
          
          // Transform cached data
          return parsedData.map((item: any) => ({
            key: item.partitionKey || item.id,
            value: item.partitionKey || item.id,
            label: item.organization || 'Unknown Organization',
            organization: {
              _id: item.partitionKey || item.id,
              name: item.organization || 'Unknown Organization',
              description: item.type || '',
              type: item.type,
              logo: item.logo,
              initials: getInitials(item.organization || 'Unknown Organization')
            }
          }));
        }
      } catch (cacheError) {
        console.error('Error reading cached partition keys:', cacheError);
      }
      
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  }
};

// Helper function to generate initials from organization name
function getInitials(name: string): string {
  if (!name) return 'OR';
  
  const words = name.split(' ').filter(word => word.length > 0);
  
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    return words[0].substring(0, 2).toUpperCase();
  } else if (words.length === 1 && words[0].length === 1) {
    return `${words[0][0]}${words[0][0]}`.toUpperCase();
  }
  
  return 'OR';
}