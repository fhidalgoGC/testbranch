import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package } from 'lucide-react';
import type { PurchaseContractFormData } from '@/types/purchaseContract.types';

export function ShipmentSection() {
  const { t } = useTranslation();
  const { register, formState: { errors }, watch, setValue } = useFormContext<PurchaseContractFormData>();

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Package className="w-5 h-5" />
          Shipment & Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shipping_start_date" className="text-sm font-medium text-gray-900 dark:text-white">
              Shipping Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shipping_start_date"
              type="date"
              {...register('shipping_start_date')}
              className={`h-10 ${errors.shipping_start_date ? 'border-red-500' : ''}`}
            />
            {errors.shipping_start_date && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.shipping_start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_end_date" className="text-sm font-medium text-gray-900 dark:text-white">
              Shipping End Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shipping_end_date"
              type="date"
              {...register('shipping_end_date')}
              className={`h-10 ${errors.shipping_end_date ? 'border-red-500' : ''}`}
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
              className={`h-10 ${errors.application_priority ? 'border-red-500' : ''}`}
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
              className={`h-10 ${errors.delivered ? 'border-red-500' : ''}`}
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
              <SelectTrigger className={`h-10 ${errors.transport ? 'border-red-500' : ''}`}>
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
              <SelectTrigger className={`h-10 ${errors.weights ? 'border-red-500' : ''}`}>
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
              <SelectTrigger className={`h-10 ${errors.inspections ? 'border-red-500' : ''}`}>
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
              <SelectTrigger className={`h-10 ${errors.proteins ? 'border-red-500' : ''}`}>
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
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('min_thresholds_percentage', { valueAsNumber: true })}
                className={`h-10 ${errors.min_thresholds_percentage ? 'border-red-500' : ''}`}
                placeholder="10"
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
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('max_thresholds_percentage', { valueAsNumber: true })}
                className={`h-10 ${errors.max_thresholds_percentage ? 'border-red-500' : ''}`}
                placeholder="10"
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