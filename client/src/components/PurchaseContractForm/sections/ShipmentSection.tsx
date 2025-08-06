import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import type { PurchaseContractFormData } from '@/types/purchaseContract.types';

export function ShipmentSection() {
  const { t } = useTranslation();
  const { register, formState: { errors }, watch, setValue } = useFormContext<PurchaseContractFormData>();

  // Helper function to handle threshold validation (0-100)
  const handleThresholdChange = (field: 'min_thresholds_percentage' | 'max_thresholds_percentage', inputValue: string) => {
    // Only allow numbers and one decimal point
    const validChars = /^[0-9.]*$/;
    
    if (!validChars.test(inputValue)) {
      return; // Reject invalid characters
    }
    
    // Prevent multiple decimal points
    const decimalCount = (inputValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }
    
    // Allow empty string or valid number format
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      let numericValue = inputValue === '' ? 0 : parseFloat(inputValue);
      
      // Limit to 0-100 range
      if (numericValue > 100) {
        numericValue = 100;
      } else if (numericValue < 0) {
        numericValue = 0;
      }
      
      setValue(field, numericValue);
    }
  };

  // Helper function to format threshold on blur (0-100 with 2 decimals)
  const handleThresholdBlur = (field: 'min_thresholds_percentage' | 'max_thresholds_percentage', e: React.FocusEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value.replace(/,/g, '')) || 0;
    
    // Ensure value is within 0-100 range
    if (value > 100) value = 100;
    if (value < 0) value = 0;
    
    // Format with 2 decimal places
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    e.target.value = formatted;
    setValue(field, value);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Package className="w-5 h-5" />
          {t('shipment')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shipping_start_date" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('shippingStartDate')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <DatePicker
              id="shipping_start_date"
              value={watch('shipping_start_date')}
              onChange={(date) => setValue('shipping_start_date', date)}
              placeholder={t('shippingStartDate')}
              error={!!errors.shipping_start_date}
            />
            {errors.shipping_start_date && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.shipping_start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_end_date" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('shippingEndDate')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <DatePicker
              id="shipping_end_date"
              value={watch('shipping_end_date')}
              onChange={(date) => setValue('shipping_end_date', date)}
              placeholder={t('shippingEndDate')}
              error={!!errors.shipping_end_date}
            />
            {errors.shipping_end_date && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.shipping_end_date.message}</p>
            )}
          </div>
        </div>

        {/* Application Priority and Delivered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="application_priority" className="text-sm font-medium text-gray-900 dark:text-white">
              Application Priority <span className="text-red-500">*</span>
            </Label>
            <Input
              id="application_priority"
              type="number"
              min="1"
              max="10"
              {...register('application_priority', { valueAsNumber: true })}
              className={`h-10 ${errors.application_priority ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="1"
            />
            {errors.application_priority && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.application_priority.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivered" className="text-sm font-medium text-gray-900 dark:text-white">
              Delivered <span className="text-red-500">*</span>
            </Label>
            <Input
              id="delivered"
              {...register('delivered')}
              className={`h-10 ${errors.delivered ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="IMPORTER Progreso"
            />
            {errors.delivered && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.delivered.message}</p>
            )}
          </div>
        </div>

        {/* Transport and Weights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transport" className="text-sm font-medium text-gray-900 dark:text-white">
              Transport <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('transport')}
              onValueChange={(value) => setValue('transport', value)}
            >
              <SelectTrigger className={`h-10 ${errors.transport ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select transport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUS">Bus</SelectItem>
                <SelectItem value="TRUCK">Truck</SelectItem>
                <SelectItem value="SHIP">Ship</SelectItem>
                <SelectItem value="TRAIN">Train</SelectItem>
                <SelectItem value="PLANE">Plane</SelectItem>
              </SelectContent>
            </Select>
            {errors.transport && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.transport.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weights" className="text-sm font-medium text-gray-900 dark:text-white">
              Weights <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('weights')}
              onValueChange={(value) => setValue('weights', value)}
            >
              <SelectTrigger className={`h-10 ${errors.weights ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select weights" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notAppliance">Not Appliance</SelectItem>
                <SelectItem value="appliance">Appliance</SelectItem>
                <SelectItem value="required">Required</SelectItem>
              </SelectContent>
            </Select>
            {errors.weights && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.weights.message}</p>
            )}
          </div>
        </div>

        {/* Inspections and Proteins */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inspections" className="text-sm font-medium text-gray-900 dark:text-white">
              Inspections <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('inspections')}
              onValueChange={(value) => setValue('inspections', value)}
            >
              <SelectTrigger className={`h-10 ${errors.inspections ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select inspections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitCc">Submit CC</SelectItem>
                <SelectItem value="required">Required</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
                <SelectItem value="notRequired">Not Required</SelectItem>
              </SelectContent>
            </Select>
            {errors.inspections && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.inspections.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proteins" className="text-sm font-medium text-gray-900 dark:text-white">
              Proteins <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('proteins')}
              onValueChange={(value) => setValue('proteins', value)}
            >
              <SelectTrigger className={`h-10 ${errors.proteins ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select proteins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notAppliance">Not Appliance</SelectItem>
                <SelectItem value="appliance">Appliance</SelectItem>
                <SelectItem value="required">Required</SelectItem>
              </SelectContent>
            </Select>
            {errors.proteins && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.proteins.message}</p>
            )}
          </div>
        </div>

        {/* Thresholds */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">
            Thresholds
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_thresholds_percentage" className="text-sm font-medium text-gray-900 dark:text-white">
                Min Thresholds Percentage <span className="text-red-500">*</span>
              </Label>
              <Input
                id="min_thresholds_percentage"
                type="text"
                inputMode="decimal"
                defaultValue={watch('min_thresholds_percentage') ? watch('min_thresholds_percentage').toFixed(2) : ''}
                onChange={(e) => handleThresholdChange('min_thresholds_percentage', e.target.value)}
                onBlur={(e) => handleThresholdBlur('min_thresholds_percentage', e)}
                onKeyDown={(e) => {
                  const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                  if (!allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-10 ${errors.min_thresholds_percentage ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                placeholder="10.00"
                style={{
                  MozAppearance: 'textfield'
                }}
              />
              {errors.min_thresholds_percentage && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.min_thresholds_percentage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_thresholds_percentage" className="text-sm font-medium text-gray-900 dark:text-white">
                Max Thresholds Percentage <span className="text-red-500">*</span>
              </Label>
              <Input
                id="max_thresholds_percentage"
                type="text"
                inputMode="decimal"
                defaultValue={watch('max_thresholds_percentage') ? watch('max_thresholds_percentage').toFixed(2) : ''}
                onChange={(e) => handleThresholdChange('max_thresholds_percentage', e.target.value)}
                onBlur={(e) => handleThresholdBlur('max_thresholds_percentage', e)}
                onKeyDown={(e) => {
                  const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                  if (!allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-10 ${errors.max_thresholds_percentage ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                placeholder="10.00"
                style={{
                  MozAppearance: 'textfield'
                }}
              />
              {errors.max_thresholds_percentage && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.max_thresholds_percentage.message}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}