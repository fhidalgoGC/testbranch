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
      {/* Header with title and debug button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('createContract')}
        </h1>
        <button
          type="button"
          onClick={() => {
            const formValues = form.getValues();
            
            // Define options arrays (same as in ContractInfoSection)
            const FAKE_SELLERS = [
              {
                id: '1',
                name: 'Juan Carlos Rodríguez',
                company: 'Agricola San Miguel',
                email: 'juan.rodriguez@sanmiguel.com',
                phone: '+52 55 1234 5678',
                location: 'Guadalajara, México',
                type: 'company' as const
              },
              {
                id: '2',
                name: 'María Elena Vásquez',
                email: 'maria.vasquez@email.com',
                phone: '+52 33 9876 5432',
                location: 'Zapopan, México',
                type: 'individual' as const
              },
              {
                id: '3',
                name: 'Roberto Fernández',
                company: 'Granos del Norte SA',
                email: 'r.fernandez@granoselnorte.com',
                phone: '+52 81 5555 0123',
                location: 'Monterrey, México',
                type: 'company' as const
              },
              {
                id: '4',
                name: 'Ana Patricia Morales',
                company: 'Cooperativa El Campo',
                email: 'ana.morales@elcampo.mx',
                phone: '+52 444 777 8899',
                location: 'San Luis Potosí, México',
                type: 'company' as const
              },
              {
                id: '5',
                name: 'Carlos David Herrera',
                email: 'carlos.herrera@outlook.com',
                phone: '+52 477 123 4567',
                location: 'León, México',
                type: 'individual' as const
              },
              {
                id: '6',
                name: 'Luisa Fernanda García',
                company: 'Agroexportadora del Bajío',
                email: 'luisa.garcia@agrobajio.com',
                phone: '+52 462 888 9999',
                location: 'Celaya, México',
                type: 'company' as const
              }
            ];
            
            const COMMODITY_OPTIONS = [
              { key: 'corn', value: '6839ef25edc3c27f091bdfc0', label: 'Maíz / Corn' },
              { key: 'soybean', value: '6839ef25edc3c27f091bdfc1', label: 'Soja / Soybean' },
              { key: 'wheat', value: '6839ef25edc3c27f091bdfc2', label: 'Trigo / Wheat' },
              { key: 'sorghum', value: '6839ef25edc3c27f091bdfc3', label: 'Sorgo / Sorghum' },
              { key: 'barley', value: '6839ef25edc3c27f091bdfc4', label: 'Cebada / Barley' }
            ];
            
            const CHARACTERISTICS_CONFIG_OPTIONS = [
              { key: 'standard', value: 'config_standard', label: 'Estándar / Standard' },
              { key: 'premium', value: 'config_premium', label: 'Premium' },
              { key: 'organic', value: 'config_organic', label: 'Orgánico / Organic' },
              { key: 'non_gmo', value: 'config_non_gmo', label: 'No GMO / Non-GMO' },
              { key: 'export', value: 'config_export', label: 'Exportación / Export Grade' }
            ];
            
            const MEASUREMENT_UNIT_OPTIONS = [
              { key: 'tons', value: 'unit_tons', label: 'Toneladas / Tons' },
              { key: 'kg', value: 'unit_kg', label: 'Kilogramos / Kilograms' },
              { key: 'bushels', value: 'unit_bushels', label: 'Bushels' },
              { key: 'cwt', value: 'unit_cwt', label: 'Quintales / Hundredweight' },
              { key: 'mt', value: 'unit_mt', label: 'Toneladas Métricas / Metric Tons' }
            ];
            
            // Helper function to find label by value
            const findLabel = (options: any[], value: string) => {
              const option = options.find((opt: any) => opt.value === value);
              return option ? option.label : '';
            };
            
            // Calculate threshold weights
            const quantity = formValues.quantity || 0;
            const minThresholdWeight = quantity - (quantity * formValues.min_thresholds_percentage / 100);
            const maxThresholdWeight = quantity + (quantity * formValues.max_thresholds_percentage / 100);
            
            // Process participants - add/replace seller in position 0
            let processedParticipants = [...formValues.participants];
            if (formValues.seller) {
              const selectedSeller = FAKE_SELLERS.find(seller => seller.id === formValues.seller);
              if (selectedSeller) {
                const sellerParticipant = {
                  people_id: selectedSeller.id,
                  name: selectedSeller.name,
                  role: 'seller' as const
                };
                
                // Check if position 0 exists and has role 'seller', if so replace it
                if (processedParticipants.length > 0 && processedParticipants[0].role === 'seller') {
                  processedParticipants[0] = sellerParticipant;
                } else {
                  // Add seller at position 0
                  processedParticipants.unshift(sellerParticipant);
                }
              }
            }
            
            // Create enhanced debug object with calculated thresholds and names
            const debugData = {
              ...formValues,
              ...(formValues.folio && formValues.folio.trim() !== '' && { folio: formValues.folio }),
              commodity_name: findLabel(COMMODITY_OPTIONS, formValues.commodity_id),
              characteristics_configuration_name: findLabel(CHARACTERISTICS_CONFIG_OPTIONS, formValues.characteristics_configuration_id),
              measurement_unit_id: formValues.measurement_unit,
              measurement_unit: findLabel(MEASUREMENT_UNIT_OPTIONS, formValues.measurement_unit),
              participants: processedParticipants,
              thresholds: {
                min_thresholds_percentage: formValues.min_thresholds_percentage,
                min_thresholds_weight: minThresholdWeight,
                max_thresholds_percentage: formValues.max_thresholds_percentage,
                max_thresholds_weight: maxThresholdWeight
              }
            };
            
            // Remove folio if it's empty from the copy
            if (!formValues.folio || formValues.folio.trim() === '') {
              delete (debugData as any).folio;
            }
            
            console.log('🔍 Form Values Debug:', JSON.stringify(debugData, null, 2));
            console.log('📋 Form Values Object:', debugData);
          }}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          🔍 Debug JSON
        </button>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
            
            {/* Section 1: Contract Info */}
            <ContractInfoSection />

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
              addComment={addRemark}
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