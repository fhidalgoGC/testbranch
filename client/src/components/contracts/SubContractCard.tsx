import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Printer, Edit, Trash2, Check } from 'lucide-react';
// Placeholder for number formatting - will use real formatNumber when available
const formatNumber = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export interface FieldConfig {
  key: string;
  label: string;
  color: 'black' | 'blue' | 'green' | 'gray';
  isCalculated?: boolean;
  calculation?: (data: any) => number;
  unit?: string;
  format?: 'currency' | 'number';
}

export interface ProgressBarConfig {
  settledPercentage: (data: any) => number; // Función que retorna el porcentaje verde (settled)
  reservedPercentage: (data: any) => number; // Función que retorna el porcentaje azul (reserved)
  label?: string; // Label del progress bar (por defecto "Progress")
}

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
  [key: string]: any; // Para campos dinámicos
}

interface SubContractCardProps {
  subContract: SubContract;
  fields: FieldConfig[]; // Configuración de campos a mostrar
  progressBar?: ProgressBarConfig; // Configuración del progress bar
  onView?: (id: string) => void;
  onPrint?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSettle?: (id: string) => void;
}

export default function SubContractCard({ 
  subContract, 
  fields,
  progressBar,
  onView, 
  onPrint, 
  onEdit, 
  onDelete, 
  onSettle 
}: SubContractCardProps) {
  const { t } = useTranslation();

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'gray': return 'text-gray-600';
      default: return 'text-black dark:text-white';
    }
  };

  const formatValue = (value: any, format?: string, unit?: string) => {
    const formattedValue = typeof value === 'number' ? formatNumber(value) : value;
    const prefix = format === 'currency' ? '$ ' : '';
    const suffix = unit ? ` ${unit}` : '';
    return `${prefix}${formattedValue}${suffix}`;
  };

  return (
    <Card className={`border-l-4 ${subContract.borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded ${subContract.dotColor}`}></div>
            <span className={`font-medium ${subContract.textColor}`}>
              ID Contract#{subContract.contractNumber}
            </span>
          </div>
          <div className="text-base">
            <span className="font-bold text-gray-700 dark:text-gray-300">Quantity:</span>{' '}
            <span className="font-medium text-green-600">
              {formatNumber(subContract.quantity)} {subContract.unit}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-2 text-xs mb-3">
          {fields.map((field, index) => {
            let value;
            if (field.isCalculated && field.calculation) {
              value = field.calculation(subContract);
            } else {
              value = subContract[field.key];
            }
            
            return (
              <div key={index}>
                <p className="font-bold text-gray-700 dark:text-gray-300">{field.label}:</p>
                <p className={getColorClass(field.color)}>
                  {formatValue(value, field.format, field.unit)}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Dynamic Progress bar */}
        {progressBar && (
          <div className="mb-3">
            {(() => {
              // Componente completamente agnóstico - recibe porcentajes ya calculados
              const settledPercentage = progressBar.settledPercentage(subContract);
              const reservedPercentage = progressBar.reservedPercentage(subContract);
              
              // El componente no sabe qué significan estos porcentajes, solo los muestra
              const totalProgress = settledPercentage + reservedPercentage;
              
              return (
                <>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{progressBar.label || 'Progress'}</span>
                    <span>{Math.round(totalProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
                    {/* Green portion - first percentage */}
                    <div 
                      className="absolute left-0 bg-green-500 h-full transition-all duration-300"
                      style={{
                        width: `${settledPercentage}%`
                      }}
                    ></div>
                    {/* Blue portion - second percentage, starts after green */}
                    <div 
                      className="absolute bg-blue-500 h-full transition-all duration-300"
                      style={{
                        left: `${settledPercentage}%`,
                        width: `${reservedPercentage}%`
                      }}
                    ></div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
        
        {/* Total Payment and Action buttons on same row */}
        <div className="pt-2 border-t flex justify-between items-center">
          <p className="text-sm">
            <span className="text-gray-500">{t('contractDetail.totalPayment')}:</span>{' '}
            <span className="font-bold text-green-600">$ {formatNumber(subContract.totalPayment)}</span>
          </p>
          
          <div className="flex space-x-1">
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
        </div>
      </CardContent>
    </Card>
  );
}