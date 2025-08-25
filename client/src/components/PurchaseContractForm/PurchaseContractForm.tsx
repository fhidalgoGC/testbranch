import React, { useCallback, useState, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePurchaseContractForm } from './hooks/usePurchaseContractForm';
import { RootState } from '@/app/store';
import { updatePurchaseDraft, updateSaleDraft, clearPurchaseDraft, clearSaleDraft } from '@/features/contractDrafts/contractDraftsSlice';
import { PurchaseSaleContract } from '@/types/purchaseSaleContract.types';
import { ContractInfoSection } from './sections/ContractInfoSection';
import { PriceSection } from './sections/PriceSection';
import { LogisticSection } from './sections/LogisticSection';
import { AdjustmentsSection } from './sections/AdjustmentsSection';
import { ShipmentSection } from './sections/ShipmentSection';
import { RemarksSection } from './sections/RemarksSection';

export interface PurchaseContractFormProps {
  contractType: 'purchase' | 'sale';
  mode: 'create' | 'edit' | 'view';
  contractId?: string; // Para modo edit/view y create (generated ID)
  initialContract?: Partial<PurchaseSaleContract>; // Datos iniciales del contrato
  onSuccess?: () => void;
  onCancel?: () => void;
  onFormChange?: (data: Partial<PurchaseSaleContract>) => void;
}

export function PurchaseContractForm({ 
  contractType,
  mode,
  contractId,
  initialContract,
  onSuccess,
  onCancel: onCancelProp,
  onFormChange
}: PurchaseContractFormProps) {
  const dispatch = useDispatch();
  
  // Obtener draft del estado global (solo para modo create)
  const draft = useSelector((state: RootState) => 
    contractType === 'purchase' ? state.contractDrafts.purchaseDraft : state.contractDrafts.saleDraft
  );
  
  // Determinar datos iniciales según el modo
  const getInitialData = () => {
    if (mode === 'create') {
      // Para crear: usar draft del estado global o initialContract como fallback
      return draft || initialContract || {};
    } else {
      // Para edit/view: usar initialContract (viene de API)
      return initialContract || {};
    }
  };
  
  // Manejar success personalizado
  const handleSuccess = () => {
    // Limpiar draft si es modo create y el submit fue exitoso
    if (mode === 'create') {
      if (contractType === 'purchase') {
        dispatch(clearPurchaseDraft());
      } else {
        dispatch(clearSaleDraft());
      }
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };
  
  const { t } = useTranslation();
  
  // Primero declarar el hook (sin onFormChange - manejado abajo)
  const hookResult = usePurchaseContractForm({
    initialData: getInitialData(),
    contractType,
    mode,
    onFormChange: undefined, // Disabled - handled below
    onSuccess: handleSuccess,
    onCancel: onCancelProp,
  });
  
  const {
    form,
    isSubmitting,
    isResetting, // Estado observable del reset
    onSubmit,
    onCancel,
    generateContractJSON, // Add this for debug button
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
  } = hookResult;
  
  // Handle form watching and draft detection directly in component 
  useEffect(() => {
    if (mode !== 'create') return;

    // 1. Initial draft detection
    const currentValues = form.getValues();
    const hasInitialDraft = Object.keys(currentValues).some(key => {
      const value = (currentValues as any)[key];
      return value !== null && value !== undefined && value !== '' && 
             !(Array.isArray(value) && value.length === 0);
    });
    
    if (hasInitialDraft) {
      console.log('🎯 COMPONENTE: Detectado draft inicial, activando flag');
      // Update Redux
      if (contractType === 'purchase') {
        dispatch(updatePurchaseDraft(currentValues));
      } else {
        dispatch(updateSaleDraft(currentValues));
      }
      // Notify page (activate flag)
      if (onFormChange) {
        onFormChange(currentValues);
      }
    }

    // 2. Watch for subsequent changes  
    const subscription = form.watch((value, { name, type }) => {
      if (name && type === 'change') {
        console.log('🎯 COMPONENTE form.watch - campo cambiado:', name);
        
        // Update Redux
        if (contractType === 'purchase') {
          dispatch(updatePurchaseDraft(value));
        } else {
          dispatch(updateSaleDraft(value));
        }
        
        // Notify page (activate flag)
        if (onFormChange) {
          onFormChange(value);
        }
      }
    });

    return subscription.unsubscribe;
  }, [form, mode, contractType, dispatch, onFormChange]);

  // Generar títulos dinámicamente
  const getTitle = () => {
    if (mode === 'create') {
      return contractType === 'purchase' ? t('createPurchaseContract') : t('createSaleContract');
    } else if (mode === 'edit') {
      return contractType === 'purchase' ? t('editPurchaseContract') : t('editSaleContract');
    } else {
      return contractType === 'purchase' ? t('viewPurchaseContract') : t('viewSaleContract');
    }
  };

  // Generar texto del botón dinámicamente
  const getButtonText = () => {
    if (mode === 'create') {
      return contractType === 'purchase' ? t('createContract') : t('createSaleContract');
    } else {
      return t('saveChanges');
    }
  };

  // Detectar desmontaje del componente
  useEffect(() => {
    return () => {
      console.log('🔥 Componente: Desmontándose - flujo de cancel completado');
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header with title and debug button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getTitle()}
        </h1>
        {mode !== 'view' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const formValues = form.getValues();
                
                // Use the same function as Submit to generate the exact final JSON
                const finalJSON = generateContractJSON(formValues);
                
                console.log('🔍 DEBUG: Final JSON (same as Submit):', JSON.stringify(finalJSON, null, 2));
                console.log('📋 DEBUG: Final JSON Object:', finalJSON);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              🔍 Debug JSON
            </button>
            <button
              type="button"
              onClick={() => {
                const formValues = form.getValues();
                console.log('📄 FORM STATE (Raw):', JSON.stringify(formValues, null, 2));
                console.log('📊 FORM STATE Object:', formValues);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              📄 Form State
            </button>
          </div>
        )}
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

            {/* Section 4: Contract Adjustments */}
            <AdjustmentsSection />

            {/* Section 5: Shipment & Delivery */}
            <ShipmentSection />

            {/* Section 6: Remarks & Observation */}
            <RemarksSection
              addRemark={addRemark}
              removeRemark={removeRemark}
              updateRemark={updateRemark}
              addComment={addRemark}
            />

            {/* Form Actions */}
            {mode !== 'view' && (
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('🔴 BOTÓN CANCEL CLICKEADO - Usando onCancel del hook');
                    onCancel();
                  }}
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
                      {getButtonText()}...
                    </>
                  ) : (
                    getButtonText()
                  )}
                </Button>
              </div>
            )}
        </form>
      </FormProvider>
    </div>
  );
}