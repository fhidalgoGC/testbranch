import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { PurchaseContractFormData } from '@/types/purchaseContract.types';

// Default values for the form data
const getDefaultFormData = (): PurchaseContractFormData => ({
  // Contract Info Section
  folio: '',
  type: 'purchase',
  sub_type: 'direct',
  commodity_id: '',
  commodity_name: '',
  characteristics_configuration_id: '',
  characteristics_configuration_name: '',
  grade: 1,
  quantity: 0,
  reference_number: '',
  measurement_unit_id: '',
  measurement_unit: '',
  contract_date: '',
  
  // Participants - minimum structure
  participants: [
    {
      people_id: '',
      name: '',
      role: 'buyer'
    },
    {
      people_id: '',
      name: '',
      role: 'seller'
    }
  ],
  
  // Price Section - default fixed pricing
  price_schedule: [
    {
      pricing_type: 'fixed',
      price: 0,
      basis: 0,
      basis_operation: 'add',
      future_price: 0,
      option_month: '',
      option_year: new Date().getFullYear(),
      payment_currency: 'usd',
      exchange: ''
    }
  ],
  
  // Logistic Section - default none freight cost
  logistic_schedule: [
    {
      logistic_payment_responsability: 'buyer',
      logistic_coordination_responsability: 'buyer',
      freight_cost: {
        type: 'none',
        min: 0,
        max: 0,
        cost: 0
      },
      payment_currency: 'usd'
    }
  ],
  
  // Shipment Section
  shipping_start_date: '',
  shipping_end_date: '',
  application_priority: 1,
  delivered: '',
  transport: '',
  weights: '',
  inspections: '',
  proteins: '',
  
  // Thresholds
  min_thresholds_percentage: 0,
  max_thresholds_percentage: 100,
  
  // Seller
  seller: '',
  
  // Remarks Section
  remarks: []
});

// Context interface
interface PurchaseContractContextType {
  formData: PurchaseContractFormData;
  updateField: (field: keyof PurchaseContractFormData, value: any) => void;
  updateNestedField: (path: string, value: any) => void;
  resetForm: () => void;
  isFormValid: () => boolean;
}

// Create context
const PurchaseContractContext = createContext<PurchaseContractContextType | undefined>(undefined);

// Provider component
interface PurchaseContractProviderProps {
  children: ReactNode;
}

export const PurchaseContractProvider: React.FC<PurchaseContractProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<PurchaseContractFormData>(getDefaultFormData());

  // Update top-level field
  const updateField = (field: keyof PurchaseContractFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update nested field using dot notation path (e.g., "price_schedule.0.price")
  const updateNestedField = (path: string, value: any) => {
    const pathParts = path.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      // Navigate to the parent of the field to update
      for (let i = 0; i < pathParts.length - 1; i++) {
        const key = pathParts[i];
        const nextKey = pathParts[i + 1];
        
        // Handle array indices
        if (!isNaN(Number(nextKey))) {
          current[key] = [...(current[key] || [])];
          current = current[key];
        } else {
          current[key] = { ...current[key] };
          current = current[key];
        }
      }
      
      // Set the final value
      const finalKey = pathParts[pathParts.length - 1];
      current[finalKey] = value;
      
      return newData;
    });
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData(getDefaultFormData());
  };

  // Basic form validation
  const isFormValid = (): boolean => {
    const required = [
      'sub_type',
      'commodity_id',
      'characteristics_configuration_id',
      'grade',
      'quantity',
      'reference_number',
      'measurement_unit',
      'contract_date',
      'shipping_start_date',
      'shipping_end_date',
      'application_priority',
      'delivered',
      'transport',
      'weights',
      'inspections',
      'proteins',
      'seller'
    ];

    for (const field of required) {
      if (!formData[field as keyof PurchaseContractFormData]) {
        return false;
      }
    }

    // Check participants
    if (formData.participants.length < 2) return false;
    const hasBuyer = formData.participants.some(p => p.role === 'buyer');
    const hasSeller = formData.participants.some(p => p.role === 'seller');
    if (!hasBuyer || !hasSeller) return false;

    // Check price schedule
    if (formData.price_schedule.length === 0) return false;
    const priceItem = formData.price_schedule[0];
    if (priceItem.pricing_type === 'fixed') {
      if (!priceItem.price || !priceItem.future_price) return false;
    } else if (priceItem.pricing_type === 'basis') {
      if (priceItem.basis === null || priceItem.basis === undefined) return false;
    }

    // Check logistic schedule
    if (formData.logistic_schedule.length === 0) return false;

    return true;
  };

  const value: PurchaseContractContextType = {
    formData,
    updateField,
    updateNestedField,
    resetForm,
    isFormValid
  };

  return (
    <PurchaseContractContext.Provider value={value}>
      {children}
    </PurchaseContractContext.Provider>
  );
};

// Custom hook to use the context
export const usePurchaseContract = () => {
  const context = useContext(PurchaseContractContext);
  if (context === undefined) {
    throw new Error('usePurchaseContract must be used within a PurchaseContractProvider');
  }
  return context;
};

// Custom hook for specific field updates
export const usePurchaseContractField = <T extends keyof PurchaseContractFormData>(
  field: T
): [PurchaseContractFormData[T], (value: PurchaseContractFormData[T]) => void] => {
  const { formData, updateField } = usePurchaseContract();
  
  const value = formData[field];
  const setValue = (newValue: PurchaseContractFormData[T]) => {
    updateField(field, newValue);
  };
  
  return [value, setValue];
};

// Custom hook for nested field updates (e.g., price_schedule.0.price)
export const usePurchaseContractNestedField = <T = any>(
  path: string
): [T, (value: T) => void] => {
  const { formData, updateNestedField } = usePurchaseContract();
  
  // Get current value using path
  const getValue = (obj: any, path: string): T => {
    const pathParts = path.split('.');
    let current = obj;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return undefined as T;
      }
    }
    
    return current as T;
  };
  
  const value = getValue(formData, path);
  const setValue = (newValue: T) => {
    updateNestedField(path, newValue);
  };
  
  return [value, setValue];
};