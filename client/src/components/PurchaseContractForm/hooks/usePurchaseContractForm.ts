import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { createPurchaseContractSchema } from '@/validation/purchaseContract.schema';
import type { PurchaseContractFormData, PurchaseContract, Participant, PriceSchedule, LogisticSchedule } from '@/types/purchaseContract.types';
import { APP_CONFIG } from '@/environment/environment';

export function usePurchaseContractForm() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create reactive resolver that updates when language changes
  const resolver = useMemo(() => {
    return zodResolver(createPurchaseContractSchema(t));
  }, [t]);

  const form = useForm<PurchaseContractFormData>({
    resolver,
    mode: 'onSubmit', // Only validate on submit, not immediately
    defaultValues: {
      folio: '',
      type: 'purchase',
      sub_type: '' as any,
      commodity_id: '',
      commodity_name: '',
      characteristics_configuration_id: '',
      characteristics_configuration_name: '',
      grade: 1,
      quantity: undefined,
      reference_number: '',
      measurement_unit_id: '',
      measurement_unit: '',
      contract_date: new Date().toISOString().split('T')[0],
      min_thresholds_percentage: 10,
      max_thresholds_percentage: 10,
      seller: '',
      participants: [],
      price_schedule: [{
        pricing_type: 'fixed',
        price: 0,
        basis: 0,
        basis_operation: 'add',
        future_price: 0,
        option_month: '',
        option_year: new Date().getFullYear(),
        payment_currency: APP_CONFIG.defaultCurrency as any,
        exchange: '',
      }],
      logistic_schedule: [{
        logistic_payment_responsability: '' as any,
        logistic_coordination_responsability: '' as any,
        freight_cost: {
          type: 'none',
          min: 0,
          max: 0,
          cost: 0,
        },
        payment_currency: APP_CONFIG.defaultCurrency as any,
      }],
      shipping_start_date: new Date().toISOString().split('T')[0],
      shipping_end_date: new Date().toISOString().split('T')[0],
      application_priority: 1,
      delivered: '',
      transport: '',
      weights: '',
      inspections: '',
      proteins: '',
      remarks: [],
    },
  });

  // Update validation messages when language changes
  useEffect(() => {
    // Only revalidate if form has been touched to avoid showing errors on initial load
    if (form.formState.isSubmitted || Object.keys(form.formState.touchedFields).length > 0) {
      form.trigger();
    }
  }, [t, form]);

  // Participant management
  const addParticipant = () => {
    const currentParticipants = form.getValues('participants');
    const newParticipant: Participant = {
      people_id: '',
      name: '',
      role: 'buyer',
    };
    form.setValue('participants', [...currentParticipants, newParticipant], { shouldValidate: true });
  };

  const removeParticipant = (index: number) => {
    const currentParticipants = form.getValues('participants');
    const updatedParticipants = currentParticipants.filter((_, i) => i !== index);
    form.setValue('participants', updatedParticipants, { shouldValidate: true });
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const currentParticipants = form.getValues('participants');
    const updatedParticipants = currentParticipants.map((participant, i) =>
      i === index ? { ...participant, [field]: value } : participant
    );
    form.setValue('participants', updatedParticipants, { shouldValidate: true });
  };

  // Price Schedule management
  const addPriceSchedule = () => {
    const currentSchedule = form.getValues('price_schedule');
    const newSchedule: PriceSchedule = {
      pricing_type: 'fixed',
      price: null as any,
      basis: null as any,
      basis_operation: 'add',
      future_price: null as any,
      option_month: '',
      option_year: new Date().getFullYear(),
      payment_currency: APP_CONFIG.defaultCurrency as any,
      exchange: '',
    };
    form.setValue('price_schedule', [...currentSchedule, newSchedule], { shouldValidate: true });
  };

  const removePriceSchedule = (index: number) => {
    const currentSchedule = form.getValues('price_schedule');
    const updatedSchedule = currentSchedule.filter((_, i) => i !== index);
    form.setValue('price_schedule', updatedSchedule, { shouldValidate: true });
  };

  const updatePriceSchedule = (index: number, field: keyof PriceSchedule, value: any) => {
    const currentSchedule = form.getValues('price_schedule');
    const updatedSchedule = currentSchedule.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    );
    form.setValue('price_schedule', updatedSchedule, { shouldValidate: true });
  };

  // Logistic Schedule management
  const addLogisticSchedule = () => {
    const currentSchedule = form.getValues('logistic_schedule');
    const newSchedule: LogisticSchedule = {
      logistic_payment_responsability: '' as any,
      logistic_coordination_responsability: '' as any,
      freight_cost: {
        type: 'none',
        min: 0,
        max: 0,
        cost: 0,
      },
      payment_currency: APP_CONFIG.defaultCurrency as any,
    };
    form.setValue('logistic_schedule', [...currentSchedule, newSchedule], { shouldValidate: true });
  };

  const removeLogisticSchedule = (index: number) => {
    const currentSchedule = form.getValues('logistic_schedule');
    const updatedSchedule = currentSchedule.filter((_, i) => i !== index);
    form.setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
  };

  const updateLogisticSchedule = (index: number, field: string, value: any) => {
    const currentSchedule = form.getValues('logistic_schedule');
    const updatedSchedule = currentSchedule.map((schedule, i) => {
      if (i === index) {
        if (field.startsWith('freight_cost.')) {
          const freightField = field.split('.')[1];
          return {
            ...schedule,
            freight_cost: {
              ...schedule.freight_cost,
              [freightField]: value,
            },
          };
        }
        return { ...schedule, [field]: value };
      }
      return schedule;
    });
    form.setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
  };

  // Remarks management
  const addRemark = () => {
    const currentRemarks = form.getValues('remarks');
    form.setValue('remarks', [...currentRemarks, ''], { shouldValidate: true });
  };

  const removeRemark = (index: number) => {
    const currentRemarks = form.getValues('remarks');
    const updatedRemarks = currentRemarks.filter((_, i) => i !== index);
    form.setValue('remarks', updatedRemarks, { shouldValidate: true });
  };

  const updateRemark = (index: number, value: string) => {
    const currentRemarks = form.getValues('remarks');
    const updatedRemarks = currentRemarks.map((remark, i) =>
      i === index ? value : remark
    );
    form.setValue('remarks', updatedRemarks, { shouldValidate: true });
  };

  // Generate final JSON
  const generateContractJSON = (formData: PurchaseContractFormData): PurchaseContract => {
    const partitionKey = localStorage.getItem('partition_key') || '';
    const userId = localStorage.getItem('user_id') || '';
    
    // Fake sellers data (same as in ContractInfoSection)
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
    
    // Define options arrays to find labels
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
      const option = options.find(opt => opt.value === value);
      return option ? option.label : '';
    };
    
    // Process participants - add/replace seller in position 0
    let processedParticipants = [...formData.participants];
    if (formData.seller) {
      const selectedSeller = FAKE_SELLERS.find(seller => seller.id === formData.seller);
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
    
    // Calculate thresholds weights based on quantity and percentages
    const minThresholdWeight = formData.quantity - (formData.quantity * formData.min_thresholds_percentage / 100);
    const maxThresholdWeight = formData.quantity + (formData.quantity * formData.max_thresholds_percentage / 100);

    // Calculate inventory values (simplified calculation)
    const totalValue = formData.quantity * (formData.price_schedule[0]?.price || 0);

    const contractJSON: PurchaseContract = {
      _partitionKey: partitionKey,
      active: true,
      created_by: userId,
      created_at: new Date().toISOString(),
      folio: formData.folio,
      type: 'purchase',
      sub_type: formData.sub_type,
      commodity: {
        commodity_id: formData.commodity_id,
        name: findLabel(COMMODITY_OPTIONS, formData.commodity_id),
      },
      characteristics: {
        configuration_id: formData.characteristics_configuration_id,
        configuration_name: findLabel(CHARACTERISTICS_CONFIG_OPTIONS, formData.characteristics_configuration_id),
      },
      grade: formData.grade,
      participants: processedParticipants,
      price_schedule: formData.price_schedule,
      logistic_schedule: formData.logistic_schedule,
      inventory: {
        total: formData.quantity,
        open: 0,
        fixed: formData.quantity,
        unsettled: formData.quantity,
        settled: 0,
        reserved: 0,
      },
      inventory_value: {
        total: totalValue,
        open: 0,
        fixed: totalValue,
        unsettled: totalValue,
        settled: 0,
      },
      quantity: formData.quantity,
      reference_number: formData.reference_number,
      measurement_unit_id: formData.measurement_unit,
      measurement_unit: findLabel(MEASUREMENT_UNIT_OPTIONS, formData.measurement_unit),
      shipping_start_date: new Date(formData.shipping_start_date).toISOString(),
      shipping_end_date: new Date(formData.shipping_end_date).toISOString(),
      application_priority: formData.application_priority,
      delivered: formData.delivered,
      transport: formData.transport,
      weights: formData.weights,
      inspections: formData.inspections,
      proteins: formData.proteins,
      purchase_orders: [],
      thresholds: {
        min_thresholds_percentage: formData.min_thresholds_percentage,
        min_thresholds_weight: minThresholdWeight,
        max_thresholds_percentage: formData.max_thresholds_percentage,
        max_thresholds_weight: maxThresholdWeight,
      },
      status: 'created',
      contract_date: new Date(formData.contract_date).toISOString(),
      extras: [],
      externals: [],
      schedule: [],
      sub_contracts: [],
      notes: [],
      remarks: formData.remarks.filter(remark => remark.trim() !== ''),
    };

    return contractJSON;
  };

  const onSubmit = async (data: PurchaseContractFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Form validation passed');
      
      const contractJSON = generateContractJSON(data);
      console.log('Generated Contract JSON:', JSON.stringify(contractJSON, null, 2));
      
      // Here you would typically send the JSON to your API
      // await createPurchaseContract(contractJSON);
      
      alert('Contrato creado exitosamente!\nRevisa la consola para ver el JSON generado.');
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Error al crear el contrato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCancel = () => {
    form.reset();
  };

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit as any),
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
  };
}