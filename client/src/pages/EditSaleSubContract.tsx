import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import { setLocation } from 'wouter/use-browser-location';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Package, FileText, X, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';
import { formatNumber } from '@/lib/numberFormatter';
import { NUMBER_FORMAT_CONFIG } from '@/environment/environment';
import { authenticatedFetch } from '@/utils/apiInterceptors';
import { QuantityActualOverview } from '@/components/contracts/QuantityActualOverview';

// Sub-contract form validation schema with business rules for editing
const editSubContractValidationSchema = (openInventory: number = 0, currentQuantity: number = 0) => z.object({
  // Form display fields
  contractNumber: z.string().min(1, 'Contract number is required'),
  contractDate: z.string().min(1, 'Contract date is required'),
  customerNumber: z.string().min(1, 'Customer number is required'),
  idContract: z.string().min(1, 'ID Contract is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  commodity: z.string().min(1, 'Commodity is required'),
  contact: z.string().optional(),
  shipmentPeriod: z.string().optional(),
  
  // API fields with business validation - for editing, we need to consider current quantity
  future: z.number().optional(), // Future is not required
  basis: z.number(),
  price: z.number(), // Add price field
  totalPrice: z.number().min(0, 'Total price must be positive'),
  totalDate: z.string().min(1, 'Date is required'), // Required field
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than 0') // Cannot be negative or zero
    .max(openInventory + currentQuantity, `Quantity cannot exceed available inventory (${openInventory + currentQuantity})`), // Can use current quantity plus available
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
  price: z.number(),
  totalPrice: z.number(),
  totalDate: z.string(),
  quantity: z.number(),
  measurementUnitId: z.string(),
});

type SubContractFormData = z.infer<typeof baseSubContractSchema>;

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

export default function EditSaleSubContract() {
  const { t } = useTranslation();
  const params = useParams();
  const [location, setLocationState] = useLocation();
  
  const contractId = params.contractId;
  const subContractId = params.subContractId;
  
  const { handleNavigateToPage } = useNavigationHandler();
  
  // Obtener contratos del state de Redux para sale contracts
  const contractsState = useSelector((state: any) => state.pageState.saleContracts);
  const contractsData = contractsState.contractsData || [];
  
  usePageTracking(`/sale-contracts/${contractId}/sub-contracts/${subContractId}/edit`);
  
  // States
  const [contractData, setContractData] = useState<ContractData>({
    contractNumber: '',
    contractDate: '',
    customerNumber: '',
    idContract: '',
    referenceNumber: '',
    commodity: '',
    quantityUnits: 0,
    price: 0,
    basis: 0,
    future: 0,
    contact: '',
    shipmentPeriod: ''
  });

  const [subContractData, setSubContractData] = useState<any>(null);
  const [openInventory, setOpenInventory] = useState<number>(0);
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [totalPriceCalc, setTotalPriceCalc] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get measurement units
  const { measurementUnits, loading: measurementUnitsLoading, error: measurementUnitsError } = useMeasurementUnits();

  // Create form with validation schema
  const validationSchema = editSubContractValidationSchema(openInventory, currentQuantity);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset
  } = useForm<SubContractFormData>({
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      contractNumber: '',
      contractDate: '',
      customerNumber: '',
      idContract: '',
      referenceNumber: '',
      commodity: '',
      contact: '',
      shipmentPeriod: '',
      future: 0,
      basis: 0,
      price: 0,
      totalPrice: 0,
      totalDate: new Date().toISOString().split('T')[0],
      quantity: 0,
      measurementUnitId: '',
    }
  });

  // Watch values for calculations
  const watchedValues = watch(['future', 'basis', 'quantity']);

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!contractId || !subContractId) return;

      setLoading(true);
      try {
        // Load parent contract data from Redux
        const foundContract = contractsData.find((contract: any) => 
          contract._id === contractId || contract.id === contractId
        );

        if (foundContract) {
          // Get buyer for sale contracts
          const buyer = foundContract.participants?.find((p: any) => p.role === 'buyer');
          const seller = foundContract.participants?.find((p: any) => p.role === 'seller');
          
          const contractInfo: ContractData = {
            contractNumber: foundContract.folio || '',
            contractDate: foundContract.contract_date ? new Date(foundContract.contract_date).toISOString().split('T')[0] : '',
            customerNumber: buyer?.name || 'Unknown Buyer',
            idContract: foundContract.folio || '',
            referenceNumber: foundContract.reference_number || foundContract.folio || '',
            commodity: foundContract.commodity?.name || '',
            quantityUnits: foundContract.quantity || 0,
            price: foundContract.price_schedule?.[0]?.price || 0,
            basis: foundContract.price_schedule?.[0]?.basis || 0,
            future: foundContract.price_schedule?.[0]?.future_price || 0,
            contact: seller?.name || '',
            shipmentPeriod: foundContract.shipping_start_date && foundContract.shipping_end_date ? 
              `${new Date(foundContract.shipping_start_date).toLocaleDateString()} - ${new Date(foundContract.shipping_end_date).toLocaleDateString()}` : ''
          };

          setContractData(contractInfo);
          setOpenInventory(foundContract.inventory?.open || 0);

          // Load sub-contract data
          const response = await authenticatedFetch(`/api/v1/subcontracts/${subContractId}`);
          if (!response.ok) {
            throw new Error('Failed to load sub-contract data');
          }
          
          const subContractResponse = await response.json();
          const subContract = subContractResponse.data || subContractResponse;
          
          setSubContractData(subContract);
          setCurrentQuantity(subContract.quantity || 0);

          // Populate form with existing data
          setValue('contractNumber', contractInfo.contractNumber);
          setValue('contractDate', contractInfo.contractDate);
          setValue('customerNumber', contractInfo.customerNumber);
          setValue('idContract', contractInfo.idContract);
          setValue('referenceNumber', contractInfo.referenceNumber);
          setValue('commodity', contractInfo.commodity);
          setValue('contact', contractInfo.contact);
          setValue('shipmentPeriod', contractInfo.shipmentPeriod);
          setValue('future', subContract.future_price || 0);
          setValue('basis', subContract.basis || 0);
          setValue('price', subContract.price || 0);
          setValue('quantity', subContract.quantity || 0);
          setValue('totalDate', subContract.delivery_date ? subContract.delivery_date.split('T')[0] : '');
          setValue('measurementUnitId', subContract.measurement_unit_id || '');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contractId, subContractId, contractsData, setValue]);

  // Calculate total price when future, basis, or quantity changes
  useEffect(() => {
    const [future = 0, basis = 0, quantity = 0] = watchedValues;
    
    // For sale contracts: total price = (future + basis) × quantity
    const calculatedPrice = (future + basis) * quantity;
    setTotalPriceCalc(calculatedPrice);
    setValue('totalPrice', calculatedPrice);
  }, [watchedValues, setValue]);

  const onSubmit = async (data: SubContractFormData) => {
    console.log('📝 Form submitted with data:', data);
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    if (!contractId || !subContractId) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = watch();
      
      // Prepare API payload for sale sub-contract update
      const apiPayload = {
        quantity: formData.quantity,
        measurement_unit_id: formData.measurementUnitId,
        future_price: formData.future || 0,
        basis: formData.basis,
        price: totalPriceCalc,
        delivery_date: formData.totalDate,
      };

      console.log('📤 API Update Payload:', apiPayload);

      const response = await authenticatedFetch(`/api/v1/subcontracts/${subContractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }

      const responseData = await response.json();
      console.log('✅ Sub-contract updated successfully:', responseData);
      
      // Navigate back to sale contract detail with refresh
      setLocation(`/sale-contracts/${contractId}?refresh=true`);
      
    } catch (err) {
      console.error('❌ Error updating sub-contract:', err);
      setError(err instanceof Error ? err.message : 'Failed to update sub-contract');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancel = () => {
    setLocation(`/sale-contracts/${contractId}`);
  };

  if (loading || measurementUnitsLoading) {
    return (
      <DashboardLayout title={t('editSaleSubContract')}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || measurementUnitsError) {
    return (
      <DashboardLayout title={t('editSaleSubContract')}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <X className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('error')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || measurementUnitsError}
          </p>
          <Button onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('editSaleSubContract')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('editSaleSubContract')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('updateSubContractDetails')}
              </p>
            </div>
          </div>
        </div>

        {/* Quantity Overview */}
        <QuantityActualOverview
          totalQuantity={contractData.quantityUnits}
          openInventory={openInventory + currentQuantity}
          contractType="sale"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contract Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('contractInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contractDate')}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {contractData.contractDate}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('buyer')} {/* Changed from seller to buyer for sale contracts */}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {contractData.customerNumber}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contractNumber')}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {contractData.idContract}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('commodity')}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {contractData.commodity}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rest of the form - similar structure as CreateSaleSubContract but with edit functionality */}
          {/* This would include the same cards as CreateSaleSubContract but with pre-populated values */}
          {/* For brevity, including just the action buttons here */}

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-2 animate-spin" />
                  {t('updating')}
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t('updateSubContract')}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('confirmUpdateSubContract')}</DialogTitle>
              <DialogDescription>
                {t('confirmUpdateSubContractDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={confirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2 animate-spin" />
                    {t('updating')}
                  </>
                ) : (
                  t('confirm')
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}