import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePurchaseContractField } from '@/context/PurchaseContractContext';
import { FileText } from 'lucide-react';

export function ContractInfoSection() {
  const { t } = useTranslation();
  
  // Use global state hooks for each field
  const [subType, setSubType] = usePurchaseContractField('sub_type');
  const [commodityId, setCommodityId] = usePurchaseContractField('commodity_id');
  const [commodityName, setCommodityName] = usePurchaseContractField('commodity_name');
  const [characteristicsId, setCharacteristicsId] = usePurchaseContractField('characteristics_configuration_id');
  const [characteristicsName, setCharacteristicsName] = usePurchaseContractField('characteristics_configuration_name');
  const [grade, setGrade] = usePurchaseContractField('grade');
  const [quantity, setQuantity] = usePurchaseContractField('quantity');
  const [referenceNumber, setReferenceNumber] = usePurchaseContractField('reference_number');
  const [measurementUnit, setMeasurementUnit] = usePurchaseContractField('measurement_unit');
  const [contractDate, setContractDate] = usePurchaseContractField('contract_date');
  const [seller, setSeller] = usePurchaseContractField('seller');
  const [minThreshold, setMinThreshold] = usePurchaseContractField('min_thresholds_percentage');
  const [maxThreshold, setMaxThreshold] = usePurchaseContractField('max_thresholds_percentage');

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <FileText className="w-5 h-5" />
          {t('contractInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sub Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">
            Contract Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={subType}
            onValueChange={setSubType}
          >
            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="imported">Imported</SelectItem>
              <SelectItem value="importedFreight">Imported Freight</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Commodity ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Commodity ID <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="Enter commodity ID"
            />
          </div>

          {/* Commodity Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Commodity Name
            </Label>
            <Input
              type="text"
              value={commodityName}
              onChange={(e) => setCommodityName(e.target.value)}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="Enter commodity name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Characteristics ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Characteristics ID <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={characteristicsId}
              onChange={(e) => setCharacteristicsId(e.target.value)}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="Enter characteristics ID"
            />
          </div>

          {/* Characteristics Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Characteristics Name
            </Label>
            <Input
              type="text"
              value={characteristicsName}
              onChange={(e) => setCharacteristicsName(e.target.value)}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="Enter characteristics name"
            />
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
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="1-10"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="Enter quantity"
            />
          </div>

          {/* Measurement Unit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Unit <span className="text-red-500">*</span>
            </Label>
            <Select
              value={measurementUnit}
              onValueChange={setMeasurementUnit}
            >
              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bushel">Bushel</SelectItem>
                <SelectItem value="ton">Ton</SelectItem>
                <SelectItem value="cwt">CWT</SelectItem>
              </SelectContent>
            </Select>
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
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="Enter reference number"
            />
          </div>

          {/* Contract Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Contract Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={contractDate}
              onChange={(e) => setContractDate(e.target.value)}
              className="h-10 border-gray-300 focus:border-green-500"
            />
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
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="0-100"
            />
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
              value={maxThreshold}
              onChange={(e) => setMaxThreshold(Number(e.target.value))}
              className="h-10 border-gray-300 focus:border-green-500"
              placeholder="0-100"
            />
          </div>
        </div>

        {/* Seller */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-white">
            Seller <span className="text-red-500">*</span>
          </Label>
          <Select
            value={seller}
            onValueChange={setSeller}
          >
            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
              <SelectValue placeholder="Select seller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seller1">Juan Carlos Rodríguez</SelectItem>
              <SelectItem value="seller2">María Elena Vásquez</SelectItem>
              <SelectItem value="seller3">Roberto Fernández</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}