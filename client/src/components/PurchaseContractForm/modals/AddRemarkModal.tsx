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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface AddRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRemark: (remarkType: string, content: string) => void;
}

const REMARK_TYPES = [
  { value: 'delivery', label: 'Delivery Instructions' },
  { value: 'quality', label: 'Quality Requirements' },
  { value: 'payment', label: 'Payment Terms' },
  { value: 'inspection', label: 'Inspection Requirements' },
  { value: 'shipping', label: 'Shipping Instructions' },
  { value: 'storage', label: 'Storage Requirements' },
  { value: 'grading', label: 'Grading Specifications' },
  { value: 'contract', label: 'Contract Conditions' },
  { value: 'general', label: 'General Notes' },
  { value: 'special', label: 'Special Instructions' },
];

export function AddRemarkModal({ isOpen, onClose, onAddRemark }: AddRemarkModalProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string>('');
  const [remarkContent, setRemarkContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredRemarkTypes = REMARK_TYPES.filter(type =>
    type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedType && remarkContent.trim()) {
      const selectedRemarkType = REMARK_TYPES.find(type => type.value === selectedType);
      const formattedRemark = `${selectedRemarkType?.label}: ${remarkContent.trim()}`;
      onAddRemark(selectedType, formattedRemark);
      
      // Reset form
      setSelectedType('');
      setRemarkContent('');
      setSearchTerm('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedType('');
    setRemarkContent('');
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Remark
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Search Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Search Remark Types
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search remark types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-green-500"
              />
            </div>
          </div>

          {/* Remark Type Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Remark Type <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500">
                <SelectValue placeholder="Select remark type" />
              </SelectTrigger>
              <SelectContent>
                {filteredRemarkTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remark Content */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Remark Content <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter remark content..."
              value={remarkContent}
              onChange={(e) => setRemarkContent(e.target.value)}
              className="h-10 border-gray-300 focus:border-green-500"
            />
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
            onClick={handleAdd}
            disabled={!selectedType || !remarkContent.trim()}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Remark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}