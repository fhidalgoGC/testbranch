import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { useCreateSubContractState, usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Package, DollarSign, FileText, X, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { FormattedNumberInput } from '@/components/PurchaseContractForm/components/FormattedNumberInput';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { DatePicker } from '@/components/ui/datepicker';

// Sub-contract form schema matching API structure
const subContractSchema = z.object({
  // Form display fields
  contractNumber: z.string().min(1, 'Contract number is required'),
  contractDate: z.string().min(1, 'Contract date is required'),
  customerNumber: z.string().min(1, 'Customer number is required'),
  idContract: z.string().min(1, 'ID Contract is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  commodity: z.string().min(1, 'Commodity is required'),
  contact: z.string(),
  shipmentPeriod: z.string(),
  
  // API fields
  future: z.number().min(0, 'Future price must be positive'),
  basis: z.number(),
  totalPrice: z.number().min(0, 'Total price must be positive'),
  totalDate: z.string().min(1, 'Total date is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  measurementUnitId: z.string().min(1, 'Measurement unit is required'),
});

type SubContractFormData = z.infer<typeof subContractSchema>;

interface ContractData {
  contractNumber: string; // Ya no se usa, mantener por compatibilidad
  contractDate: string;
  customerNumber: string; // Ahora representa seller para purchase contracts
  idContract: string; // Ahora es el folio
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
  
  // Obtener contratos del state de Redux para buscar el contrato actual
  const contractsState = useSelector((state: any) => state.pageState.purchaseContracts);
  const contractsData = contractsState.contractsData || [];
  
  // Obtener el estado del contrato principal para crear sub-contrato
  const createSubContractState = useSelector((state: any) => state.pageState.createSubContract[contractId!]);
  const parentContractData = createSubContractState?.parentContractData;
  const subContractsData = createSubContractState?.subContractsData || [];
  
  usePageTracking(`/purchase-contracts/${contractId}/sub-contracts/create`);
  
  // Notificar navegación al cargar la página
  useEffect(() => {
    handleNavigateToPage('createSubContract', contractId);
  }, [contractId]);

  // Estados locales - usar datos del contrato principal si están disponibles
  const [contractData] = useState<ContractData>(() => {
    if (parentContractData) {
      // Determinar qué participante mostrar basado en el tipo de contrato
      const contractType = parentContractData.type; // 'purchase' o 'sale'
      const targetRole = contractType === 'purchase' ? 'seller' : 'buyer';
      const participant = parentContractData.participants?.find((p: any) => p.role === targetRole);
      
      return {
        contractNumber: '', // Removido - ya no se usa
        contractDate: parentContractData.contract_date ? new Date(parentContractData.contract_date).toLocaleDateString() : new Date().toLocaleDateString(),
        customerNumber: participant?.name || 'N/A', // Ahora muestra seller para purchase contracts
        idContract: parentContractData.folio || 'N/A', // Usar folio como ID Contract
        referenceNumber: parentContractData.reference_number || 'N/A',
        commodity: parentContractData.commodity?.name || 'N/A',
        quantityUnits: parentContractData.quantity || 0,
        price: parentContractData.price_schedule?.[0]?.price ?? 0,
        basis: parentContractData.price_schedule?.[0]?.basis ?? 0,
        future: parentContractData.price_schedule?.[0]?.future_price ?? 0,
        contact: '-',
        shipmentPeriod: '-'
      };
    }
    
    // Datos por defecto si no hay datos del contrato principal
    return {
      contractNumber: '',
      contractDate: '7/31/2025',
      customerNumber: 'Test Seller LLC',
      idContract: 'SPC-46',
      referenceNumber: 'NA',
      commodity: 'HRW - Wheat Hard Red Winter',
      quantityUnits: 1400,
      price: 0,
      basis: 0,
      future: 0,
      contact: '-',
      shipmentPeriod: '-'
    };
  });

  // API hooks
  const { data: measurementUnits = [], isLoading: loadingUnits, error: unitsError } = useMeasurementUnits();
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formDataForSubmission, setFormDataForSubmission] = useState<SubContractFormData | null>(null);
  
  // Debug measurement units loading
  useEffect(() => {
    console.log('🔍 Measurement Units Debug:');
    console.log('- Loading:', loadingUnits);
    console.log('- Error:', unitsError);
    console.log('- Data:', measurementUnits);
    console.log('- Count:', measurementUnits.length);
    console.log('🔍 Parent Contract measurement_unit_id:', parentContractData?.measurement_unit_id);
    console.log('🔍 Parent Contract measurement_unit:', parentContractData?.measurement_unit);
    
    // Debug form default values
    console.log('📝 Form Default Values Debug:');
    console.log('- Today date:', new Date().toISOString().split('T')[0]);
    console.log('- Open inventory:', parentContractData?.inventory?.open);
    console.log('- Contract contract_date:', parentContractData?.contract_date);
    console.log('- All parent contract keys:', parentContractData ? Object.keys(parentContractData) : 'No parent data');
    console.log('- Contract created_at:', parentContractData?.created_at);
    console.log('- Min date for picker:', parentContractData?.contract_date ? new Date(parentContractData.contract_date) : new Date());
  }, [measurementUnits, loadingUnits, unitsError, parentContractData]);
  
  // Form setup with react-hook-form
  const form = useForm<SubContractFormData>({
    resolver: zodResolver(subContractSchema),
    defaultValues: {
      contractNumber: contractData.idContract, // Usar idContract (folio) como contractNumber
      contractDate: contractData.contractDate,
      customerNumber: contractData.customerNumber,
      idContract: contractData.idContract,
      referenceNumber: contractData.referenceNumber,
      commodity: contractData.commodity,
      future: parentContractData?.price_schedule?.[0]?.future_price ?? 0,
      basis: parentContractData?.price_schedule?.[0]?.basis ?? contractData.basis,
      totalPrice: (parentContractData?.price_schedule?.[0]?.future_price ?? 0) + (parentContractData?.price_schedule?.[0]?.basis ?? contractData.basis),
      totalDate: new Date().toISOString().split('T')[0], // Fecha de hoy en formato YYYY-MM-DD
      quantity: parentContractData?.inventory?.open ?? 0, // Usar el valor "open" del inventario
      measurementUnitId: parentContractData?.measurement_unit || 'bu60',
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
    // Store form data for submission and open confirmation modal
    setFormDataForSubmission(data);
    setShowConfirmModal(true);
  });

  const handleConfirmSubmission = () => {
    if (!formDataForSubmission) return;
    
    const data = formDataForSubmission;
    
    // Get auth data from localStorage  
    const createdById = localStorage.getItem('user_id') || '';
    const createdByName = localStorage.getItem('user_name') || '';
    
    // Find selected measurement unit details from raw API data
    const measurementUnitsData = measurementUnits;
    const selectedUnitSlug = data.measurementUnitId; // This is the slug like "bu60"
    
    // Find the full unit data from the API response to get the ObjectId
    // We need to find it in the raw API response that was logged
    const selectedUnitId = parentContractData?.measurement_unit_id || ''; // Use parent's ObjectId as fallback
    
    // Construct API payload matching the required structure
    const apiPayload = {
      contract_id: contractId,
      contract_folio: data.contractNumber,
      measurement_unit: selectedUnitSlug, // Short code like "bu60"
      total_price: data.totalPrice,
      created_by_id: createdById,
      created_by_name: createdByName,
      price_schedule: [{
        pricing_type: 'basis',
        price: data.totalPrice,
        basis: data.basis,
        future_price: data.future,
        basis_operation: 'add',
        option_month: 'september',
        option_year: 2025,
        exchange: 'Chicago Board of Trade',
        payment_currency: 'usd'
      }],
      quantity: data.quantity,
      sub_contract_date: data.totalDate,
      measurement_unit_id: selectedUnitId, // ObjectId from parent contract
      thresholds: {
        max_thresholds_percentage: 0,
        max_thresholds_weight: data.quantity,
        min_thresholds_percentage: 0,
        min_thresholds_weight: data.quantity
      }
    };
    
    console.log('Creating sub-contract with API payload:', apiPayload);
    
    // Close modal and navigate back
    setShowConfirmModal(false);
    setFormDataForSubmission(null);
    setLocation(`/purchase-contracts/${contractId}`);
  };

  const handleCancelSubmission = () => {
    setShowConfirmModal(false);
    setFormDataForSubmission(null);
  };
  
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
          
          {/* Debug Button */}
          <Button 
            onClick={() => {
              console.log('=== DEBUG STATE - CREATE SUB CONTRACT ===');
              console.log('🔍 Parent Contract Data:', parentContractData);
              console.log('📋 Sub-contracts Data:', subContractsData);
              console.log('🧾 Contract Data (mapped):', contractData);
              console.log('📊 Create Sub Contract State:', createSubContractState);
              console.log('=== END DEBUG ===');
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            size="sm"
          >
            Debug State
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          
          {/* Left Column - Contract Details */}
          <div className="space-y-6">
            
            {/* Contract Overview Card */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Purchase Price Contract</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ID Contract</span>
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono">
                      #{contractData.idContract}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contract Date</span>
                    <span className="text-sm font-medium">{contractData.contractDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {parentContractData?.type === 'purchase' ? 'Seller' : 'Buyer'}
                    </span>
                    <span className="text-sm font-medium">{contractData.customerNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reference Number</span>
                    <span className="text-sm font-medium">{contractData.referenceNumber}</span>
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

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quantity / Units</span>
                    <span className="text-sm font-bold font-mono text-amber-500 dark:text-amber-400">
                      {(parentContractData?.quantity || contractData.quantityUnits).toLocaleString()} {parentContractData?.measurement_unit || 'bushel'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                    <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                      $ {(parentContractData?.price_schedule?.[0]?.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Basis</span>
                    <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                      $ {(parentContractData?.price_schedule?.[0]?.basis ?? 0).toFixed(2)} {parentContractData?.price_schedule?.[0]?.option_month || 'september'}{parentContractData?.price_schedule?.[0]?.option_year || '2025'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Future</span>
                    <span className="text-sm font-bold font-mono text-orange-600 dark:text-orange-400">
                      $ {(parentContractData?.price_schedule?.[0]?.future_price ?? 0).toFixed(2)}
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
                      <span className="text-xs text-rose-500 dark:text-rose-400">Open</span>
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
                              minDate={parentContractData?.contract_date ? new Date(parentContractData.contract_date) : new Date()}
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

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-xl mx-auto p-0 overflow-hidden">
          <DialogHeader className="bg-white dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Create Sub-Contract
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400">
              Review and confirm the sub-contract details before creating
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-3 space-y-3">
            {/* Partial Pricing Summary Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-2 space-y-2">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                Partial Pricing Summary
              </h3>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Quantity Sub-Contract:</span>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">
                      {formDataForSubmission?.quantity?.toFixed(2) || '0.00'} {parentContractData?.measurement_unit || 'bu60'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 dark:text-gray-400">Open Contract:</span>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">
                      {parentContractData?.inventory?.open?.toFixed(2) || '0.00'} {parentContractData?.measurement_unit || 'bu60'}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${Math.min(((formDataForSubmission?.quantity || 0) / (parentContractData?.inventory?.open || 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Contract Changes and New Sub Contract Cards */}
            <div className="grid grid-cols-2 gap-2">
              {/* Contract Changes Card */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 space-y-1">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Contract Changes
                </h3>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">ID Contract:</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Quantity</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      #{parentContractData?.folio || 'SPC-46'}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {parentContractData?.inventory?.open?.toFixed(2) || '690.00'} {parentContractData?.measurement_unit || 'bu60'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Balance</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Basis</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {((parentContractData?.inventory?.open || 0) - (formDataForSubmission?.quantity || 0)).toFixed(2)} {parentContractData?.measurement_unit || 'bu60'}
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formDataForSubmission?.basis || parentContractData?.price_schedule?.[0]?.basis || '1500'}
                    </span>
                  </div>
                </div>
              </div>

              {/* New Sub Contract Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    New Sub Contract
                  </h3>
                  <div className="text-sm">→</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">ID Contract:</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Quantity</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      #{formDataForSubmission?.contractNumber || 'SPC-46-SUBC-5'}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formDataForSubmission?.quantity?.toFixed(2) || '30.00'} {parentContractData?.measurement_unit || 'bu60'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Balance</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Basis</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formDataForSubmission?.quantity?.toFixed(2) || '30.00'} {parentContractData?.measurement_unit || 'bu60'}
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formDataForSubmission?.basis || '1500'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Futures</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Price</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formDataForSubmission?.future || '0'}
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formDataForSubmission?.totalPrice || '1500'}
                    </span>
                  </div>
                </div>
              </div>
            </div>



            {/* Action Buttons */}
            <div className="flex space-x-2 pt-1">
              <Button
                onClick={handleCancelSubmission}
                variant="outline"
                className="flex-1 h-8 text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSubmission}
                className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}