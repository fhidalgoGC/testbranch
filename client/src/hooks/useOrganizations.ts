import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationService, OrganizationOption } from '@/services/organization.service';

export function useOrganizations() {
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationOption | null>(null);

  // Fetch organizations from API
  const {
    data: organizations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.getPartitionKeys,
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

  const changeOrganization = (organizationId: string) => {
    const selectedOrg = organizations.find(org => org.value === organizationId);
    if (selectedOrg) {
      setCurrentOrganization(selectedOrg);
      
      // Update localStorage with new partition key
      localStorage.setItem('partition_key', selectedOrg.value);
      localStorage.setItem('current_organization_id', selectedOrg.value);
      localStorage.setItem('current_organization_name', selectedOrg.label);
      
      // Force reload to refresh all data with new partition key
      window.location.reload();
    }
  };

  return {
    organizations,
    currentOrganization,
    changeOrganization,
    isLoading,
    error,
    refetch
  };
}