import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import type { CreateBuyerIdResponse, CreateBuyerPayload, BuyerFormData } from '../types/create-buyer';

export function useCreateBuyer() {
  const [, setLocation] = useLocation();
  const [idempotentBuyerId, setIdempotentBuyerId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize idempotent ID when component mounts
  useEffect(() => {
    const initializeIdempotentId = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const partitionKey = localStorage.getItem('partition_key');
        
        console.log('CreateBuyer: Checking authentication tokens:', { 
          jwt: !!jwt, 
          partitionKey: !!partitionKey,
          jwtLength: jwt?.length || 0,
          partitionKeyValue: partitionKey 
        });
        
        // Always use demo mode for now since we don't have real auth tokens
        console.warn('CreateBuyer: Using demo mode for testing');
        localStorage.setItem('jwt', 'demo-jwt-token-for-testing');
        localStorage.setItem('partition_key', 'demo-partition-key');
        
        // For demo purposes, simulate the API response
        const mockBuyerId = `demo-buyer-id-${Date.now()}`;
        
        console.log('CreateBuyer: Using demo buyer ID:', mockBuyerId);
        setIdempotentBuyerId(mockBuyerId);
        setError(null);
        setIsInitializing(false);
        return;

        // TODO: Enable real API calls when proper authentication is implemented
        /*

        // Only run real API calls if we have valid authentication
        const crmUrl = import.meta.env.VITE_URL_CRM;
        console.log('CreateBuyer: CRM URL:', crmUrl);
        
        if (!crmUrl) {
          throw new Error('CRM URL not configured');
        }

        console.log('CreateBuyer: Making POST request to initialize buyer ID');
        
        const response = await fetch(`${crmUrl}/crm-people/people`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _partitionKey: `organization_id=${partitionKey}`
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data: CreateBuyerIdResponse = await response.json();

        console.log('CreateBuyer: Successfully initialized buyer ID:', data.data.key);
        setIdempotentBuyerId(data.data.key);
        setError(null);
        */
      } catch (err) {
        // This catch block should not be reached in demo mode
        console.error('CreateBuyer: Unexpected error in demo mode:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
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

      console.log('CreateBuyer: Submitting form data:', formData);

      // Check if we're in demo mode
      if (jwt === 'demo-jwt-token-for-testing') {
        console.log('CreateBuyer: Demo mode - simulating buyer creation');
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Build the demo payload for logging
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

        console.log('CreateBuyer: Demo payload would be:', payload);
        
        return { success: true, data: payload };
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

      const response = await fetch(`${crmUrl}/crm-people/people/${idempotentBuyerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
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
    initializationError: error,
    createBuyer: createBuyerMutation.mutate,
    isCreating: createBuyerMutation.isPending,
    error: createBuyerMutation.error,
    isSuccess: createBuyerMutation.isSuccess,
  };
}