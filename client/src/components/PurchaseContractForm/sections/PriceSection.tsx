import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { usePurchaseContractNestedField, usePurchaseContract } from '@/context/PurchaseContractContext';
import { APP_CONFIG, CURRENCY_OPTIONS, formatNumber, parseFormattedNumber } from '@/environment/environment';

// Standardized exchange options
const EXCHANGE_OPTIONS = [
  {
    key: "chicagoBoardOfTrade",
    value: "Chicago Board of Trade",
    label: "Chicago Board of Trade"
  },
  {
    key: "kansasCityBoardOfTrade", 
    value: "Kansas City Board of Trade",
    label: "Kansas City Board of Trade"
  }
];

export function PriceSection() {
  const { t } = useTranslation();
  const { formData } = usePurchaseContract();
  
  // Get the current price schedule (assuming we're working with the first item)
  const currentSchedule = formData.price_schedule[0] || {};
  
  // Global state hooks for nested fields
  const [pricingType, setPricingType] = usePurchaseContractNestedField<'fixed' | 'basis'>('price_schedule.0.pricing_type');
  const [price, setPrice] = usePurchaseContractNestedField<number>('price_schedule.0.price');
  const [basis, setBasis] = usePurchaseContractNestedField<number>('price_schedule.0.basis');
  const [futurePrice, setFuturePrice] = usePurchaseContractNestedField<number>('price_schedule.0.future_price');
  const [optionMonth, setOptionMonth] = usePurchaseContractNestedField<string>('price_schedule.0.option_month');
  const [optionYear, setOptionYear] = usePurchaseContractNestedField<number>('price_schedule.0.option_year');
  const [paymentCurrency, setPaymentCurrency] = usePurchaseContractNestedField<'usd' | 'mxn'>('price_schedule.0.payment_currency');
  const [exchange, setExchange] = usePurchaseContractNestedField<string>('price_schedule.0.exchange');

  // Helper function to handle number input change with business logic
  const handleNumberChange = (field: 'price' | 'basis' | 'future_price', inputValue: string) => {
    if (inputValue.trim() === '') {
      // Handle empty input
      if (field === 'price') setPrice(0);
      else if (field === 'basis') setBasis(0);
      else if (field === 'future_price') setFuturePrice(0);
      return;
    }
    
    // Use parseFormattedNumber to handle the input according to configured format
    const numericValue = parseFormattedNumber(inputValue);
    
    if (numericValue !== null) {
      if (field === 'price') {
        setPrice(numericValue);
        // For fixed pricing: when price changes, copy value to future
        if (pricingType === 'fixed') {
          setFuturePrice(numericValue);
        }
      } else if (field === 'basis') {
        // For basis, respect the current sign from the toggle button
        const isNegative = (basis || 0) < 0;
        const newBasis = isNegative ? -Math.abs(numericValue) : Math.abs(numericValue);
        setBasis(newBasis);
        
        // For fixed pricing: when basis changes, calculate future = price - basis
        if (pricingType === 'fixed') {
          const currentPrice = price || 0;
          setFuturePrice(currentPrice - newBasis);
        }
      } else if (field === 'future_price') {
        setFuturePrice(numericValue);
      }
    }
  };

  // Helper function to format number on blur
  const handleNumberBlur = (field: 'price' | 'basis' | 'future_price', e: React.FocusEvent<HTMLInputElement>) => {
    const inputVal = e.target.value.trim();
    
    if (inputVal === '') {
      e.target.value = '';
      if (field === 'price') setPrice(0);
      else if (field === 'basis') setBasis(0);
      else if (field === 'future_price') setFuturePrice(0);
      return;
    }
    
    // Parse and format using environment configuration
    const numericValue = parseFormattedNumber(inputVal);
    if (numericValue !== null) {
      const formatted = formatNumber(Math.abs(numericValue));
      e.target.value = formatted;
      
      // Handle field updates with business logic
      if (field === 'price') {
        setPrice(numericValue);
        if (pricingType === 'fixed') {
          setFuturePrice(numericValue);
        }
      } else if (field === 'basis') {
        // For basis, respect the current sign from the toggle button
        const isNegative = (basis || 0) < 0;
        const newBasis = isNegative ? -Math.abs(numericValue) : Math.abs(numericValue);
        setBasis(newBasis);
        
        if (pricingType === 'fixed') {
          const currentPrice = price || 0;
          setFuturePrice(currentPrice - newBasis);
        }
      } else if (field === 'future_price') {
        setFuturePrice(numericValue);
      }
    }
  };

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <DollarSign className="w-5 h-5" />
          {t('priceContract')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Schedule Fields */}
        <div className="space-y-6">
          {/* Pricing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('pricingType')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={pricingType || 'fixed'}
                onValueChange={(value) => {
                  const newType = value as 'fixed' | 'basis';
                  setPricingType(newType);
                  
                  // Initialize values based on pricing type
                  if (newType === 'fixed') {
                    // For fixed: initialize all fields to 0
                    setPrice(0);
                    setBasis(0);
                    setFuturePrice(0);
                  } else if (newType === 'basis') {
                    // For basis: reset basis field
                    setBasis(0);
                  }
                }}
              >
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                  <SelectValue placeholder="Select pricing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="basis">Basis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Fields - Conditional rendering based on pricing_type */}
          {pricingType === 'basis' ? (
            /* Basis Type: Show only Basis field with +/- button */
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Basis <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {/* Basis Sign Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                  onClick={() => {
                    const currentBasis = basis || 0;
                    setBasis(-currentBasis);
                  }}
                >
                  {(basis || 0) >= 0 ? '+' : '-'}
                </Button>
                {/* Basis Input Field */}
                <Input
                  type="text"
                  inputMode="decimal"
                  defaultValue={basis !== null && basis !== undefined ? formatNumber(Math.abs(basis)) : ''}
                  onChange={(e) => handleNumberChange('basis', e.target.value)}
                  onBlur={(e) => handleNumberBlur('basis', e)}
                  onKeyDown={(e) => {
                    const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                    if (!allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="h-10 flex-1 border-gray-300 focus:border-green-500"
                  placeholder="0.00"
                  style={{
                    MozAppearance: 'textfield'
                  }}
                />
              </div>
            </div>
          ) : (
            /* Fixed Type: Show all fields with calculations */
            <div className="space-y-4">
              {/* Price Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  defaultValue={price ? formatNumber(price) : ''}
                  onChange={(e) => handleNumberChange('price', e.target.value)}
                  onBlur={(e) => handleNumberBlur('price', e)}
                  onKeyDown={(e) => {
                    const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                    if (!allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="h-10 border-gray-300 focus:border-green-500"
                  placeholder="0.00"
                  style={{
                    MozAppearance: 'textfield'
                  }}
                />
              </div>

              {/* Basis and Futures Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basis Field with +/- Button */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Basis
                  </Label>
                  <div className="flex items-center gap-2">
                    {/* Basis Sign Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                      onClick={() => {
                        const currentBasis = basis || 0;
                        const newBasis = -currentBasis;
                        setBasis(newBasis);
                        
                        // Recalculate future_price for fixed type
                        if (pricingType === 'fixed') {
                          const currentPrice = price || 0;
                          setFuturePrice(currentPrice - newBasis);
                        }
                      }}
                    >
                      {(basis || 0) >= 0 ? '+' : '-'}
                    </Button>
                    {/* Basis Input Field */}
                    <Input
                      type="text"
                      inputMode="decimal"
                      defaultValue={basis !== null && basis !== undefined ? formatNumber(Math.abs(basis)) : ''}
                      onChange={(e) => handleNumberChange('basis', e.target.value)}
                      onBlur={(e) => handleNumberBlur('basis', e)}
                      onKeyDown={(e) => {
                        const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','.','Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="h-10 flex-1 border-gray-300 focus:border-green-500"
                      placeholder="0.00"
                      style={{
                        MozAppearance: 'textfield'
                      }}
                    />
                  </div>
                </div>

                {/* Future Price Field (read-only for fixed type) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Futures (Calculated) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={futurePrice ? formatNumber(futurePrice) : ''}
                    readOnly
                    className="h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                    placeholder="Auto calculated"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option Month */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Option Month <span className="text-red-500">*</span>
              </Label>
              <Select
                value={optionMonth || ''}
                onValueChange={setOptionMonth}
              >
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Option Year */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Option Year <span className="text-red-500">*</span>
              </Label>
              <Select
                value={optionYear?.toString() || ''}
                onValueChange={(value) => setOptionYear(parseInt(value))}
              >
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Currency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('paymentCurrency')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentCurrency || APP_CONFIG.defaultCurrency}
                onValueChange={(value) => setPaymentCurrency(value as 'usd' | 'mxn')}
              >
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.key} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exchange */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Exchange <span className="text-red-500">*</span>
              </Label>
              <Select
                value={exchange || ''}
                onValueChange={setExchange}
              >
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  {EXCHANGE_OPTIONS.map((exchange) => (
                    <SelectItem key={exchange.key} value={exchange.value}>
                      {exchange.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}