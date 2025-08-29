import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationService, OrganizationOption, Organization } from '@/services/organization.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { organizationLoadingStore } from '@/store/organizationLoadingStore';

export function useOrganizations() {
  const { loadOrganizationData } = useAuth();
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
        const found = organizations.find((org: OrganizationOption) => org.value === storedPartitionKey);
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
    const selectedOrg = organizations.find((org: OrganizationOption) => org.value === organizationId);
    if (selectedOrg) {
      console.log('Starting organization change, setting loading to true');
      organizationLoadingStore.setState(true);
      const startTime = Date.now();
      
      setCurrentOrganization(selectedOrg);
      
      // Update localStorage with new partition key
      localStorage.setItem('current_organization_id', selectedOrg.value);
      localStorage.setItem('current_organization_name', selectedOrg.label);
      
      try {
        // Use the new loadOrganizationData method instead of individual calls
        await loadOrganizationData(selectedOrg.value);
        
        // Fetch organization details with the new partition key
        const orgDetails = await organizationService.getOrganizations(selectedOrg.value);
        setOrganizationDetails(orgDetails);
        
        // Store organization details in localStorage
        localStorage.setItem('organization_details', JSON.stringify(orgDetails));
        
        console.log('Organization switched successfully to:', selectedOrg.label);
      } catch (error) {
        console.error('Error switching organization:', error);
        setOrganizationDetails([]);
        localStorage.removeItem('organization_details');
      } finally {
        // Ensure minimum loading time of 300ms
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 300 - elapsedTime);
        
        setTimeout(() => {
          console.log('Finishing organization change, setting loading to false');
          organizationLoadingStore.setState(false);
        }, remainingTime);
      }
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