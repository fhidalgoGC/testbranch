import { addJwtPk } from '@/utils/apiInterceptors';
import { environment } from '@/environment/environment';

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

export const organizationService = {
  async getPartitionKeys(): Promise<OrganizationOption[]> {
    // Get customer ID from localStorage
    const customerId = localStorage.getItem('customer_id') || 'a328b9b8f1996eadd36d375f';
    
    try {
      const url = `${environment.IDENTITY_BASE_URL}/identity/v2/customers/${customerId}/partition_keys`;
      
      const response = await fetch(
        url,
        addJwtPk(url, { method: 'GET' })
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch partition keys: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Raw partition keys data received:', data);
      
      // Check if data is an array, if not, handle accordingly
      const itemsArray = Array.isArray(data) ? data : (data.data || data.items || []);
      
      console.log('Processed items array:', itemsArray);
      
      // Transform the response data to match our interface
      return itemsArray.map((item: any) => ({
        key: item.partitionKey || item.id || item.key,
        value: item.partitionKey || item.id || item.value,
        label: item.organization || item.label,
        organization: {
          _id: item.partitionKey || item.id,
          name: item.organization,
          description: item.description,
          type: item.type,
          logo: item.logo,
          initials: item.initials || getInitials(item.organization || '')
        }
      }));
    } catch (error) {
      console.error('Error fetching partition keys:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        customerId: customerId,
        url: `${environment.IDENTITY_BASE_URL}/identity/v2/customers/${customerId}/partition_keys`
      });
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