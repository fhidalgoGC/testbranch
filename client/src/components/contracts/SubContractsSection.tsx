import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SubContractCard, { SubContract, FieldConfig, ProgressBarConfig } from './SubContractCard';

interface SubContractsSectionProps {
  subContracts: SubContract[];
  fields: FieldConfig[];
  progressBar?: ProgressBarConfig;
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
  onNewSubContract,
  onViewSubContract,
  onPrintSubContract,
  onEditSubContract,
  onDeleteSubContract,
  onSettleSubContract
}: SubContractsSectionProps) {
  const { t } = useTranslation();

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
        <div className="h-full w-[300px] flex-shrink-0 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-lg font-medium">{t('contractDetail.position')}</h3>
          </div>
          <div className="flex items-center justify-center flex-1 p-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Pie Chart - Top */}
              <div className="flex items-center justify-center flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative">
                  <div className="absolute inset-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                      <div className="text-sm font-bold">100%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend - Bottom with scroll if needed */}
              <div className="flex flex-col space-y-2 items-center max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                {subContracts.map((contract) => (
                  <div key={contract.id} className="flex items-center text-xs whitespace-nowrap">
                    <div className={`w-3 h-3 rounded mr-2 flex-shrink-0 ${contract.dotColor}`}></div>
                    <span className="text-gray-700 dark:text-gray-300">{contract.contractNumber}</span>
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