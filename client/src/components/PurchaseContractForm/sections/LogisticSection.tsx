import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Truck } from 'lucide-react';
import type { PurchaseContractFormData, LogisticSchedule } from '@/types/purchaseContract.types';

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
  const { formState: { errors }, watch } = useFormContext<PurchaseContractFormData>();
  
  const logisticSchedule = watch('logistic_schedule') || [];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Truck className="w-5 h-5" />
          Logistic Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">
            Logistic Schedule <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            onClick={addLogisticSchedule}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Logistic Schedule
          </Button>
        </div>

        {logisticSchedule.map((schedule, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white">Logistic Schedule {index + 1}</h4>
              <Button
                type="button"
                onClick={() => removeLogisticSchedule(index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logistic Payment Responsibility */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Payment Responsibility <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={schedule.logistic_payment_responsability}
                  onValueChange={(value) => updateLogisticSchedule(index, 'logistic_payment_responsability', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select responsibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logistic Coordination Responsibility */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Coordination Responsibility <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={schedule.logistic_coordination_responsability}
                  onValueChange={(value) => updateLogisticSchedule(index, 'logistic_coordination_responsability', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select responsibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Currency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Payment Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={schedule.payment_currency}
                  onValueChange={(value) => updateLogisticSchedule(index, 'payment_currency', value)}
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
            </div>

            {/* Freight Cost Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                Freight Cost
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Freight Cost Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={schedule.freight_cost.type}
                    onValueChange={(value) => updateLogisticSchedule(index, 'freight_cost.type', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="range">Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Cost
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={schedule.freight_cost.cost}
                    onChange={(e) => updateLogisticSchedule(index, 'freight_cost.cost', parseFloat(e.target.value) || 0)}
                    className="h-10"
                    placeholder="0"
                  />
                </div>

                {/* Min */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Min
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={schedule.freight_cost.min}
                    onChange={(e) => updateLogisticSchedule(index, 'freight_cost.min', parseFloat(e.target.value) || 0)}
                    className="h-10"
                    placeholder="0"
                  />
                </div>

                {/* Max */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Max
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={schedule.freight_cost.max}
                    onChange={(e) => updateLogisticSchedule(index, 'freight_cost.max', parseFloat(e.target.value) || 0)}
                    className="h-10"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {errors.logistic_schedule && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.logistic_schedule.message}</p>
        )}

        {logisticSchedule.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No logistic schedules added yet. Click "Add Logistic Schedule" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}