import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import type { PurchaseContractFormData } from '@/types/purchaseContract.types';

interface RemarksSectionProps {
  addRemark: () => void;
  removeRemark: (index: number) => void;
  updateRemark: (index: number, value: string) => void;
}

export function RemarksSection({ 
  addRemark, 
  removeRemark, 
  updateRemark 
}: RemarksSectionProps) {
  const { t } = useTranslation();
  const { watch } = useFormContext<PurchaseContractFormData>();
  
  const remarks = watch('remarks') || [];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <MessageSquare className="w-5 h-5" />
          {t('remarks')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('remarks')}
          </Label>
          <Button
            type="button"
            onClick={addRemark}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('addComment')}
          </Button>
        </div>

        {remarks.map((remark, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={remark}
                onChange={(e) => updateRemark(index, e.target.value)}
                className="h-10"
                placeholder={`${t('comment')} ${index + 1}`}
              />
            </div>
            <Button
              type="button"
              onClick={() => removeRemark(index)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {remarks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('noRemarksYet')}. {t('clickAddRemark')}.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}