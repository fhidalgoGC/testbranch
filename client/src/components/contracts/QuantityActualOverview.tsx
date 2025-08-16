import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, Control, FieldErrors, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { FormattedNumberInput } from '@/components/PurchaseContractForm/components/FormattedNumberInput';
import { DatePicker } from '@/components/ui/datepicker';

interface MeasurementUnit {
  key: string;
  value: string;
  label: string;
  type: string;
}

interface ParentContractData {
  quantity?: number;
  measurement_unit?: string;
  inventory?: {
    open?: number;
    total?: number;
  };
  price_schedule?: Array<{
    option_month?: string;
    option_year?: number;
  }>;
  contract_date?: string;
}

interface QuantityActualOverviewProps {
  // Form control props
  control: Control<any>;
  errors: FieldErrors<any>;
  setValue: (name: string, value: any) => void;
  
  // Data props
  parentContractData?: ParentContractData;
  contractData: {
    commodity: string;
  };
  measurementUnits: MeasurementUnit[];
  loadingUnits: boolean;
  unitsError: any;
  
  // Optional customization
  className?: string;
}

export function QuantityActualOverview({
  control,
  errors,
  setValue,
  parentContractData,
  contractData,
  measurementUnits,
  loadingUnits,
  unitsError,
  className = ''
}: QuantityActualOverviewProps) {
  const { t } = useTranslation();

  // Watch future and basis values to calculate price automatically
  const watchedFuture = useWatch({ control, name: 'future' });
  const watchedBasis = useWatch({ control, name: 'basis' });

  // Calculate price whenever future or basis changes
  useEffect(() => {
    const future = watchedFuture || 0;
    const basis = watchedBasis || 0;
    const calculatedPrice = future + basis;
    
    setValue('price', calculatedPrice);
    console.log('💰 Price calculated:', { future, basis, calculatedPrice });
  }, [watchedFuture, watchedBasis, setValue]);

  return (
    <Card className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>{t('createSubContract.quantityActualOverview')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        
        {/* Circular Progress */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            {(() => {
              // Calculate open inventory percentage
              const totalQuantity = parentContractData?.quantity || 1400;
              const openInventory = parentContractData?.inventory?.open || 0;
              const openPercentage = totalQuantity > 0 ? (openInventory / totalQuantity) * 100 : 0;
              const strokeDasharray = `${openPercentage}, 100`;
              
              // Debug inventory calculation
              console.log('🔵 Inventory Debug:', {
                totalQuantity,
                openInventory,
                openPercentage: openPercentage.toFixed(2) + '%',
                inventoryTotal: parentContractData?.inventory?.total,
                inventory: parentContractData?.inventory
              });
              
              return (
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle - used inventory in amber */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-amber-400 dark:text-amber-500"
                  />
                  {/* Progress circle showing open inventory in rose */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={strokeDasharray}
                    className="text-rose-500 dark:text-rose-400"
                  />
                </svg>
              );
            })()}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-rose-500 dark:text-rose-400">{t('createSubContract.open')}</span>
              <span className="text-sm font-bold text-rose-500 dark:text-rose-400">
                {(parentContractData?.inventory?.open || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Commodity Badge */}
        <div className="text-center mb-6">
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm px-3 py-1">
            {contractData.commodity} {parentContractData?.price_schedule?.[0]?.option_month} {parentContractData?.price_schedule?.[0]?.option_year}
          </Badge>
        </div>

        {/* Future and Basis Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Future Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('createSubContract.future')}
              </label>
              <Controller
                name="future"
                control={control}
                render={({ field }) => (
                  <FormattedNumberInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="0.00"
                    className="text-sm"
                    error={!!errors.future}
                  />
                )}
              />
              {errors.future && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.future.message as string}</p>
              )}
            </div>

            {/* Basis Field (Read-only) */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('createSubContract.basis')}
              </label>
              <Controller
                name="basis"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    value={(field.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    readOnly
                    className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed border-gray-200"
                    tabIndex={-1}
                  />
                )}
              />
            </div>
          </div>

          {/* Total Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('createSubContract.total')}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  {t('createSubContract.priceLabel')}
                </label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      value={(field.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      readOnly
                      className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed border-gray-200"
                      tabIndex={-1}
                    />
                  )}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  {t('createSubContract.date')} <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="totalDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('createSubContract.selectDate')}
                      className="text-sm"
                      error={!!errors.totalDate}
                      minDate={parentContractData?.contract_date ? new Date(parentContractData.contract_date) : new Date()}
                    />
                  )}
                />
                {errors.totalDate && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.totalDate.message as string}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  {t('createSubContract.quantity')} <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <FormattedNumberInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="0.00"
                      className="text-sm"
                      error={!!errors.quantity}
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.quantity.message as string}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  {t('createSubContract.measurementUnit')} <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="measurementUnitId"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={`text-sm ${errors.measurementUnitId ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                        <SelectValue placeholder={t('createSubContract.selectMeasurementUnit')} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingUnits ? (
                          <SelectItem value="loading" disabled>{t('createSubContract.loadingUnits')}</SelectItem>
                        ) : unitsError ? (
                          <SelectItem value="error" disabled>{t('createSubContract.errorLoadingUnits')}</SelectItem>
                        ) : measurementUnits.length === 0 ? (
                          <SelectItem value="empty" disabled>{t('createSubContract.noUnitsAvailable')}</SelectItem>
                        ) : (
                          measurementUnits.map((unit) => (
                            <SelectItem key={unit.key} value={unit.key}>
                              {unit.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.measurementUnitId && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.measurementUnitId.message as string}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}