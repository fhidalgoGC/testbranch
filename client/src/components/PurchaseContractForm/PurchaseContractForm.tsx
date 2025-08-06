import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePurchaseContractForm } from './hooks/usePurchaseContractForm';
import { ContractInfoSection } from './sections/ContractInfoSection';
import { PriceSection } from './sections/PriceSection';
import { LogisticSection } from './sections/LogisticSection';
import { ShipmentSection } from './sections/ShipmentSection';
import { RemarksSection } from './sections/RemarksSection';

export function PurchaseContractForm() {
  const { t } = useTranslation();
  const {
    form,
    isSubmitting,
    onSubmit,
    onCancel,
    // Participant methods
    addParticipant,
    removeParticipant,
    updateParticipant,
    // Price schedule methods
    addPriceSchedule,
    removePriceSchedule,
    updatePriceSchedule,
    // Logistic schedule methods
    addLogisticSchedule,
    removeLogisticSchedule,
    updateLogisticSchedule,
    // Remarks methods
    addRemark,
    removeRemark,
    updateRemark,
  } = usePurchaseContractForm();

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
            
            {/* Section 1: Contract Info */}
            <ContractInfoSection
              addParticipant={addParticipant}
              removeParticipant={removeParticipant}
              updateParticipant={updateParticipant}
            />

            {/* Section 2: Price Contract Per (Bushel 56) */}
            <PriceSection
              addPriceSchedule={addPriceSchedule}
              removePriceSchedule={removePriceSchedule}
              updatePriceSchedule={updatePriceSchedule}
            />

            {/* Section 3: Logistic Contract */}
            <LogisticSection
              addLogisticSchedule={addLogisticSchedule}
              removeLogisticSchedule={removeLogisticSchedule}
              updateLogisticSchedule={updateLogisticSchedule}
            />

            {/* Section 4: Shipment & Delivery */}
            <ShipmentSection />

            {/* Section 5: Remarks & Observation */}
            <RemarksSection
              addRemark={addRemark}
              removeRemark={removeRemark}
              updateRemark={updateRemark}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
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
      </FormProvider>
    </div>
  );
}