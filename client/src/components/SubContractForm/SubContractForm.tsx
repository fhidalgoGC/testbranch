import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, DollarSign, FileText, Calendar } from 'lucide-react';
import { FormattedNumberInput } from '@/components/PurchaseContractForm/components/FormattedNumberInput';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { DatePicker } from '@/components/ui/datepicker';
import { formatNumber } from '@/lib/numberFormatter';
import { NUMBER_FORMAT_CONFIG } from '@/environment/environment';

// Sub-contract form validation schema with business rules
const createSubContractValidationSchema = (openInventory: number = 0) => z.object({
  // Form display fields
  contractNumber: z.string().min(1, 'Contract number is required'),
  contractDate: z.string().min(1, 'Contract date is required'),
  customerNumber: z.string().min(1, 'Customer number is required'),
  idContract: z.string().min(1, 'ID Contract is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  commodity: z.string().min(1, 'Commodity is required'),
  contact: z.string().optional(),
  shipmentPeriod: z.string().optional(),
  
  // API fields with business validation
  future: z.number().optional(), // Future is not required
  basis: z.number(),
  totalPrice: z.number().min(0, 'Total price must be positive'),
  totalDate: z.string().min(1, 'Date is required'), // Required field
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than 0') // Cannot be negative or zero
    .max(openInventory, `Quantity cannot exceed available inventory (${openInventory})`), // Cannot exceed open inventory
  measurementUnitId: z.string().min(1, 'Measurement unit is required'), // Required field
});

// Create a base schema for type inference
const baseSubContractSchema = z.object({
  contractNumber: z.string(),
  contractDate: z.string(),
  customerNumber: z.string(),
  idContract: z.string(),
  referenceNumber: z.string(),
  commodity: z.string(),
  contact: z.string().optional(),
  shipmentPeriod: z.string().optional(),
  future: z.number().optional(),
  basis: z.number(),
  totalPrice: z.number(),
  totalDate: z.string(),
  quantity: z.number(),
  measurementUnitId: z.string(),
});

type SubContractFormData = z.infer<typeof baseSubContractSchema>;

interface ContractData {
  contractNumber: string;
  contractDate: string;
  customerNumber: string; // Representa seller para purchase contracts
  idContract: string; // Es el folio
  referenceNumber: string;
  commodity: string;
  quantityUnits: number;
  measurementUnit: string;
  price: number;
  basis: number;
  future: number;
  totalPrice: number;
  openInventory: number;
  minDate: string;
  isReadOnly?: boolean; // Para modo vista
}

interface SubContractFormProps {
  mode: 'create' | 'edit' | 'view';
  contractData: ContractData;
  initialData?: Partial<SubContractFormData>;
  onFormDataChange?: (data: SubContractFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

const SubContractForm: React.FC<SubContractFormProps> = ({
  mode,
  contractData,
  initialData,
  onFormDataChange,
  onValidationChange,
  className
}) => {
  const { t } = useTranslation();
  const measurementUnitsQuery = useMeasurementUnits();

  // Configurar formulario con esquema de validación dinámico
  const form = useForm<SubContractFormData>({
    resolver: zodResolver(createSubContractValidationSchema(contractData.openInventory)),
    mode: 'onChange',
    defaultValues: {
      contractNumber: contractData.contractNumber,
      contractDate: contractData.contractDate,
      customerNumber: contractData.customerNumber,
      idContract: contractData.idContract,
      referenceNumber: contractData.referenceNumber,
      commodity: contractData.commodity,
      contact: '',
      shipmentPeriod: '',
      future: contractData.future || 0,
      basis: contractData.basis || 0,
      quantity: contractData.openInventory || 0,
      totalPrice: contractData.basis || 0,
      measurementUnitId: contractData.measurementUnit || 'bu60',
      totalDate: new Date().toISOString().split('T')[0],
      ...initialData
    }
  });

  const { control, watch, setValue, formState: { errors, isValid } } = form;

  // Watch form values for calculations
  const watchedValues = watch();
  const basis = watch('basis') || 0;
  const future = watch('future') || 0;
  const quantity = watch('quantity') || 0;

  // Calculate total price automatically
  useEffect(() => {
    const totalPrice = basis + future;
    setValue('totalPrice', totalPrice);
  }, [basis, future, setValue]);

  // Notify parent of form changes
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(watchedValues);
    }
  }, [watchedValues, onFormDataChange]);

  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const isReadOnly = mode === 'view' || contractData.isReadOnly;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className || ''}`}>
      {/* Purchase Price Contract Card */}
      <Card className="bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <FileText className="h-5 w-5" />
            {t('subContract.purchasePriceContract')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('contracts.table.columns.idContract')}
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
              #{contractData.idContract}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('contracts.table.columns.contractDate')}
            </span>
            <span className="font-medium">
              {new Date(contractData.contractDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('contracts.table.columns.seller')}
            </span>
            <span className="font-medium">{contractData.customerNumber}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('contracts.table.columns.referenceNumber')}
            </span>
            <span className="font-medium">{contractData.referenceNumber}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quantity Actual Overview Card */}
      <Card className="bg-green-50/30 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <DollarSign className="h-5 w-5" />
            {t('subContract.quantityActualOverview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Circular Progress Indicator */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-red-500"
                  strokeDasharray={`${(contractData.openInventory / contractData.quantityUnits) * 314.16} 314.16`}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="38"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-yellow-500"
                  strokeDasharray={`${((contractData.quantityUnits - contractData.openInventory) / contractData.quantityUnits) * 238.64} 238.64`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">Open</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {contractData.openInventory.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Commodity Badge */}
          <div className="text-center">
            <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
              {contractData.commodity}
            </span>
          </div>

          {/* Price Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Future</label>
              <Input
                value={contractData.future.toLocaleString()}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 text-center"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Basis</label>
              <Input
                value={contractData.basis.toLocaleString()}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 text-center"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Information Card */}
      <Card className="lg:col-span-2 bg-green-50/30 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Package className="h-5 w-5" />
            {t('subContract.generalInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('contracts.table.columns.quantity')} / Units
              </span>
              <div className="font-semibold text-lg">
                <span className="text-orange-600 dark:text-orange-400">
                  {contractData.quantityUnits.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-1">{contractData.measurementUnit}</span>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
              <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                $ {contractData.price.toLocaleString()}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Basis</span>
              <div className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                $ {contractData.basis.toLocaleString()} september2025
              </div>
            </div>
          </div>
          
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Future</span>
            <div className="font-semibold text-lg text-orange-600 dark:text-orange-400">
              $ {contractData.future.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {mode === 'create' && t('subContract.total')}
            {mode === 'edit' && t('subContract.edit')}
            {mode === 'view' && t('subContract.details')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </label>
              <Controller
                name="totalPrice"
                control={control}
                render={({ field }) => (
                  <FormattedNumberInput
                    {...field}
                    placeholder="1,500.00"
                    disabled={isReadOnly}
                    className="mt-1"
                  />
                )}
              />
              {errors.totalPrice && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.totalPrice.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date <span className="text-red-500">*</span>
              </label>
              <Controller
                name="totalDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onDateChange={(date: string) => field.onChange(date)}
                    disabled={isReadOnly}
                    minDate={new Date(contractData.minDate)}
                    className="mt-1 w-full"
                  />
                )}
              />
              {errors.totalDate && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.totalDate.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('contracts.table.columns.quantity')} <span className="text-red-500">*</span>
              </label>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <FormattedNumberInput
                    {...field}
                    placeholder="1,040.00"
                    readOnly={isReadOnly}
                    className="mt-1"
                  />
                )}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            {/* Measurement Unit */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('contracts.table.columns.measurementUnit')} <span className="text-red-500">*</span>
              </label>
              <Controller
                name="measurementUnitId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isReadOnly || measurementUnitsQuery.isLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('forms.selectMeasurementUnit')} />
                    </SelectTrigger>
                    <SelectContent>
                      {measurementUnitsQuery.data?.map((unit) => (
                        <SelectItem key={unit.key} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.measurementUnitId && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.measurementUnitId.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubContractForm;