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
    try {
      // Get customer ID and JWT token from localStorage
      const customerId = localStorage.getItem('customer_id') || 'a328b9b8f1996eadd36d375f';
      const jwt = localStorage.getItem('jwt') || localStorage.getItem('id_token');
      
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
      
      // Transform the response data to match our interface
      return data.map((item: any) => ({
        key: item._id || item.key,
        value: item._id || item.value,
        label: item.name || item.label,
        organization: {
          _id: item._id,
          name: item.name,
          description: item.description,
          type: item.type,
          logo: item.logo,
          initials: item.initials || getInitials(item.name)
        }
      }));
    } catch (error) {
      console.error('Error fetching partition keys:', error);
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