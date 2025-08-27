import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import type { SellerFormData, CreateSellerPayload } from "../types/create-seller";
import { createPersonId, createSeller } from "@/services/crm-people.service";

export function useCreateSeller() {
  const [idempotentSellerId, setIdempotentSellerId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Initialize idempotent seller ID on mount
  useEffect(() => {
    const initializeIdempotentId = async () => {
      try {
        setIsInitializing(true);
        setInitializationError(null);

        const jwt = localStorage.getItem('jwt');
        const partitionKey = localStorage.getItem('partition_key');
        
        console.log('CreateSeller: Checking authentication tokens:', { 
          jwt: !!jwt, 
          partitionKey: !!partitionKey,
          jwtLength: jwt?.length || 0,
          partitionKeyValue: partitionKey 
        });
        
        // Check if we have real authentication tokens (not demo tokens)
        const isRealAuth = jwt && partitionKey && 
          jwt !== 'demo-jwt-token-for-testing' && 
          partitionKey !== 'demo-partition-key' &&
          localStorage.getItem('user_id'); // Check for user_id from real login

        if (!isRealAuth) {
          console.warn('CreateSeller: No real authentication found, using demo mode');
          localStorage.setItem('jwt', 'demo-jwt-token-for-testing');
          localStorage.setItem('partition_key', 'demo-partition-key');
          
          // For demo purposes, simulate the API response
          const mockSellerId = `demo-seller-id-${Date.now()}`;
          
          console.log('CreateSeller: Using demo seller ID:', mockSellerId);
          setIdempotentSellerId(mockSellerId);
          setInitializationError(null);
          setIsInitializing(false);
          return;
        }

        console.log('CreateSeller: Calling service to create seller ID');
        const sellerId = await createPersonId();
        setIdempotentSellerId(sellerId);
        setInitializationError(null);
      } catch (error) {
        console.error('CreateSeller: Failed to initialize idempotent seller ID:', error);
        setInitializationError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setIsInitializing(false);
      }
    };

    initializeIdempotentId();
  }, []);

  const createSellerMutation = useMutation({
    mutationFn: async (formData: SellerFormData) => {
      if (!idempotentSellerId) {
        throw new Error("Idempotent seller ID not initialized");
      }

      // Get partition key from localStorage
      const partitionKey = localStorage.getItem("partition_key");

      if (!partitionKey) {
        throw new Error("Partition key not found");
      }

      // Check if we're in demo mode
      const isDemoMode = partitionKey === 'demo-partition-key' || idempotentSellerId.startsWith('demo-seller-id-');
      
      if (isDemoMode) {
        console.log("CreateSeller: Demo mode detected, simulating successful seller creation");
        // Simulate successful seller creation in demo mode
        return {
          data: {
            key: idempotentSellerId,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            person_type: formData.person_type,
            roles: [{ slug: "seller" }],
            created: true
          }
        };
      }

      // Build full name based on person type
      const fullName =
        formData.person_type === "juridical_person"
          ? formData.organization_name || `${formData.first_name} ${formData.last_name}`
          : `${formData.first_name} ${formData.last_name}`;

      // Build the create seller payload
      const payload: CreateSellerPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: fullName,
        organization_name: formData.organization_name || undefined,
        person_type: formData.person_type,
        roles: [{ slug: "seller" }],
        emails: formData.email ? [
          {
            value: formData.email,
            type: "principal",
            verified: false,
          },
        ] : [],
        phones: formData.phone_number && formData.calling_code ? [
          {
            calling_code: formData.calling_code,
            phone_number: formData.phone_number,
            type: "principal",
            verified: false,
          },
        ] : [],
        _partitionKey: partitionKey,
        active: true,
      };

      console.log("Creating seller with payload:", payload);

      const result = await createSeller(idempotentSellerId, payload);
      return result;
    },
    onSuccess: (data) => {
      console.log("Seller creation mutation successful:", data);
    },
    onError: (error) => {
      console.error("Seller creation mutation failed:", error);
    },
  });

  return {
    idempotentSellerId,
    isInitializing,
    initializationError,
    createSeller: createSellerMutation.mutate,
    isCreating: createSellerMutation.isPending,
    error: createSellerMutation.error?.message,
    isSuccess: createSellerMutation.isSuccess,
  };
}