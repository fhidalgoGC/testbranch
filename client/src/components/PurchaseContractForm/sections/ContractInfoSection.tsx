import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText } from 'lucide-react';
import type { PurchaseContractFormData, Participant } from '@/types/purchaseContract.types';

interface ContractInfoSectionProps {
  addParticipant: () => void;
  removeParticipant: (index: number) => void;
  updateParticipant: (index: number, field: keyof Participant, value: string) => void;
}

export function ContractInfoSection({ 
  addParticipant, 
  removeParticipant, 
  updateParticipant 
}: ContractInfoSectionProps) {
  const { t } = useTranslation();
  const { register, formState: { errors }, watch, setValue } = useFormContext<PurchaseContractFormData>();
  
  const participants = watch('participants') || [];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <FileText className="w-5 h-5" />
          {t('contractInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Contract Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="folio" className="text-sm font-medium text-gray-900 dark:text-white">
              {t('folio')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Input
              id="folio"
              {...register('folio')}
              className={`h-10 ${errors.folio ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder={t('folioPlaceholder')}
            />
            {errors.folio && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.folio.message}</p>
            )}
          </div>

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
              Grade <span className="text-red-500">*</span>
            </Label>
            <Input
              id="grade"
              type="number"
              min="1"
              max="10"
              {...register('grade', { valueAsNumber: true })}
              className={`h-10 ${errors.grade ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="3"
            />
            {errors.grade && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.grade.message}</p>
            )}
          </div>
        </div>

        {/* Commodity Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commodity_id" className="text-sm font-medium text-gray-900 dark:text-white">
              Commodity ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="commodity_id"
              {...register('commodity_id')}
              className={`h-10 ${errors.commodity_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="6839ef25edc3c27f091bdfc0"
            />
            {errors.commodity_id && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.commodity_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commodity_name" className="text-sm font-medium text-gray-900 dark:text-white">
              Commodity Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="commodity_name"
              {...register('commodity_name')}
              className={`h-10 ${errors.commodity_name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="SRW - Wheat Soft Red Winter"
            />
            {errors.commodity_name && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.commodity_name.message}</p>
            )}
          </div>
        </div>

        {/* Characteristics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="characteristics_configuration_id" className="text-sm font-medium text-gray-900 dark:text-white">
              Configuration ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="characteristics_configuration_id"
              {...register('characteristics_configuration_id')}
              className={`h-10 ${errors.characteristics_configuration_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="683bbb8317f5aafb7814eb22"
            />
            {errors.characteristics_configuration_id && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.characteristics_configuration_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="characteristics_configuration_name" className="text-sm font-medium text-gray-900 dark:text-white">
              Configuration Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="characteristics_configuration_name"
              {...register('characteristics_configuration_name')}
              className={`h-10 ${errors.characteristics_configuration_name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="Configuration Name"
            />
            {errors.characteristics_configuration_name && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.characteristics_configuration_name.message}</p>
            )}
          </div>
        </div>

        {/* Quantity and Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium text-gray-900 dark:text-white">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register('quantity', { valueAsNumber: true })}
              className={`h-10 ${errors.quantity ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="1700"
            />
            {errors.quantity && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurement_unit" className="text-sm font-medium text-gray-900 dark:text-white">
              Measurement Unit <span className="text-red-500">*</span>
            </Label>
            <Input
              id="measurement_unit"
              {...register('measurement_unit')}
              className={`h-10 ${errors.measurement_unit ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="bu56"
            />
            {errors.measurement_unit && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.measurement_unit.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurement_unit_id" className="text-sm font-medium text-gray-900 dark:text-white">
              Measurement Unit ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="measurement_unit_id"
              {...register('measurement_unit_id')}
              className={`h-10 ${errors.measurement_unit_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="6840d42d60fd7f152734525e"
            />
            {errors.measurement_unit_id && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.measurement_unit_id.message}</p>
            )}
          </div>
        </div>

        {/* Reference and Contract Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reference_number" className="text-sm font-medium text-gray-900 dark:text-white">
              Reference Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reference_number"
              {...register('reference_number')}
              className={`h-10 ${errors.reference_number ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="NA"
            />
            {errors.reference_number && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.reference_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract_date" className="text-sm font-medium text-gray-900 dark:text-white">
              Contract Date <span className="text-red-500">*</span>
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
        </div>

        {/* Participants Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('participants')} <span className="text-red-500">{t('requiredField')}</span>
            </Label>
            <Button
              type="button"
              onClick={addParticipant}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('addParticipant')}
            </Button>
          </div>

          {participants.map((participant, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">Participant {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    People ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={participant.people_id}
                    onChange={(e) => updateParticipant(index, 'people_id', e.target.value)}
                    className={`h-10 ${errors.participants?.[index]?.people_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                    placeholder="685b2f67ca51c8f284775f83"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={participant.name}
                    onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                    className={`h-10 ${errors.participants?.[index]?.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
                    placeholder="Andrés bandera"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={participant.role}
                    onValueChange={(value) => updateParticipant(index, 'role', value)}
                  >
                    <SelectTrigger className={`h-10 ${errors.participants?.[index]?.role ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {errors.participants && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.participants.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}