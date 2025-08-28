import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationService, OrganizationOption, Organization } from '@/services/organization.service';

export function useOrganizations() {
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationOption | null>(null);
  const [organizationDetails, setOrganizationDetails] = useState<Organization[]>([]);

  // Get organizations from localStorage first, then fetch from API if not available
  const {
    data: organizations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      // First try to get from localStorage
      const storedOptions = localStorage.getItem('organization_options');
      if (storedOptions) {
        try {
          const parsedOptions = JSON.parse(storedOptions);
          console.log('Using organizations from localStorage:', parsedOptions);
          return parsedOptions;
        } catch (error) {
          console.warn('Failed to parse stored organization options:', error);
        }
      }
      
      // If not in localStorage, fetch from API
      console.log('Fetching organizations from API...');
      return organizationService.getPartitionKeys();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Initialize current organization from localStorage
  useEffect(() => {
    if (organizations.length > 0) {
      const storedPartitionKey = localStorage.getItem('partition_key');
      
      if (storedPartitionKey) {
        const found = organizations.find(org => org.value === storedPartitionKey);
        if (found) {
          setCurrentOrganization(found);
        } else {
          // If stored partition key doesn't match any organization, use the first one
          const firstOrg = organizations[0];
          setCurrentOrganization(firstOrg);
          localStorage.setItem('partition_key', firstOrg.value);
        }
      } else {
        // No partition key stored, use the first organization
        const firstOrg = organizations[0];
        setCurrentOrganization(firstOrg);
        localStorage.setItem('partition_key', firstOrg.value);
      }
    }
  }, [organizations]);

  const changeOrganization = async (organizationId: string) => {
    const selectedOrg = organizations.find(org => org.value === organizationId);
    if (selectedOrg) {
      setCurrentOrganization(selectedOrg);
      
      // Update localStorage with new partition key
      localStorage.setItem('partition_key', selectedOrg.value);
      localStorage.setItem('current_organization_id', selectedOrg.value);
      localStorage.setItem('current_organization_name', selectedOrg.label);
      
      try {
        // Fetch organization details with the new partition key
        const orgDetails = await organizationService.getOrganizations(selectedOrg.value);
        setOrganizationDetails(orgDetails);
        
        // Store organization details in localStorage
        localStorage.setItem('organization_details', JSON.stringify(orgDetails));
        
        console.log('Organization details fetched and stored:', orgDetails);
      } catch (error) {
        console.error('Error fetching organization details:', error);
        setOrganizationDetails([]);
        localStorage.removeItem('organization_details');
      }
      
      // Force reload to refresh all data with new partition key
      window.location.reload();
    }
  };

  // Load organization details from localStorage on init
  useEffect(() => {
    const storedOrgDetails = localStorage.getItem('organization_details');
    if (storedOrgDetails) {
      try {
        const parsedDetails = JSON.parse(storedOrgDetails);
        setOrganizationDetails(parsedDetails);
      } catch (error) {
        console.error('Error parsing stored organization details:', error);
        localStorage.removeItem('organization_details');
      }
    }
  }, []);

  return {
    organizations,
    currentOrganization,
    organizationDetails,
    changeOrganization,
    isLoading,
    error,
    refetch
  };
}