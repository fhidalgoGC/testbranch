import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Printer, Edit, Trash2, Check } from 'lucide-react';
// Placeholder for number formatting - will use real formatNumber when available
const formatNumber = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export interface SubContract {
  id: string;
  contractNumber: string;
  quantity: number;
  unit: string;
  thresholds: {
    min: number;
    max: number;
  };
  basis: number;
  price: number;
  delivered: number;
  balance: number;
  totalPayment: number;
  borderColor: string;
  dotColor: string;
  textColor: string;
}

interface SubContractCardProps {
  subContract: SubContract;
  onView?: (id: string) => void;
  onPrint?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSettle?: (id: string) => void;
}

export default function SubContractCard({ 
  subContract, 
  onView, 
  onPrint, 
  onEdit, 
  onDelete, 
  onSettle 
}: SubContractCardProps) {
  const { t } = useTranslation();

  return (
    <Card className={`border-l-4 ${subContract.borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded ${subContract.dotColor}`}></div>
            <span className={`font-medium ${subContract.textColor}`}>
              ID Contract#{subContract.contractNumber}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-2 text-xs mb-3">
          <div>
            <p className="text-gray-500">{t('contractDetail.quantityUnits')}:</p>
            <p className="font-medium text-green-600">
              {formatNumber(subContract.quantity)} {subContract.unit}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t('contractDetail.thresholds')} ({subContract.unit}):</p>
            <p className="font-medium">
              Min: {formatNumber(subContract.thresholds.min)} | Max: {formatNumber(subContract.thresholds.max)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t('contractDetail.basis')}:</p>
            <p className="font-medium text-blue-600">$ {formatNumber(subContract.basis)}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('contractDetail.price')}:</p>
            <p className="font-medium text-green-600">$ {formatNumber(subContract.price)}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('contractDetail.delivered')}:</p>
            <p className="font-medium text-blue-600">
              {formatNumber(subContract.delivered)} {subContract.unit}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t('contractDetail.yourBalance')}:</p>
            <p className="font-medium">
              {formatNumber(subContract.balance)} {subContract.unit}
            </p>
          </div>
        </div>
        
        <div className="mb-3 pt-2 border-t">
          <p className="text-sm">
            <span className="text-gray-500">{t('contractDetail.totalPayment')}:</span>{' '}
            <span className="font-bold text-green-600">$ {formatNumber(subContract.totalPayment)}</span>
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => onView?.(subContract.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('view')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-gray-500 hover:bg-gray-600 text-white"
                  onClick={() => onPrint?.(subContract.id)}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('print')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => onEdit?.(subContract.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('edit')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => onDelete?.(subContract.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('delete')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => onSettle?.(subContract.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('settle')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}