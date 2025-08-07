import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, DollarSign, X } from 'lucide-react';
import type { PurchaseContractFormData, PriceSchedule } from '@/types/purchaseContract.types';
import { APP_CONFIG, CURRENCY_OPTIONS, formatNumber, parseFormattedNumber } from '@/environment/environment';

// Standardized exchange options
const EXCHANGE_OPTIONS = [
  {
    key: "chicagoBoardOfTrade",
    value: "Chicago Board of Trade",
    label: "Chicago Board of Trade"
  },
  {
    key: "kansasCityBoardOfTrade", 
    value: "Kansas City Board of Trade",
    label: "Kansas City Board of Trade"
  }
];

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

  // Use centralized number formatting from environment configuration

  // Helper function to handle number input change with format-aware validation
  const handleNumberChange = (field: keyof PriceSchedule, inputValue: string) => {
    // Use parseFormattedNumber to handle the input according to configured format
    const numericValue = parseFormattedNumber(inputValue);
    
    const currentPriceSchedule = watch('price_schedule') || [{}];
    const updatedSchedule = [...currentPriceSchedule];
    updatedSchedule[0] = { ...updatedSchedule[0], [field]: numericValue };
    setValue('price_schedule', updatedSchedule, { shouldValidate: true });
  };

  // Helper function to format number on blur using environment configuration
  const handleNumberBlur = (field: keyof PriceSchedule, e: React.FocusEvent<HTMLInputElement>) => {
    const inputVal = e.target.value.trim();
    
    if (inputVal === '') {
      e.target.value = '';
      const currentPriceSchedule = watch('price_schedule') || [{}];
      const updatedSchedule = [...currentPriceSchedule];
      updatedSchedule[0] = { ...updatedSchedule[0], [field]: null };
      setValue('price_schedule', updatedSchedule, { shouldValidate: true });
      return;
    }
    
    // Parse and format using environment configuration
    const numericValue = parseFormattedNumber(inputVal);
    if (numericValue !== null) {
      const formatted = formatNumber(numericValue);
      e.target.value = formatted;
      
      const currentPriceSchedule = watch('price_schedule') || [{}];
      const updatedSchedule = [...currentPriceSchedule];
      updatedSchedule[0] = { ...updatedSchedule[0], [field]: numericValue };
      setValue('price_schedule', updatedSchedule, { shouldValidate: true });
    }
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
          {/* Pricing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('pricingType')} <span className="text-red-500">*</span>
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
            </div>
          </div>

          {/* Pricing Type Error Row */}
          <div className="min-h-[20px]">
            {errors.price_schedule?.[0]?.pricing_type && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].pricing_type.message}</p>
            )}
          </div>

          {/* Two Column Price Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* First Column: Price Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                defaultValue={currentSchedule.price ? formatNumber(currentSchedule.price) : ''}
                onChange={(e) => handleNumberChange('price', e.target.value)}
                onBlur={(e) => handleNumberBlur('price', e)}
                onKeyDown={(e) => {
                  const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                  if (!allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`h-10 ${errors.price_schedule?.[0]?.price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                placeholder="0.00"
                style={{
                  MozAppearance: 'textfield'
                }}
              />
              {/* Price Error */}
              {errors.price_schedule?.[0]?.price && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].price.message}</p>
              )}
            </div>

            {/* Second Column: Basis Operation, Basis, and Futures in horizontal layout */}
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                {/* Basis Operation Button */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white opacity-0">
                    Op
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                    onClick={() => {
                      const currentPriceSchedule = watch('price_schedule') || [{}];
                      const updatedSchedule = [...currentPriceSchedule];
                      const currentOp = updatedSchedule[0].basis_operation || 'add';
                      updatedSchedule[0] = { ...updatedSchedule[0], basis_operation: currentOp === 'add' ? 'subtract' : 'add' };
                      setValue('price_schedule', updatedSchedule, { shouldValidate: true });
                    }}
                  >
                    {currentSchedule.basis_operation === 'subtract' ? '-' : '+'}
                  </Button>
                </div>

                {/* Basis Field */}
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Basis <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    defaultValue={currentSchedule.basis ? formatNumber(currentSchedule.basis) : ''}
                    onChange={(e) => handleNumberChange('basis', e.target.value)}
                    onBlur={(e) => handleNumberBlur('basis', e)}
                    onKeyDown={(e) => {
                      const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                      if (!allowedKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={`h-10 ${errors.price_schedule?.[0]?.basis ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                    placeholder="0.00"
                    style={{
                      MozAppearance: 'textfield'
                    }}
                  />
                </div>

                {/* Future Price Field */}
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Futures <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    defaultValue={currentSchedule.future_price ? formatNumber(currentSchedule.future_price) : ''}
                    onChange={(e) => handleNumberChange('future_price', e.target.value)}
                    onBlur={(e) => handleNumberBlur('future_price', e)}
                    onKeyDown={(e) => {
                      const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                      if (!allowedKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={`h-10 ${errors.price_schedule?.[0]?.future_price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                    placeholder="0.00"
                    style={{
                      MozAppearance: 'textfield'
                    }}
                  />
                </div>
              </div>
              
              {/* Basis and Futures Errors aligned below their inputs */}
              <div className="flex gap-2">
                <div className="w-10"></div> {/* Spacer for button alignment */}
                <div className="flex-1">
                  {errors.price_schedule?.[0]?.basis && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].basis.message}</p>
                  )}
                </div>
                <div className="flex-1">
                  {errors.price_schedule?.[0]?.future_price && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].future_price.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
            </div>
          </div>

          {/* Option Month and Year Error Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[20px]">
            <div>
              {errors.price_schedule?.[0]?.option_month && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].option_month.message}</p>
              )}
            </div>
            <div>
              {errors.price_schedule?.[0]?.option_year && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].option_year.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Currency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Payment Currency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentSchedule.payment_currency || APP_CONFIG.defaultCurrency}
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
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.key} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {EXCHANGE_OPTIONS.map((exchange) => (
                    <SelectItem key={exchange.key} value={exchange.value}>
                      {exchange.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Currency and Exchange Error Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[20px]">
            <div>
              {errors.price_schedule?.[0]?.payment_currency && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].payment_currency.message}</p>
              )}
            </div>
            <div>
              {errors.price_schedule?.[0]?.exchange && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule[0].exchange.message}</p>
              )}
            </div>
          </div>

          {/* Price Schedule Level Error */}
          <div className="min-h-[20px]">
            {errors.price_schedule && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule.message}</p>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}