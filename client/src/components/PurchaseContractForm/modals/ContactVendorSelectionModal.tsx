import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getContactVendors, type CrmPerson } from '@/services/crm-people.service';
import { User, Building2, Search, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContactVendorSelectionModalProps {
  onSelect: (vendor: { id: string; name: string; [key: string]: any }) => void;
  selectedContactVendor?: string;
  error?: boolean;
}

export const ContactVendorSelectionModal: React.FC<ContactVendorSelectionModalProps> = ({
  onSelect,
  selectedContactVendor,
  error = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [vendors, setVendors] = useState<CrmPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load vendors when modal opens
  useEffect(() => {
    if (isOpen && vendors.length === 0) {
      loadVendors();
    }
  }, [isOpen]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await getContactVendors({ page: 1, limit: 50 });
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching contact vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter vendors based on search term
  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendors;
    
    const search = searchTerm.toLowerCase();
    return vendors.filter(vendor => {
      const fullName = vendor.full_name?.toLowerCase() || '';
      const orgName = vendor.organization_name?.toLowerCase() || '';
      const email = vendor.emails?.find(e => e.type === 'principal')?.value?.toLowerCase() || '';
      
      return fullName.includes(search) || 
             orgName.includes(search) || 
             email.includes(search);
    });
  }, [vendors, searchTerm]);

  const handleSelectVendor = (vendor: CrmPerson) => {
    onSelect({
      id: vendor._id,
      name: vendor.full_name || `${vendor.first_name || ''} ${vendor.last_name || ''}`.trim(),
      ...vendor
    });
    setIsOpen(false);
  };

  const selectedVendorData = vendors.find(vendor => vendor._id === selectedContactVendor);

  return (
    <div className="space-y-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              error ? 'border-red-500 focus:border-red-500' : ''
            } ${
              selectedVendorData
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <div className="flex items-center space-x-2 w-full">
              {selectedVendorData ? (
                <>
                  {selectedVendorData.person_type === 'juridical_person' ? (
                    <Building2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <User className="h-4 w-4 text-green-500" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{selectedVendorData.full_name}</span>
                    {selectedVendorData.organization_name && (
                      <span className="text-xs text-gray-500">
                        {selectedVendorData.organization_name}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>{t('selectContactVendor')}</span>
                </>
              )}
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t('selectContactVendor')}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar contact vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2">Cargando contact vendors...</p>
              </div>
            )}

            {/* Results */}
            {!loading && (
              <div className="max-h-96 overflow-y-auto">
                {filteredVendors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron contact vendors</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredVendors.map((vendor) => {
                      const primaryEmail = vendor.emails?.find(e => e.type === 'principal')?.value;
                      const isSelected = vendor._id === selectedContactVendor;
                      
                      return (
                        <div
                          key={vendor._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => handleSelectVendor(vendor)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {vendor.person_type === 'juridical_person' ? (
                                <Building2 className="h-8 w-8 text-blue-500" />
                              ) : (
                                <User className="h-8 w-8 text-green-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                  {vendor.full_name || `${vendor.first_name || ''} ${vendor.last_name || ''}`.trim()}
                                </h3>
                                <Badge variant={vendor.person_type === 'juridical_person' ? 'default' : 'secondary'}>
                                  {vendor.person_type === 'juridical_person' ? 'Empresa' : 'Individual'}
                                </Badge>
                              </div>
                              
                              {vendor.organization_name && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {vendor.organization_name}
                                </p>
                              )}
                              
                              {primaryEmail && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Mail className="h-4 w-4" />
                                  <span>{primaryEmail}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{t('selectContactVendor')}</p>
      )}
    </div>
  );
};