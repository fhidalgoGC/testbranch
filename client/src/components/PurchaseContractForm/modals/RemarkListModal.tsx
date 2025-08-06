import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, Check } from 'lucide-react';

interface RemarkListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRemark: (remarkContent: string) => void;
  remarkType: string;
}

// Sample remark options based on type
const REMARK_OPTIONS: Record<string, string[]> = {
  delivery: [
    'Delivery must be completed during business hours',
    'Special handling required for fragile items',
    'Coordinate delivery with warehouse manager',
    'Loading dock access required',
    'Advance notice of 24 hours required'
  ],
  quality: [
    'Moisture content must not exceed 14%',
    'Foreign material tolerance: 2% maximum',
    'Test weight minimum 56 lbs/bushel',
    'No visible damage or contamination',
    'Grade certificate required'
  ],
  payment: [
    'Payment due within 30 days of delivery',
    'Early payment discount available',
    'Wire transfer preferred',
    'Invoice required before payment',
    'Credit terms subject to approval'
  ],
  inspection: [
    'Third-party inspection required',
    'Inspection at point of origin',
    'GAFTA inspection standards apply',
    'Sample retention for 90 days',
    'Inspection certificate mandatory'
  ],
  shipping: [
    'Container must be clean and dry',
    'Fumigation certificate required',
    'Loading supervision required',
    'Tarpaulin covering mandatory',
    'GPS tracking throughout transport'
  ],
  storage: [
    'Store in dry, ventilated warehouse',
    'Temperature control required',
    'Pest control measures in place',
    'FIFO inventory management',
    'Regular quality monitoring'
  ],
  grading: [
    'US Grade #2 Yellow Corn',
    'Protein content minimum 12%',
    'Oil content specification',
    'Color standards as per USDA',
    'Size uniformity requirements'
  ],
  contract: [
    'Force majeure clause applies',
    'Arbitration in case of disputes',
    'Governing law: [State/Country]',
    'Assignment rights restricted',
    'Confidentiality agreement required'
  ],
  general: [
    'All documents in English',
    'Compliance with local regulations',
    'Insurance coverage required',
    'Emergency contact information',
    'Regular progress updates'
  ],
  special: [
    'Organic certification required',
    'Non-GMO verification needed',
    'Halal/Kosher certification',
    'Sustainability requirements',
    'Traceability documentation'
  ]
};

export function RemarkListModal({ isOpen, onClose, onSelectRemark, remarkType }: RemarkListModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRemark, setSelectedRemark] = useState<string>('');

  const remarkOptions = REMARK_OPTIONS[remarkType] || [];
  
  const filteredRemarks = remarkOptions.filter(remark =>
    remark.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedRemark) {
      onSelectRemark(selectedRemark);
      setSelectedRemark('');
      setSearchTerm('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedRemark('');
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Remark Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Search Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Search Remarks
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-green-500"
              />
            </div>
          </div>

          {/* Remark List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Available Remarks
            </Label>
            <div className="space-y-2">
              {filteredRemarks.map((remark, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedRemark(remark)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRemark === remark
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">{remark}</span>
                    {selectedRemark === remark && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
              {filteredRemarks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No remarks found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSelect}
            disabled={!selectedRemark}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Select Remark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}