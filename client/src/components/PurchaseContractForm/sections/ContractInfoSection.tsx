import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { SellerSelectionModal } from '../modals/SellerSelectionModal';
import type { PurchaseContractFormData } from '@/types/purchaseContract.types';
import { formatNumber, parseFormattedNumber } from '@/environment/environment';

// Fake sellers data for display
const FAKE_SELLERS = [
  {
    id: '1',
    name: 'Juan Carlos Rodríguez',
    company: 'Agricola San Miguel',
    email: 'juan.rodriguez@sanmiguel.com',
    phone: '+52 55 1234 5678',
    location: 'Guadalajara, México',
    type: 'company' as const
  },
  {
    id: '2',
    name: 'María Elena Vásquez',
    email: 'maria.vasquez@email.com',
    phone: '+52 33 9876 5432',
    location: 'Zapopan, México',
    type: 'individual' as const
  },
  {
    id: '3',
    name: 'Roberto Fernández',
    company: 'Granos del Norte SA',
    email: 'r.fernandez@granoselnorte.com',
    phone: '+52 81 5555 0123',
    location: 'Monterrey, México',
    type: 'company' as const
  },
  {
    id: '4',
    name: 'Ana Patricia Morales',
    company: 'Cooperativa El Campo',
    email: 'ana.morales@elcampo.mx',
    phone: '+52 444 777 8899',
    location: 'San Luis Potosí, México',
    type: 'company' as const
  }
];

// Fake commodities data
const FAKE_COMMODITIES = [
  { id: 'corn-001', name: 'Yellow Corn #2' },
  { id: 'soy-001', name: 'Soybeans #1' },
  { id: 'wheat-001', name: 'Hard Red Winter Wheat' },
  { id: 'sorghum-001', name: 'Grain Sorghum' }
];

// Fake characteristics data
const FAKE_CHARACTERISTICS = [
  { id: 'std-001', name: 'Standard Grade' },
  { id: 'prem-001', name: 'Premium Grade' },
  { id: 'feed-001', name: 'Feed Grade' },
  { id: 'food-001', name: 'Food Grade' }
];

export function ContractInfoSection() {
  const { t } = useTranslation();
  const { register, formState: { errors }, watch, setValue } = useFormContext<PurchaseContractFormData>();
  const [isSellerModalOpen, setIsSellerModalOpen] = React.useState(false);
  
  const selectedSeller = watch('seller');
  const selectedSellerData = FAKE_SELLERS.find(s => s.id === selectedSeller);

  // Handle seller selection
  const handleSellerSelect = (seller: any) => {
    console.log('Seller selected:', seller);
    setValue('seller', seller.id);
    setIsSellerModalOpen(false);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('contractInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contract Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">
            Contract Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('sub_type') || ''}
            onValueChange={(value) => setValue('sub_type', value as 'direct' | 'imported' | 'importedFreight')}
          >
            <SelectTrigger className={`h-10 ${errors.sub_type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="imported">Imported</SelectItem>
              <SelectItem value="importedFreight">Imported Freight</SelectItem>
            </SelectContent>
          </Select>
          {errors.sub_type && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.sub_type.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Commodity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Commodity <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('commodity_id') || ''}
              onValueChange={(value) => {
                setValue('commodity_id', value);
                const commodity = FAKE_COMMODITIES.find(c => c.id === value);
                if (commodity) {
                  setValue('commodity_name', commodity.name);
                }
              }}
            >
              <SelectTrigger className={`h-10 ${errors.commodity_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {FAKE_COMMODITIES.map((commodity) => (
                  <SelectItem key={commodity.id} value={commodity.id}>
                    {commodity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.commodity_id && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.commodity_id.message}</p>
            )}
          </div>

          {/* Characteristics */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Characteristics <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('characteristics_configuration_id') || ''}
              onValueChange={(value) => {
                setValue('characteristics_configuration_id', value);
                const characteristic = FAKE_CHARACTERISTICS.find(c => c.id === value);
                if (characteristic) {
                  setValue('characteristics_configuration_name', characteristic.name);
                }
              }}
            >
              <SelectTrigger className={`h-10 ${errors.characteristics_configuration_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select characteristics" />
              </SelectTrigger>
              <SelectContent>
                {FAKE_CHARACTERISTICS.map((characteristic) => (
                  <SelectItem key={characteristic.id} value={characteristic.id}>
                    {characteristic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.characteristics_configuration_id && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.characteristics_configuration_id.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Grade */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Grade <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              max="10"
              {...register('grade', { valueAsNumber: true })}
              className={`h-10 ${errors.grade ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="1-10"
            />
            {errors.grade && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.grade.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              {...register('quantity', { valueAsNumber: true })}
              className={`h-10 ${errors.quantity ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="Enter quantity"
            />
            {errors.quantity && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.quantity.message}</p>
            )}
          </div>

          {/* Measurement Unit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Unit <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('measurement_unit') || ''}
              onValueChange={(value) => setValue('measurement_unit', value)}
            >
              <SelectTrigger className={`h-10 ${errors.measurement_unit ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bushel">Bushel</SelectItem>
                <SelectItem value="ton">Ton</SelectItem>
                <SelectItem value="cwt">CWT</SelectItem>
              </SelectContent>
            </Select>
            {errors.measurement_unit && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.measurement_unit.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reference Number */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Reference Number <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              {...register('reference_number')}
              className={`h-10 ${errors.reference_number ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="Enter reference number"
            />
            {errors.reference_number && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.reference_number.message}</p>
            )}
          </div>

          {/* Contract Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Contract Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              {...register('contract_date')}
              className={`h-10 ${errors.contract_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
            />
            {errors.contract_date && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.contract_date.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Min Threshold */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Min Threshold % <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              {...register('min_thresholds_percentage', { valueAsNumber: true })}
              className={`h-10 ${errors.min_thresholds_percentage ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="0-100"
            />
            {errors.min_thresholds_percentage && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.min_thresholds_percentage.message}</p>
            )}
          </div>

          {/* Max Threshold */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Max Threshold % <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              {...register('max_thresholds_percentage', { valueAsNumber: true })}
              className={`h-10 ${errors.max_thresholds_percentage ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
              placeholder="0-100"
            />
            {errors.max_thresholds_percentage && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.max_thresholds_percentage.message}</p>
            )}
          </div>
        </div>

        {/* Seller Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">
            Seller <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700">
              {selectedSellerData ? (
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedSellerData.name}</p>
                  {selectedSellerData.company && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedSellerData.company}</p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedSellerData.location}</p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No seller selected</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSellerModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Select Seller
            </button>
          </div>
          {errors.seller && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.seller.message}</p>
          )}
        </div>

        {/* Seller Selection Modal */}
        <SellerSelectionModal
          isOpen={isSellerModalOpen}
          onClose={() => setIsSellerModalOpen(false)}
          onSelect={handleSellerSelect}
          sellers={FAKE_SELLERS}
        />
      </CardContent>
    </Card>
  );
}