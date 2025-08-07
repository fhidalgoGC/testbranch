import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePurchaseContract } from '@/context/PurchaseContractContext';
import { ContractInfoSection } from './sections/ContractInfoSection';
import { PriceSection } from './sections/PriceSection';
import { LogisticSection } from './sections/LogisticSection';
import { ShipmentSection } from './sections/ShipmentSection';
import { RemarksSection } from './sections/RemarksSection';

export function PurchaseContractForm() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { formData, isFormValid, resetForm } = usePurchaseContract();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      console.log('Form is not valid');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Submit form data to API
      console.log('Submitting form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to purchase contracts page on success
      navigate('/purchase-contracts');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form and navigate back
    resetForm();
    navigate('/purchase-contracts');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Contract Info */}
        <ContractInfoSection />

        {/* Section 2: Price Contract Per (Bushel 56) */}
        <PriceSection />

        {/* Section 3: Logistic Contract */}
        {/* <LogisticSection /> */}
        <div className="text-center text-gray-500 py-8">
          Logistic Section - Coming soon with global state
        </div>

        {/* Section 4: Shipment & Delivery */}
        {/* <ShipmentSection /> */}
        <div className="text-center text-gray-500 py-8">
          Shipment Section - Coming soon with global state
        </div>

        {/* Section 5: Remarks & Observation */}
        {/* <RemarksSection /> */}
        <div className="text-center text-gray-500 py-8">
          Remarks Section - Coming soon with global state
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-8"
          >
            {t('cancel')}
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('createContract')}...
              </>
            ) : (
              t('createContract')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}