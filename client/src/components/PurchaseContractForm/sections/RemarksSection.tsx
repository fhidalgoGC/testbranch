import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import type { PurchaseContractFormData } from '@/types/purchaseContract.types';
import { AddRemarkModal } from '../modals/AddRemarkModal';

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
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  
  const remarks = watch('remarks') || [];

  const handleAddRemark = (remarkType: string, content: string) => {
    addRemark();
    const currentRemarks = watch('remarks') || [];
    const newIndex = currentRemarks.length - 1;
    updateRemark(newIndex, content);
  };

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
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setIsRemarkModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Remarks
            </Button>
            <Button
              type="button"
              onClick={addRemark}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Comentario
            </Button>
          </div>
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

        <AddRemarkModal
          isOpen={isRemarkModalOpen}
          onClose={() => setIsRemarkModalOpen(false)}
          onAddRemark={handleAddRemark}
        />
      </CardContent>
    </Card>
  );
}