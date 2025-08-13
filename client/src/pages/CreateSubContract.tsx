import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { useCreateSubContractState, usePageTracking, useNavigationHandler } from '@/hooks/usePageState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Package, DollarSign, Scale, Truck, FileText, Plus, X } from 'lucide-react';
import { Link } from 'wouter';

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
  contact: string;
  shipmentPeriod: string;
}

interface ThresholdRow {
  id: string;
  quantity: string;
  unit: string;
  date: string;
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
    basis: 1000,
    contact: '-',
    shipmentPeriod: '-'
  });

  const [actualQuantity, setActualQuantity] = useState('700.00');
  const [contractOpen, setContractOpen] = useState('700.00');
  const [totalValue, setTotalValue] = useState('2,733.00');
  const [thresholds, setThresholds] = useState<ThresholdRow[]>([
    { id: '1', quantity: '700.00', unit: 'Bushel 60', date: '08/13/2025' },
    { id: '2', quantity: '10', unit: 'Bushel 60', date: '630.00' },
    { id: '3', quantity: '10', unit: 'Bushel 60', date: '770.00' }
  ]);

  const addThresholdRow = () => {
    const newId = (thresholds.length + 1).toString();
    setThresholds([...thresholds, { id: newId, quantity: '', unit: 'Bushel 60', date: '' }]);
  };

  const removeThresholdRow = (id: string) => {
    setThresholds(thresholds.filter(row => row.id !== id));
  };

  const updateThresholdRow = (id: string, field: keyof ThresholdRow, value: string) => {
    setThresholds(thresholds.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleCancel = () => {
    setLocation(`/purchase-contracts/${contractId}`);
  };

  const handleCreateSubContract = () => {
    // TODO: Implement sub-contract creation logic
    console.log('Creating sub-contract with data:', {
      contractData,
      actualQuantity,
      contractOpen,
      totalValue,
      thresholds
    });
    setLocation(`/purchase-contracts/${contractId}`);
  };

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
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Contract Number</span>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono">
                  #{contractData.contractNumber}
                </Badge>
              </div>
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
                    <span className="text-sm font-bold">{contractData.quantityUnits.toLocaleString()} bushel</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      ${contractData.price.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Basis</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      ${contractData.basis.toFixed(2)} september2025
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contact</span>
                    <span className="text-sm font-medium">{contractData.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Shipment Period</span>
                    <span className="text-sm font-medium">{contractData.shipmentPeriod}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thresholds Section */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span>Thresholds</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={addThresholdRow}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {thresholds.map((threshold) => (
                    <div key={threshold.id} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4">
                        <Input
                          value={threshold.quantity}
                          onChange={(e) => updateThresholdRow(threshold.id, 'quantity', e.target.value)}
                          placeholder="Quantity"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Select
                          value={threshold.unit}
                          onValueChange={(value) => updateThresholdRow(threshold.id, 'unit', value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bushel 60">Bushel 60</SelectItem>
                            <SelectItem value="Bushel 56">Bushel 56</SelectItem>
                            <SelectItem value="Metric Ton">Metric Ton</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="date"
                          value={threshold.date}
                          onChange={(e) => updateThresholdRow(threshold.id, 'date', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeThresholdRow(threshold.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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

                {/* Input Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={actualQuantity}
                      onChange={(e) => setActualQuantity(e.target.value)}
                      placeholder="1,233.00"
                      className="text-sm"
                    />
                    <Select defaultValue="esd">
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="esd">esd</SelectItem>
                        <SelectItem value="other">other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value="1,500.00"
                      readOnly
                      className="text-sm bg-gray-50 dark:bg-gray-800"
                    />
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Total
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={totalValue}
                        onChange={(e) => setTotalValue(e.target.value)}
                        className="text-sm"
                      />
                      <Select defaultValue="x">
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="x">X</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value="08/13/2025"
                        type="date"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Contract
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={contractOpen}
                        onChange={(e) => setContractOpen(e.target.value)}
                        className="text-sm"
                      />
                      <Select defaultValue="bushel60">
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bushel60">Bushel 60</SelectItem>
                          <SelectItem value="bushel56">Bushel 56</SelectItem>
                        </SelectContent>
                      </Select>
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