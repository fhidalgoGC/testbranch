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
  const { formState: { errors }, watch } = useFormContext<PurchaseContractFormData>();
  
  const priceSchedule = watch('price_schedule') || [];

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <DollarSign className="w-5 h-5" />
          Price Contract Per (Bushel 56)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">
            Price Schedule <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            onClick={addPriceSchedule}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Price Schedule
          </Button>
        </div>

        {priceSchedule.map((schedule, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white">Price Schedule {index + 1}</h4>
              <Button
                type="button"
                onClick={() => removePriceSchedule(index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pricing Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Pricing Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={schedule.pricing_type}
                  onValueChange={(value) => updatePriceSchedule(index, 'pricing_type', value)}
                >
                  <SelectTrigger className={`h-10 ${errors.price_schedule?.[index]?.pricing_type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="basis">Basis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={schedule.price}
                  onChange={(e) => updatePriceSchedule(index, 'price', parseFloat(e.target.value) || 0)}
                  className={`h-10 ${errors.price_schedule?.[index]?.price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                  placeholder="370"
                />
              </div>

              {/* Future Price */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Future Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={schedule.future_price}
                  onChange={(e) => updatePriceSchedule(index, 'future_price', parseFloat(e.target.value) || 0)}
                  className={`h-10 ${errors.price_schedule?.[index]?.future_price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                  placeholder="370"
                />
              </div>

              {/* Basis */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Basis
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={schedule.basis}
                  onChange={(e) => updatePriceSchedule(index, 'basis', parseFloat(e.target.value) || 0)}
                  className="h-10"
                  placeholder="0"
                />
              </div>

              {/* Basis Operation */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Basis Operation
                </Label>
                <Select
                  value={schedule.basis_operation}
                  onValueChange={(value) => updatePriceSchedule(index, 'basis_operation', value)}
                >
                  <SelectTrigger className="h-10">
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
                  value={schedule.option_month}
                  onValueChange={(value) => updatePriceSchedule(index, 'option_month', value)}
                >
                  <SelectTrigger className="h-10">
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
                <Input
                  type="number"
                  min={new Date().getFullYear()}
                  value={schedule.option_year}
                  onChange={(e) => updatePriceSchedule(index, 'option_year', parseInt(e.target.value) || new Date().getFullYear())}
                  className="h-10"
                  placeholder="2026"
                />
              </div>

              {/* Payment Currency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Payment Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={schedule.payment_currency}
                  onValueChange={(value) => updatePriceSchedule(index, 'payment_currency', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="mxn">MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exchange */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Exchange <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={schedule.exchange}
                  onChange={(e) => updatePriceSchedule(index, 'exchange', e.target.value)}
                  className={`h-10 ${errors.price_schedule?.[index]?.exchange ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                  placeholder="Kansas City Board of Trade"
                />
              </div>
            </div>
          </div>
        ))}

        {errors.price_schedule && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.price_schedule.message}</p>
        )}

        {priceSchedule.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No price schedules added yet. Click "Add Price Schedule" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}