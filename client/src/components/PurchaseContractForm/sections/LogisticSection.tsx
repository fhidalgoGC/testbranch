import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Truck } from 'lucide-react';
import type { PurchaseContractFormData, LogisticSchedule } from '@/types/purchaseContract.types';
import { APP_CONFIG, CURRENCY_OPTIONS, formatNumber, parseFormattedNumber, NUMBER_FORMAT_CONFIG } from '@/environment/environment';

// Standardized data structure for freight cost type field
const FREIGHT_COST_TYPE_OPTIONS = [
  { key: 'none', value: 'none', label: 'None' },
  { key: 'fixed', value: 'fixed', label: 'Fixed' },
  { key: 'variable', value: 'variable', label: 'Variable' }
];

// Standardized data structure for measurement units
const MEASUREMENT_UNIT_OPTIONS = [
  { key: 'tons', value: 'unit_tons', label: 'Toneladas / Tons' },
  { key: 'kg', value: 'unit_kg', label: 'Kilogramos / Kilograms' },
  { key: 'bushels', value: 'unit_bushels', label: 'Bushels' },
  { key: 'cwt', value: 'unit_cwt', label: 'Quintales / Hundredweight' },
  { key: 'mt', value: 'unit_mt', label: 'Toneladas Métricas / Metric Tons' }
];

interface LogisticSectionProps {
  addLogisticSchedule: () => void;
  removeLogisticSchedule: (index: number) => void;
  updateLogisticSchedule: (index: number, field: string, value: any) => void;
}

export function LogisticSection({ 
  addLogisticSchedule, 
  removeLogisticSchedule, 
  updateLogisticSchedule 
}: LogisticSectionProps) {
  const { t } = useTranslation();
  const { formState: { errors }, watch, setValue, control } = useFormContext<PurchaseContractFormData>();
  
  const logisticSchedule = watch('logistic_schedule') || [];
  const currentSchedule = logisticSchedule[0] || {};

  // Watch para lógica condicional basada en state
  const watchedFreightCostType = watch('logistic_schedule.0.freight_cost.type');

  // Use centralized number formatting from environment configuration

  // Helper function to handle number input change with environment configuration
  const handleFreightNumberChange = (field: 'cost' | 'min' | 'max', inputValue: string) => {
    const { decimalSeparator, thousandsSeparator } = NUMBER_FORMAT_CONFIG;
    
    // Allow numbers, decimal separator, and thousands separator
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const validCharsPattern = new RegExp(`^[0-9${escapeRegExp(decimalSeparator)}${escapeRegExp(thousandsSeparator)}]*$`);
    
    if (!validCharsPattern.test(inputValue)) {
      return; // Reject invalid characters
    }
    
    // Parse the value using the environment configuration
    const numericValue = parseFormattedNumber(inputValue) || 0;
    
    const currentLogisticSchedule = watch('logistic_schedule') || [{}];
    const updatedSchedule = [...currentLogisticSchedule];
    updatedSchedule[0] = { 
      ...updatedSchedule[0], 
      freight_cost: { 
        ...updatedSchedule[0].freight_cost, 
        [field]: numericValue 
      }
    };
    setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
  };

  // Helper function to format number on blur using environment configuration
  const handleFreightNumberBlur = (field: 'cost' | 'min' | 'max', e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseFormattedNumber(e.target.value) || 0;
    
    // Format using environment configuration
    const formatted = formatNumber(value);
    
    e.target.value = formatted;
    
    const currentLogisticSchedule = watch('logistic_schedule') || [{}];
    const updatedSchedule = [...currentLogisticSchedule];
    updatedSchedule[0] = { 
      ...updatedSchedule[0], 
      freight_cost: { 
        ...updatedSchedule[0].freight_cost, 
        [field]: value 
      }
    };
    setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Truck className="w-5 h-5" />
          {t('logisticContract')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logistic Schedule Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Responsibility */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('paymentResponsibility')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.logistic_payment_responsability || ''}
                onValueChange={(value) => {
                  const currentLogisticSchedule = watch('logistic_schedule') || [{}];
                  const updatedSchedule = [...currentLogisticSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], logistic_payment_responsability: value as any };
                  setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.logistic_schedule?.[0]?.logistic_payment_responsability ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.logistic_schedule?.[0]?.logistic_payment_responsability && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.logistic_schedule[0].logistic_payment_responsability.message}</p>
              )}
            </div>

            {/* Coordination Responsibility */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('coordinationResponsibility')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.logistic_coordination_responsability || ''}
                onValueChange={(value) => {
                  const currentLogisticSchedule = watch('logistic_schedule') || [{}];
                  const updatedSchedule = [...currentLogisticSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], logistic_coordination_responsability: value as any };
                  setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.logistic_schedule?.[0]?.logistic_coordination_responsability ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.logistic_schedule?.[0]?.logistic_coordination_responsability && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.logistic_schedule[0].logistic_coordination_responsability.message}</p>
              )}
            </div>

            {/* Payment Currency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('paymentCurrency')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.payment_currency || APP_CONFIG.defaultCurrency}
                onValueChange={(value) => {
                  const currentLogisticSchedule = watch('logistic_schedule') || [{}];
                  const updatedSchedule = [...currentLogisticSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], payment_currency: value as any };
                  setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.logistic_schedule?.[0]?.payment_currency ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.key} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.logistic_schedule?.[0]?.payment_currency && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.logistic_schedule[0].payment_currency.message}</p>
              )}
            </div>

            {/* Freight Cost Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('freightCostType')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.freight_cost?.type || 'none'}
                onValueChange={(value) => {
                  const currentLogisticSchedule = watch('logistic_schedule') || [{}];
                  const updatedSchedule = [...currentLogisticSchedule];
                  
                  // Reset freight_cost fields based on selected type
                  let freightCost = {
                    type: value as any,
                    cost: 0,
                    min: 0,
                    max: 0
                  };
                  
                  // Clear measurement unit fields when type is 'none'
                  if (value === 'none') {
                    updatedSchedule[0] = { 
                      ...updatedSchedule[0], 
                      freight_cost: freightCost,
                      freight_cost_measurement_unit_id: '',
                      freight_cost_measurement_unit: ''
                    };
                  } else {
                    updatedSchedule[0] = { 
                      ...updatedSchedule[0], 
                      freight_cost: freightCost
                    };
                  }
                  setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.logistic_schedule?.[0]?.freight_cost?.type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {FREIGHT_COST_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.logistic_schedule?.[0]?.freight_cost?.type && (
                <p className="text-sm text-red-600 dark:text-red-400">{typeof errors.logistic_schedule[0].freight_cost.type === 'object' ? (errors.logistic_schedule[0].freight_cost.type as any).message : String(errors.logistic_schedule[0].freight_cost.type)}</p>
              )}
            </div>
          </div>

          {/* Freight Cost Fields - Conditional based on state value */}
          {watchedFreightCostType && watchedFreightCostType !== 'none' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column - Cost Fields */}
              <div className="space-y-4">
                {/* Cost - Only show for 'fixed' type based on state */}
                {watchedFreightCostType === 'fixed' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('freightCost')}
                    </Label>
                    <Input
                      key={`cost-${currentSchedule.freight_cost?.type || 'none'}`}
                      type="text"
                      inputMode="decimal"
                      defaultValue={currentSchedule.freight_cost?.cost ? formatNumber(currentSchedule.freight_cost.cost) : ""}
                      onChange={(e) => handleFreightNumberChange('cost', e.target.value)}
                      onBlur={(e) => handleFreightNumberBlur('cost', e)}
                      onKeyDown={(e) => {
                        // Allow numbers, decimal separator, thousands separator and navigation keys
                        const { decimalSeparator, thousandsSeparator } = NUMBER_FORMAT_CONFIG;
                        const allowedKeys = ['0','1','2','3','4','5','6','7','8','9',decimalSeparator,thousandsSeparator,'Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className={`h-10 ${errors.logistic_schedule?.[0]?.freight_cost?.cost ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                      placeholder="0.00"
                      style={{
                        MozAppearance: 'textfield'
                      }}
                    />
                  </div>
                )}

                {/* Min and Max - Only show for 'variable' type based on state */}
                {watchedFreightCostType === 'variable' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Freight Min Cost
                      </Label>
                      <Input
                        key={`min-${currentSchedule.freight_cost?.type || 'none'}`}
                        type="text"
                        inputMode="decimal"
                        defaultValue={currentSchedule.freight_cost?.min ? formatNumber(currentSchedule.freight_cost.min) : ""}
                        onChange={(e) => handleFreightNumberChange('min', e.target.value)}
                        onBlur={(e) => handleFreightNumberBlur('min', e)}
                        onKeyDown={(e) => {
                          // Allow numbers, decimal separator, thousands separator and navigation keys
                          const { decimalSeparator, thousandsSeparator } = NUMBER_FORMAT_CONFIG;
                          const allowedKeys = ['0','1','2','3','4','5','6','7','8','9',decimalSeparator,thousandsSeparator,'Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                          if (!allowedKeys.includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className={`h-10 ${errors.logistic_schedule?.[0]?.freight_cost?.min ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                        placeholder="0.00"
                        style={{
                          MozAppearance: 'textfield'
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Freight Max Cost
                      </Label>
                      <Input
                        key={`max-${currentSchedule.freight_cost?.type || 'none'}`}
                        type="text"
                        inputMode="decimal"
                        defaultValue={currentSchedule.freight_cost?.max ? formatNumber(currentSchedule.freight_cost.max) : ""}
                        onChange={(e) => handleFreightNumberChange('max', e.target.value)}
                        onBlur={(e) => handleFreightNumberBlur('max', e)}
                        onKeyDown={(e) => {
                          // Allow numbers, decimal separator, thousands separator and navigation keys
                          const { decimalSeparator, thousandsSeparator } = NUMBER_FORMAT_CONFIG;
                          const allowedKeys = ['0','1','2','3','4','5','6','7','8','9',decimalSeparator,thousandsSeparator,'Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                          if (!allowedKeys.includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className={`h-10 ${errors.logistic_schedule?.[0]?.freight_cost?.max ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                        placeholder="0.00"
                        style={{
                          MozAppearance: 'textfield'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Measurement Unit */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('measurementUnit')}
                </Label>
                <Select
                  value={currentSchedule.freight_cost_measurement_unit_id || ''}
                  onValueChange={(value) => {
                    const currentLogisticSchedule = watch('logistic_schedule') || [{}];
                    const updatedSchedule = [...currentLogisticSchedule];
                    
                    // Find the selected option to get both ID and value
                    const selectedOption = MEASUREMENT_UNIT_OPTIONS.find(option => option.value === value);
                    
                    updatedSchedule[0] = { 
                      ...updatedSchedule[0], 
                      freight_cost_measurement_unit_id: value,
                      freight_cost_measurement_unit: selectedOption?.label || ''
                    };
                    setValue('logistic_schedule', updatedSchedule, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className={`h-10 ${errors.logistic_schedule?.[0]?.freight_cost_measurement_unit ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                    <SelectValue placeholder="Select measurement unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEASUREMENT_UNIT_OPTIONS.map((option) => (
                      <SelectItem key={option.key} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.logistic_schedule?.[0]?.freight_cost_measurement_unit && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.logistic_schedule[0].freight_cost_measurement_unit.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}