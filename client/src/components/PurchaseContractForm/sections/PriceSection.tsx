import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import type { PurchaseContractFormData, PriceSchedule } from '@/types/purchaseContract.types';

interface PriceSectionProps {
  addPriceSchedule: () => void;
  removePriceSchedule: (index: number) => void;
  updatePriceSchedule: (index: number, field: keyof PriceSchedule, value: any) => void;
}

export function PriceSection({ 
  addPriceSchedule, 
  removePriceSchedule, 
  updatePriceSchedule 
}: PriceSectionProps) {
  const { t } = useTranslation();
  const { formState: { errors }, watch, setValue } = useFormContext<PurchaseContractFormData>();
  
  const priceSchedule = watch('price_schedule') || [];
  const currentSchedule = priceSchedule[0] || {};

  // Helper function to format number for display (2-4 decimals)
  const formatNumber = (value: number | undefined): string => {
    if (!value || value === 0) return '';
    
    // Determine how many decimal places to show
    const decimalString = value.toString().split('.')[1] || '';
    const decimalPlaces = Math.min(Math.max(decimalString.length, 2), 4);
    
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimalPlaces
    });
  };

  // Helper function to handle number input change with strict validation
  const handleNumberChange = (field: keyof PriceSchedule, inputValue: string) => {
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
    
    // Check decimal places limit (max 4)
    const parts = inputValue.split('.');
    if (parts[1] && parts[1].length > 4) {
      // Truncate to 4 decimals (round down)
      const truncated = parts[0] + '.' + parts[1].substring(0, 4);
      const numericValue = parseFloat(truncated);
      
      const currentPriceSchedule = watch('price_schedule') || [{}];
      const updatedSchedule = [...currentPriceSchedule];
      updatedSchedule[0] = { ...updatedSchedule[0], [field]: numericValue };
      setValue('price_schedule', updatedSchedule, { shouldValidate: true });
      return;
    }
    
    // Allow empty string or valid number format
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      const numericValue = inputValue === '' ? 0 : parseFloat(inputValue);
      
      const currentPriceSchedule = watch('price_schedule') || [{}];
      const updatedSchedule = [...currentPriceSchedule];
      updatedSchedule[0] = { ...updatedSchedule[0], [field]: numericValue };
      setValue('price_schedule', updatedSchedule, { shouldValidate: true });
    }
  };

  // Helper function to format number on blur
  const handleNumberBlur = (field: keyof PriceSchedule, e: React.FocusEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value.replace(/,/g, '')) || 0;
    
    // Truncate to 4 decimals (round down)
    const factor = Math.pow(10, 4);
    value = Math.floor(value * factor) / factor;
    
    // Determine how many decimal places to show (2-4)
    const decimalString = value.toString().split('.')[1] || '';
    const decimalPlaces = Math.min(Math.max(decimalString.length, 2), 4);
    
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimalPlaces
    });
    
    e.target.value = formatted;
    
    const currentPriceSchedule = watch('price_schedule') || [{}];
    const updatedSchedule = [...currentPriceSchedule];
    updatedSchedule[0] = { ...updatedSchedule[0], [field]: value };
    setValue('price_schedule', updatedSchedule, { shouldValidate: true });
  };

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <DollarSign className="w-5 h-5" />
          {t('priceContract')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Schedule Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pricing Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Pricing Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.pricing_type || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], pricing_type: value as 'fixed' | 'basis' };
                  setValue('price_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.pricing_type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select pricing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="basis">Basis</SelectItem>
                </SelectContent>
              </Select>
              {errors.price_schedule?.[0]?.pricing_type && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].pricing_type.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                defaultValue={formatNumber(currentSchedule.price)}
                onChange={(e) => handleNumberChange('price', e.target.value)}
                onBlur={(e) => handleNumberBlur('price', e)}
                onKeyDown={(e) => {
                  // Allow only numbers, decimal point, backspace, delete, tab, enter, arrow keys
                  const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                  if (!allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-10 ${errors.price_schedule?.[0]?.price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                placeholder="370.00"
                style={{
                  MozAppearance: 'textfield'
                }}
              />
              {errors.price_schedule?.[0]?.price && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].price.message}</p>
              )}
            </div>

            {/* Future Price */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Future Price <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                defaultValue={formatNumber(currentSchedule.future_price)}
                onChange={(e) => handleNumberChange('future_price', e.target.value)}
                onBlur={(e) => handleNumberBlur('future_price', e)}
                onKeyDown={(e) => {
                  const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                  if (!allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-10 ${errors.price_schedule?.[0]?.future_price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                placeholder="370.00"
                style={{
                  MozAppearance: 'textfield'
                }}
              />
              {errors.price_schedule?.[0]?.future_price && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].future_price.message}</p>
              )}
            </div>

            {/* Basis */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Basis
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                defaultValue={formatNumber(currentSchedule.basis)}
                onChange={(e) => handleNumberChange('basis', e.target.value)}
                onBlur={(e) => handleNumberBlur('basis', e)}
                onKeyDown={(e) => {
                  const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                  if (!allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="h-10 border-gray-300 focus:border-green-500"
                placeholder="0.00"
                style={{
                  MozAppearance: 'textfield'
                }}
              />
            </div>

            {/* Basis Operation */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Basis Operation
              </Label>
              <Select
                value={currentSchedule.basis_operation || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], basis_operation: value as 'add' | 'subtract' };
                  setValue('price_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add</SelectItem>
                  <SelectItem value="subtract">Subtract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Option Month */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Option Month <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.option_month || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], option_month: value };
                  setValue('price_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.option_month ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.price_schedule?.[0]?.option_month && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].option_month.message}</p>
              )}
            </div>

            {/* Option Year */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Option Year <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.option_year?.toString() || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], option_year: parseInt(value) };
                  setValue('price_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.option_year ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
              {errors.price_schedule?.[0]?.option_year && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].option_year.message}</p>
              )}
            </div>

            {/* Payment Currency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Payment Currency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.payment_currency || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], payment_currency: value as 'usd' | 'mxn' };
                  setValue('price_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.payment_currency ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="mxn">MXN</SelectItem>
                </SelectContent>
              </Select>
              {errors.price_schedule?.[0]?.payment_currency && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].payment_currency.message}</p>
              )}
            </div>

            {/* Exchange */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Exchange <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.exchange || ''}
                onValueChange={(value) => {
                  const currentPriceSchedule = watch('price_schedule') || [{}];
                  const updatedSchedule = [...currentPriceSchedule];
                  updatedSchedule[0] = { ...updatedSchedule[0], exchange: value };
                  setValue('price_schedule', updatedSchedule, { shouldValidate: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.price_schedule?.[0]?.exchange ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cbot">Chicago Board of Trade (CBOT)</SelectItem>
                  <SelectItem value="kcbt">Kansas City Board of Trade (KCBT)</SelectItem>
                  <SelectItem value="mgex">Minneapolis Grain Exchange (MGEX)</SelectItem>
                  <SelectItem value="ice">Intercontinental Exchange (ICE)</SelectItem>
                  <SelectItem value="nybot">New York Board of Trade (NYBOT)</SelectItem>
                  <SelectItem value="liffe">London International Financial Futures Exchange (LIFFE)</SelectItem>
                </SelectContent>
              </Select>
              {errors.price_schedule?.[0]?.exchange && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].exchange.message}</p>
              )}
            </div>
          </div>
        </div>

        {errors.price_schedule && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule.message}</p>
        )}
      </CardContent>
    </Card>
  );
}