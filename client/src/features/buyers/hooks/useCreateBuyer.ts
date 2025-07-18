import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import type { CreateBuyerIdResponse, CreateBuyerPayload, BuyerFormData } from '../types/create-buyer';

export function useCreateBuyer() {
  const [, setLocation] = useLocation();
  const [idempotentBuyerId, setIdempotentBuyerId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  // Initialize idempotent ID when component mounts
  useEffect(() => {
    const initializeIdempotentId = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const partitionKey = localStorage.getItem('partition_key');
        
        if (!jwt || !partitionKey) {
          throw new Error('Missing authentication tokens');
        }

        const crmUrl = import.meta.env.VITE_URL_CRM;
        if (!crmUrl) {
          throw new Error('CRM URL not configured');
        }

        const response = await apiRequest<CreateBuyerIdResponse>({
          url: `${crmUrl}/crm-people/people`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _partitionKey: `organization_id=${partitionKey}`
          }),
        });

        setIdempotentBuyerId(response.data.key);
      } catch (error) {
        console.error('Failed to initialize idempotent buyer ID:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeIdempotentId();
  }, []);

  // Mutation for creating the buyer
  const createBuyerMutation = useMutation({
    mutationFn: async (formData: BuyerFormData) => {
      const jwt = localStorage.getItem('jwt');
      const partitionKey = localStorage.getItem('partition_key');
      
      if (!jwt || !partitionKey || !idempotentBuyerId) {
        throw new Error('Missing required data for buyer creation');
      }

      const crmUrl = import.meta.env.VITE_URL_CRM;
      if (!crmUrl) {
        throw new Error('CRM URL not configured');
      }

      // Build the payload
      const payload: CreateBuyerPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: formData.person_type === 'natural_person' 
          ? `${formData.first_name} ${formData.last_name}`
          : formData.organization_name,
        roles: [{ slug: 'buyer' }],
        emails: formData.email ? [{
          value: formData.email,
          type: 'principal',
          verified: false
        }] : [],
        phones: formData.phone_number && formData.calling_code ? [{
          calling_code: formData.calling_code,
          phone_number: formData.phone_number,
          type: 'principal',
          verified: false
        }] : [],
        externals: [{
          platform_id: 'null',
          platform: 'ss-desktop'
        }],
        _partitionKey: partitionKey,
        active: true,
        person_type: formData.person_type
      };

      // Add organization_name only for juridical persons
      if (formData.person_type === 'juridical_person') {
        payload.organization_name = formData.organization_name;
      }

      return apiRequest({
        url: `${crmUrl}/crm-people/people/${idempotentBuyerId}`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      // Invalidate buyers list to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/buyers'] });
      // Redirect to buyers list
      setLocation('/buyers');
    },
  });

  return {
    idempotentBuyerId,
    isInitializing,
    createBuyer: createBuyerMutation.mutate,
    isCreating: createBuyerMutation.isPending,
    error: createBuyerMutation.error,
    isSuccess: createBuyerMutation.isSuccess,
  };
}