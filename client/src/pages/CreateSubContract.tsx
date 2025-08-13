import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { useCreateSubContractState, usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Package, DollarSign, FileText, X } from 'lucide-react';
import { Link } from 'wouter';
import { FormattedNumberInput } from '@/components/PurchaseContractForm/components/FormattedNumberInput';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { DatePicker } from '@/components/ui/datepicker';

// Sub-contract form schema
const subContractSchema = z.object({
  contractNumber: z.string().min(1, 'Contract number is required'),
  contractDate: z.string().min(1, 'Contract date is required'),
  customerNumber: z.string().min(1, 'Customer number is required'),
  idContract: z.string().min(1, 'ID Contract is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  commodity: z.string().min(1, 'Commodity is required'),
  future: z.number().min(0, 'Future price must be positive'),
  basis: z.number(),
  totalPrice: z.number().min(0, 'Total price must be positive'),
  totalDate: z.string().min(1, 'Total date is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  measurementUnitId: z.string().min(1, 'Measurement unit is required'),
  contact: z.string(),
  shipmentPeriod: z.string(),
});

type SubContractFormData = z.infer<typeof subContractSchema>;

interface ContractData {
  contractNumber: string;
  contractDate: string;
  customerNumber: string;
  idContract: string;
  referenceNumber: string;
  commodity: string;
  quantityUnits: number;
  price: number;
  basis: number;
  future: number;
  contact: string;
  shipmentPeriod: string;
}



export default function CreateSubContract() {
  const { t } = useTranslation();
  const params = useParams();
  const [location, setLocation] = useLocation();
  
  const contractId = params.contractId;
  
  // Hook para persistir estado de crear sub-contrato
  const { formState, updateState } = useCreateSubContractState(contractId!);
  const { handleNavigateToPage } = useNavigationHandler();
  usePageTracking(`/purchase-contracts/${contractId}/sub-contracts/create`);
  
  // Notificar navegación al cargar la página
  useEffect(() => {
    handleNavigateToPage('createSubContract', contractId);
  }, [contractId]);

  // Estados locales
  const [contractData] = useState<ContractData>({
    contractNumber: 'SPC-46',
    contractDate: '7/31/2025',
    customerNumber: 'abcdef',
    idContract: '8',
    referenceNumber: 'NA',
    commodity: 'HRW - Wheat Hard Red Winter',
    quantityUnits: 1400,
    price: 9.000,
    basis: 1000.00,
    future: 850.25,
    contact: '-',
    shipmentPeriod: '-'
  });

  // API hooks
  const { data: measurementUnits = [], isLoading: loadingUnits, error: unitsError } = useMeasurementUnits();
  
  // Form setup with react-hook-form
  const form = useForm<SubContractFormData>({
    resolver: zodResolver(subContractSchema),
    defaultValues: {
      contractNumber: contractData.contractNumber,
      contractDate: contractData.contractDate,
      customerNumber: contractData.customerNumber,
      idContract: contractData.idContract,
      referenceNumber: contractData.referenceNumber,
      commodity: contractData.commodity,
      future: contractData.future,
      basis: contractData.basis,
      totalPrice: contractData.future + contractData.basis,
      totalDate: '2025-08-13',
      quantity: 700.00,
      measurementUnitId: 'bushel60',
      contact: contractData.contact,
      shipmentPeriod: contractData.shipmentPeriod,
    }
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;
  
  // Watch values for calculations
  const futureValue = watch('future');
  const basisValue = watch('basis');

  const handleCancel = () => {
    setLocation(`/purchase-contracts/${contractId}`);
  };

  const handleCreateSubContract = handleSubmit((data: SubContractFormData) => {
    // Update total price with current calculation
    const finalData = {
      ...data,
      totalPrice: data.future + data.basis
    };
    
    console.log('Creating sub-contract with form data:', finalData);
    // TODO: Send finalData to API endpoint
    setLocation(`/purchase-contracts/${contractId}`);
  });
  
  // Update total price when future changes
  useEffect(() => {
    if (futureValue !== undefined) {
      setValue('totalPrice', futureValue + basisValue);
    }
  }, [futureValue, basisValue, setValue]);

  return (
    <DashboardLayout title="New Sub-Contract">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/purchase-contracts/${contractId}`}>
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                New Sub-Contract
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Contract Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contract Overview Card */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Purchase Price Contract</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Contract Number</span>
                      <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono">
                        #{contractData.contractNumber}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Contract Date</span>
                      <span className="text-sm font-medium">{contractData.contractDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Customer Number</span>
                      <span className="text-sm font-medium">{contractData.customerNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ID Contract</span>
                      <span className="text-sm font-medium">{contractData.idContract}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Reference Number</span>
                      <span className="text-sm font-medium">{contractData.referenceNumber}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Information Card */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span>General Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Commodity</span>
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      {contractData.commodity}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quantity / Units</span>
                    <span className="text-sm font-bold font-mono">{contractData.quantityUnits.toLocaleString()} bushel</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                    <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                      $ {contractData.price.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Basis</span>
                    <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                      $ {contractData.basis.toFixed(2)} september2025
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Future</span>
                    <span className="text-sm font-bold font-mono text-orange-600 dark:text-orange-400">
                      $ {contractData.future.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Right Column - Quantity Overview */}
          <div className="space-y-6">
            
            {/* Quantity Overview Card */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Quantity Actual Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                
                {/* Circular Progress */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      {/* Progress circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="50, 100"
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Contract #</span>
                      <span className="text-sm font-bold">SPC-46</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reserved / Open</span>
                      <span className="text-xs font-medium">700.00</span>
                    </div>
                  </div>
                </div>

                {/* Commodity Badge */}
                <div className="text-center mb-6">
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm px-3 py-1">
                    HRW - Wheat Hard Red Winter september 2025
                  </Badge>
                </div>

                {/* Future and Basis Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Future Field */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Future <span className="text-red-500">*</span>
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
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.future.message}</p>
                      )}
                    </div>

                    {/* Basis Field (Read-only) */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Basis
                      </label>
                      <Controller
                        name="basis"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            value={field.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Total</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                          Price
                        </label>
                        <Controller
                          name="totalPrice"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="text"
                              value={field.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              readOnly
                              className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed border-gray-200"
                              tabIndex={-1}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                          Date
                        </label>
                        <Controller
                          name="totalDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select date"
                              className="text-sm"
                              error={!!errors.totalDate}
                            />
                          )}
                        />
                        {errors.totalDate && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.totalDate.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                          Quantity
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
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.quantity.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                          Measurement Unit
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
                                <SelectValue placeholder="Select measurement unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingUnits ? (
                                  <SelectItem value="loading" disabled>Loading units...</SelectItem>
                                ) : unitsError ? (
                                  <SelectItem value="error" disabled>Error loading units</SelectItem>
                                ) : measurementUnits.length === 0 ? (
                                  <SelectItem value="empty" disabled>No units available</SelectItem>
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
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.measurementUnitId.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleCreateSubContract}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Create Sub - Contract
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full py-3 text-base font-medium border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}