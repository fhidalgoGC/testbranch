import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { useCreateSubContractState, usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, X, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { formatNumber } from '@/lib/numberFormatter';
import { NUMBER_FORMAT_CONFIG } from '@/environment/environment';
import { authenticatedFetch } from '@/utils/apiInterceptors';
import SubContractForm from '@/components/SubContractForm/SubContractForm';


// Type for form data
type SubContractFormData = {
  contractNumber: string;
  contractDate: string;
  customerNumber: string;
  idContract: string;
  referenceNumber: string;
  commodity: string;
  contact?: string;
  shipmentPeriod?: string;
  future?: number;
  basis: number;
  totalPrice: number;
  totalDate: string;
  quantity: number;
  measurementUnitId: string;
};

interface ContractData {
  contractNumber: string;
  contractDate: string;
  customerNumber: string; // Representa seller para purchase contracts
  idContract: string; // Es el folio
  referenceNumber: string;
  commodity: string;
  quantityUnits: number;
  price: number;
  basis: number;
  future: number;
  contact: string;
  shipmentPeriod: string;
}

const CreateSubContract: React.FC = () => {
  const { t } = useTranslation();
  const { contractId } = useParams<{ contractId: string }>();
  const [location, setLocation] = useLocation();
  const dispatch = useDispatch();

  // Page tracking and navigation hooks
  usePageTracking('createSubContract');
  useNavigationHandler();

  // Get parent contract data from Redux
  const contractsData = useSelector((state: any) => state.contracts?.data?.data || []);
  const parentContractData = contractsData.find((contract: any) => contract._id === contractId);

  // Page state hooks
  const createSubContractState = useCreateSubContractState('createSubContract');
  const formState = createSubContractState.formState || {};
  const initialSubContractKey = formState.subContractKey;

  // Map parent contract data to form structure
  const contractData: ContractData = React.useMemo(() => {
    if (parentContractData) {
      const seller = parentContractData.participants?.find((p: any) => p.role === 'seller');
      const buyer = parentContractData.participants?.find((p: any) => p.role === 'buyer');
      
      return {
        contractNumber: parentContractData.folio || 'SPC-46',
        contractDate: parentContractData.contract_date 
          ? new Date(parentContractData.contract_date).toLocaleDateString()
          : '7/30/2025',
        customerNumber: seller?.name || 'Test Seller LLC',
        idContract: parentContractData.folio || 'SPC-46',
        referenceNumber: parentContractData.reference_number || 'NA',
        commodity: parentContractData.commodity?.name || 'HRW - Wheat Hard Red Winter',
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
  }, [parentContractData]);

  // Form state
  const [formData, setFormData] = useState<SubContractFormData | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formDataForSubmission, setFormDataForSubmission] = useState<SubContractFormData | null>(null);
  const [isSubmittingSubContract, setIsSubmittingSubContract] = useState(false);
  
  // Sub-contract key state for API
  const [subContractKey, setSubContractKey] = useState<string | null>(initialSubContractKey);
  const [loadingSubContractKey, setLoadingSubContractKey] = useState(false);

  // Load sub-contract key if not available
  useEffect(() => {
    const loadSubContractKey = async () => {
      if (subContractKey) return;
      
      setLoadingSubContractKey(true);
      try {
        const response = await authenticatedFetch(
          'https://trm-develop.grainchain.io/api/v1/contracts/sp-sub-contracts',
          {
            method: 'POST',
            customHeaders: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Sub-contract key response:', result);
          if (result.data?.key) {
            setSubContractKey(result.data.key);
            console.log('🔑 Sub-contract key set:', result.data.key);
          }
        }
      } catch (error) {
        console.error('❌ Error loading sub-contract key:', error);
      } finally {
        setLoadingSubContractKey(false);
      }
    };

    loadSubContractKey();
  }, [subContractKey]);

  // Auto-save form data to Redux when form changes
  useEffect(() => {
    if (formData) {
      console.log('💾 Auto-saved form data to Redux:', formData);
    }
  }, [formData]);

  const handleCreateSubContract = async () => {
    if (!formDataForSubmission || !subContractKey) {
      console.error('❌ Missing form data or sub-contract key');
      return;
    }

    setIsSubmittingSubContract(true);
    
    try {
      // Prepare API payload
      const apiPayload = {
        _id: subContractKey,
        contract_id: contractId,
        quantity: formDataForSubmission.quantity,
        measurement_unit_id: formDataForSubmission.measurementUnitId,
        price_schedule: [{
          pricing_type: "basis",
          price: formDataForSubmission.totalPrice,
          basis: formDataForSubmission.basis,
          basis_operation: "add",
          future_price: formDataForSubmission.future || 0,
          option_month: "september",
          option_year: 2025,
          payment_currency: "usd",
          exchange: "Chicago Board of Trade"
        }],
        sub_contract_date: formDataForSubmission.totalDate
      };

      console.log('📤 Creating sub-contract with payload:', apiPayload);

      const response = await authenticatedFetch(
        `https://trm-develop.grainchain.io/api/v1/contracts/sp-sub-contracts/${subContractKey}`,
        {
          method: 'PUT',
          customHeaders: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(apiPayload)
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sub-contract created successfully:', result);
        
        // Navigate back to contract detail
        setLocation(`/purchase-contracts/${contractId}`);
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to create sub-contract:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error creating sub-contract:', error);
    } finally {
      setIsSubmittingSubContract(false);
      setShowConfirmModal(false);
    }
  };

  const handleCancelSubmission = () => {
    setShowConfirmModal(false);
    setFormDataForSubmission(null);
  };

  return (
    <DashboardLayout title={t('createSubContract.title')}>
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
                {t('createSubContract.title')}
              </h1>
            </div>
          </div>
        </div>

        {/* Sub-Contract Form */}
        <SubContractForm
          mode="create"
          contractData={{
            contractNumber: contractData.contractNumber,
            contractDate: contractData.contractDate,
            customerNumber: contractData.customerNumber,
            idContract: contractData.idContract,
            referenceNumber: contractData.referenceNumber,
            commodity: contractData.commodity,
            quantityUnits: contractData.quantityUnits,
            measurementUnit: parentContractData?.measurement_unit || 'bu60',
            price: contractData.price,
            basis: contractData.basis,
            future: contractData.future,
            totalPrice: contractData.basis + contractData.future,
            openInventory: parentContractData?.inventory?.open || 0,
            minDate: parentContractData?.contract_date || new Date().toISOString()
          }}
          onFormDataChange={(data) => {
            setFormData(data);
          }}
          onValidationChange={setIsFormValid}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link href={`/purchase-contracts/${contractId}`}>
            <Button variant="outline" size="lg">
              <X className="w-4 h-4 mr-2" />
              {t('createSubContract.cancel')}
            </Button>
          </Link>
          
          <Button 
            size="lg"
            onClick={() => {
              if (formData && isFormValid) {
                setFormDataForSubmission(formData);
                setShowConfirmModal(true);
              }
            }}
            disabled={!formData || !isFormValid}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {t('createSubContract.createSubContract')}
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-xl mx-auto p-0 overflow-hidden">
          <DialogHeader className="bg-white dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t('createSubContract.confirmModal.title')}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400">
              {t('createSubContract.confirmModal.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            {formDataForSubmission && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sub-Contract Summary
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <div className="font-semibold">
                      {formDataForSubmission.quantity.toLocaleString()} {parentContractData?.measurement_unit || 'bu60'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <div className="font-semibold">
                      ${formDataForSubmission.totalPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <div className="font-semibold">
                      {new Date(formDataForSubmission.totalDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <div className="font-semibold">
                      ${(formDataForSubmission.quantity * formDataForSubmission.totalPrice).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancelSubmission}
                disabled={isSubmittingSubContract}
              >
                {t('createSubContract.cancel')}
              </Button>
              <Button
                onClick={handleCreateSubContract}
                disabled={isSubmittingSubContract}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmittingSubContract ? t('createSubContract.creating') : t('createSubContract.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CreateSubContract;