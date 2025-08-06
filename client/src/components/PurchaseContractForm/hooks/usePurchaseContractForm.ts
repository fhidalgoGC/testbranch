import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { createPurchaseContractSchema } from '@/validation/purchaseContract.schema';
import type { PurchaseContractFormData, PurchaseContract, Participant, PriceSchedule, LogisticSchedule } from '@/types/purchaseContract.types';

export function usePurchaseContractForm() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PurchaseContractFormData>({
    resolver: zodResolver(createPurchaseContractSchema()),
    defaultValues: {
      folio: '',
      type: 'purchase',
      sub_type: 'imported',
      commodity_id: '',
      commodity_name: '',
      characteristics_configuration_id: '',
      characteristics_configuration_name: '',
      grade: 1,
      quantity: 0,
      reference_number: '',
      measurement_unit_id: '',
      measurement_unit: '',
      contract_date: new Date().toISOString().split('T')[0],
      participants: [],
      price_schedule: [],
      logistic_schedule: [],
      shipping_start_date: '',
      shipping_end_date: '',
      application_priority: 1,
      delivered: '',
      transport: '',
      weights: '',
      inspections: '',
      proteins: '',
      min_thresholds_percentage: 10,
      max_thresholds_percentage: 10,
      remarks: [],
    },
  });

  // Participant management
  const addParticipant = () => {
    const currentParticipants = form.getValues('participants');
    const newParticipant: Participant = {
      people_id: '',
      name: '',
      role: 'buyer',
    };
    form.setValue('participants', [...currentParticipants, newParticipant]);
  };

  const removeParticipant = (index: number) => {
    const currentParticipants = form.getValues('participants');
    const updatedParticipants = currentParticipants.filter((_, i) => i !== index);
    form.setValue('participants', updatedParticipants);
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const currentParticipants = form.getValues('participants');
    const updatedParticipants = currentParticipants.map((participant, i) =>
      i === index ? { ...participant, [field]: value } : participant
    );
    form.setValue('participants', updatedParticipants);
  };

  // Price Schedule management
  const addPriceSchedule = () => {
    const currentSchedule = form.getValues('price_schedule');
    const newSchedule: PriceSchedule = {
      pricing_type: 'fixed',
      price: 0,
      basis: 0,
      basis_operation: 'add',
      future_price: 0,
      option_month: '',
      option_year: new Date().getFullYear(),
      payment_currency: 'usd',
      exchange: '',
    };
    form.setValue('price_schedule', [...currentSchedule, newSchedule]);
  };

  const removePriceSchedule = (index: number) => {
    const currentSchedule = form.getValues('price_schedule');
    const updatedSchedule = currentSchedule.filter((_, i) => i !== index);
    form.setValue('price_schedule', updatedSchedule);
  };

  const updatePriceSchedule = (index: number, field: keyof PriceSchedule, value: any) => {
    const currentSchedule = form.getValues('price_schedule');
    const updatedSchedule = currentSchedule.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    );
    form.setValue('price_schedule', updatedSchedule);
  };

  // Logistic Schedule management
  const addLogisticSchedule = () => {
    const currentSchedule = form.getValues('logistic_schedule');
    const newSchedule: LogisticSchedule = {
      logistic_payment_responsability: 'other',
      logistic_coordination_responsability: 'other',
      freight_cost: {
        type: 'none',
        min: 0,
        max: 0,
        cost: 0,
      },
      payment_currency: 'usd',
    };
    form.setValue('logistic_schedule', [...currentSchedule, newSchedule]);
  };

  const removeLogisticSchedule = (index: number) => {
    const currentSchedule = form.getValues('logistic_schedule');
    const updatedSchedule = currentSchedule.filter((_, i) => i !== index);
    form.setValue('logistic_schedule', updatedSchedule);
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
    form.setValue('logistic_schedule', updatedSchedule);
  };

  // Remarks management
  const addRemark = () => {
    const currentRemarks = form.getValues('remarks');
    form.setValue('remarks', [...currentRemarks, '']);
  };

  const removeRemark = (index: number) => {
    const currentRemarks = form.getValues('remarks');
    const updatedRemarks = currentRemarks.filter((_, i) => i !== index);
    form.setValue('remarks', updatedRemarks);
  };

  const updateRemark = (index: number, value: string) => {
    const currentRemarks = form.getValues('remarks');
    const updatedRemarks = currentRemarks.map((remark, i) =>
      i === index ? value : remark
    );
    form.setValue('remarks', updatedRemarks);
  };

  // Generate final JSON
  const generateContractJSON = (formData: PurchaseContractFormData): PurchaseContract => {
    const partitionKey = localStorage.getItem('partition_key') || '';
    const userId = localStorage.getItem('user_id') || '';
    
    // Calculate thresholds weights based on quantity and percentages
    const minThresholdWeight = formData.quantity * (1 - formData.min_thresholds_percentage / 100);
    const maxThresholdWeight = formData.quantity * (1 + formData.max_thresholds_percentage / 100);

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
        name: formData.commodity_name,
      },
      characteristics: {
        configuration_id: formData.characteristics_configuration_id,
        configuration_name: formData.characteristics_configuration_name,
      },
      grade: formData.grade,
      participants: formData.participants,
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
      measurement_unit_id: formData.measurement_unit_id,
      measurement_unit: formData.measurement_unit,
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
    onSubmit: form.handleSubmit(onSubmit),
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