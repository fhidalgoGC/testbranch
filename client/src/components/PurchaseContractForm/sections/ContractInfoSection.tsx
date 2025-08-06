import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SellerSelectionModal } from '../modals/SellerSelectionModal';
import type { PurchaseContractFormData } from '@/types/purchaseContract.types';

export function ContractInfoSection() {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<PurchaseContractFormData>();

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          {t('contractInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Contract Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sub_type" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('subType')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Select
              value={watch('sub_type')}
              onValueChange={(value) => setValue('sub_type', value as 'imported' | 'domestic')}
            >
              <SelectTrigger className={`h-10 ${errors.sub_type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder={t('selectSubType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imported">{t('imported')}</SelectItem>
                <SelectItem value="domestic">{t('domestic')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.sub_type && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.sub_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('grade')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Input
              id="grade"
              type="number"
              min="1"
              max="10"
              {...register('grade', { valueAsNumber: true })}
              className={`h-10 ${errors.grade ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder={t('gradePlaceholder')}
            />
            {errors.grade && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.grade.message}</p>
            )}
          </div>


        </div>

        {/* Commodity and Configuration Selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commodity" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('commodity')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Select
              value={watch('commodity')}
              onValueChange={(value) => setValue('commodity', value)}
            >
              <SelectTrigger className={`h-10 ${errors.commodity ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder={t('selectCommodity')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6839ef25edc3c27f091bdfc0">Maíz / Corn</SelectItem>
                <SelectItem value="6839ef25edc3c27f091bdfc1">Soja / Soybean</SelectItem>
                <SelectItem value="6839ef25edc3c27f091bdfc2">Trigo / Wheat</SelectItem>
                <SelectItem value="6839ef25edc3c27f091bdfc3">Sorgo / Sorghum</SelectItem>
                <SelectItem value="6839ef25edc3c27f091bdfc4">Cebada / Barley</SelectItem>
              </SelectContent>
            </Select>
            {errors.commodity && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.commodity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="characteristics_configuration" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('characteristicsConfiguration')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Select
              value={watch('characteristics_configuration')}
              onValueChange={(value) => setValue('characteristics_configuration', value)}
            >
              <SelectTrigger className={`h-10 ${errors.characteristics_configuration ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder={t('selectConfiguration')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="config_standard">Estándar / Standard</SelectItem>
                <SelectItem value="config_premium">Premium</SelectItem>
                <SelectItem value="config_organic">Orgánico / Organic</SelectItem>
                <SelectItem value="config_non_gmo">No GMO / Non-GMO</SelectItem>
                <SelectItem value="config_export">Exportación / Export Grade</SelectItem>
              </SelectContent>
            </Select>
            {errors.characteristics_configuration && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.characteristics_configuration.message}</p>
            )}
          </div>
        </div>

        {/* Reference Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reference_number" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('referenceNumber')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Input
              id="reference_number"
              {...register('reference_number')}
              className={`h-10 ${errors.reference_number ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder={t('referenceNumberPlaceholder')}
            />
            {errors.reference_number && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.reference_number.message}</p>
            )}
          </div>
        </div>

        {/* Contract Date and Seller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contract_date" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('contractDate')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Input
              id="contract_date"
              type="date"
              {...register('contract_date')}
              className={`h-10 ${errors.contract_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
            />
            {errors.contract_date && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.contract_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              {t('seller')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <SellerSelectionModal
              selectedSeller={watch('seller')}
              onSelect={(seller) => setValue('seller', seller.id)}
            />
            {errors.seller && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.seller.message}</p>
            )}
          </div>
        </div>

        {/* Quantity & Thresholds Subsection */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            {t('quantityAndThresholds')}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_subsection" className="text-sm font-medium text-gray-900 dark:text-white">
                {t('quantity')} <span className="text-red-500">{t('requiredField')}</span>
              </Label>
              <Input
                id="quantity_subsection"
                type="number"
                min="1"
                step="0.01"
                {...register('quantity', { valueAsNumber: true })}
                className={`h-10 ${errors.quantity ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                placeholder={t('quantityPlaceholder')}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurement_unit_subsection" className="text-sm font-medium text-gray-900 dark:text-white">
                {t('measurementUnit')} <span className="text-red-500">{t('requiredField')}</span>
              </Label>
              <Select
                value={watch('measurement_unit')}
                onValueChange={(value) => setValue('measurement_unit', value)}
              >
                <SelectTrigger className={`h-10 ${errors.measurement_unit ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                  <SelectValue placeholder={t('selectMeasurementUnit')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit_tons">Toneladas / Tons</SelectItem>
                  <SelectItem value="unit_kg">Kilogramos / Kilograms</SelectItem>
                  <SelectItem value="unit_bushels">Bushels</SelectItem>
                  <SelectItem value="unit_cwt">Quintales / Hundredweight</SelectItem>
                  <SelectItem value="unit_mt">Toneladas Métricas / Metric Tons</SelectItem>
                </SelectContent>
              </Select>
              {errors.measurement_unit && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.measurement_unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_thresholds_percentage" className="text-sm font-medium text-gray-900 dark:text-white">
                {t('minThresholds')} <span className="text-red-500">{t('requiredField')}</span>
              </Label>
              <Input
                id="min_thresholds_percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...register('min_thresholds_percentage', { valueAsNumber: true })}
                className={`h-10 ${errors.min_thresholds_percentage ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                placeholder="0"
              />
              {errors.min_thresholds_percentage && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.min_thresholds_percentage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_thresholds_percentage" className="text-sm font-medium text-gray-900 dark:text-white">
                {t('maxThresholds')} <span className="text-red-500">{t('requiredField')}</span>
              </Label>
              <Input
                id="max_thresholds_percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                {...register('max_thresholds_percentage', { valueAsNumber: true })}
                className={`h-10 ${errors.max_thresholds_percentage ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                placeholder="100"
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