import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SubContractCard, { SubContract, FieldConfig, ProgressBarConfig } from './SubContractCard';

interface SubContractsSectionProps {
  subContracts: SubContract[];
  fields: FieldConfig[];
  progressBar?: ProgressBarConfig;
  parentContractFixed?: number; // Valor fixed del contrato padre para calcular porcentajes
  onNewSubContract?: () => void;
  onViewSubContract?: (id: string) => void;
  onPrintSubContract?: (id: string) => void;
  onEditSubContract?: (id: string) => void;
  onDeleteSubContract?: (id: string) => void;
  onSettleSubContract?: (id: string) => void;
}

export default function SubContractsSection({ 
  subContracts,
  fields,
  progressBar,
  parentContractFixed = 1000, // Default fallback
  onNewSubContract,
  onViewSubContract,
  onPrintSubContract,
  onEditSubContract,
  onDeleteSubContract,
  onSettleSubContract
}: SubContractsSectionProps) {
  const { t } = useTranslation();

  // Calculate percentages based on reserved amounts vs parent contract fixed amount
  const calculateChartData = () => {
    if (!subContracts.length || parentContractFixed <= 0) {
      return { segments: [], totalPercentage: 0 };
    }

    const segments = subContracts.map((contract) => {
      const reservedAmount = contract.reserved || 0;
      const percentage = (reservedAmount / parentContractFixed) * 100;
      return {
        id: contract.id,
        contractNumber: contract.contractNumber,
        percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
        reserved: reservedAmount,
        color: contract.dotColor,
        borderColor: contract.borderColor
      };
    });

    const totalPercentage = segments.reduce((sum, seg) => sum + seg.percentage, 0);
    
    return { segments, totalPercentage: Math.round(totalPercentage * 10) / 10 };
  };

  const chartData = calculateChartData();

  // Color mapping for SVG fill
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#10b981', 
    'bg-purple-500': '#8b5cf6',
    'bg-orange-500': '#f97316',
    'bg-red-500': '#ef4444',
    'bg-yellow-500': '#eab308',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-teal-500': '#14b8a6',
    'bg-gray-500': '#6b7280'
  };

  // Generate SVG path for pie chart segments
  const generatePieSegments = () => {
    if (chartData.segments.length === 0) return null;

    const radius = 56; // Slightly smaller radius for better fit
    const centerX = 64;
    const centerY = 64;
    let currentAngle = -90; // Start from top

    return chartData.segments.map((segment) => {
      if (segment.percentage === 0) return null;

      const angleStep = (segment.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleStep;

      // Convert angles to radians
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      // Calculate arc coordinates
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      // Large arc flag (1 if angle > 180 degrees)
      const largeArcFlag = angleStep > 180 ? 1 : 0;

      // Create SVG path
      const pathData = [
        `M ${centerX} ${centerY}`, // Move to center
        `L ${x1} ${y1}`, // Line to start point
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc to end point
        'Z' // Close path back to center
      ].join(' ');

      currentAngle = endAngle;

      const fillColor = colorMap[segment.color] || '#6b7280'; // Default gray

      return (
        <path
          key={segment.id}
          d={pathData}
          fill={fillColor}
          stroke="white"
          strokeWidth="2"
        />
      );
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('contractDetail.subContracts')}</h2>
        <Button 
          onClick={onNewSubContract}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('contractDetail.newSubContract')}
        </Button>
      </div>

      <div className="flex gap-6 h-[480px]">
        {/* Left Column - Pie Chart */}
        <div className="h-full w-[250px] flex-shrink-0 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-lg font-medium">{t('contractDetail.position')}</h3>
          </div>
          <div className="flex items-center justify-center flex-1 p-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Dynamic Pie Chart - Top */}
              <div className="flex items-center justify-center flex-shrink-0">
                <div className="w-32 h-32 relative">
                  <svg width="128" height="128" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      className="dark:stroke-gray-700"
                    />
                    {/* Dynamic segments */}
                    {generatePieSegments()}
                  </svg>
                  {/* Center text overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                      <div className="text-sm font-bold">{chartData.totalPercentage}%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Legend with percentages */}
              <div className="flex flex-col space-y-2 items-center max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                {chartData.segments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between text-xs whitespace-nowrap min-w-[180px]">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded mr-2 flex-shrink-0 ${segment.color}`}></div>
                      <span className="text-gray-700 dark:text-gray-300">{segment.contractNumber}</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{segment.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sub-contracts Cards with Border and Scroll */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full flex-1">
          <div className="h-full overflow-y-auto space-y-3 pr-2" style={{maxHeight: '420px'}}>
            {subContracts.map((subContract) => (
              <SubContractCard
                key={subContract.id}
                subContract={subContract}
                fields={fields}
                progressBar={progressBar}

                onView={onViewSubContract}
                onPrint={onPrintSubContract}
                onEdit={onEditSubContract}
                onDelete={onDeleteSubContract}
                onSettle={onSettleSubContract}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}