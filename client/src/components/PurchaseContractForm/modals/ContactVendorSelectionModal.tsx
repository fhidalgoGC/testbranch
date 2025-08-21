import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContactVendor {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  type: 'individual' | 'company';
}

interface ContactVendorSelectionModalProps {
  onSelect: (vendor: ContactVendor) => void;
  selectedContactVendor?: string;
  error?: boolean;
}

// Datos fake de contact vendors
const FAKE_CONTACT_VENDORS: ContactVendor[] = [
  {
    id: '1',
    name: 'José Luis Martínez',
    company: 'Comercial Agropecuaria',
    email: 'jose.martinez@comercial.com',
    phone: '+52 55 2345 6789',
    location: 'México City, México',
    type: 'company'
  },
  {
    id: '2',
    name: 'Carmen Ruiz González',
    email: 'carmen.ruiz@email.com',
    phone: '+52 33 8765 4321',
    location: 'Guadalajara, México',
    type: 'individual'
  },
  {
    id: '3',
    name: 'Miguel Ángel Pérez',
    company: 'Distribuidora del Valle SA',
    email: 'm.perez@distribuidora.com',
    phone: '+52 81 6666 1234',
    location: 'Monterrey, México',
    type: 'company'
  },
  {
    id: '4',
    name: 'Sofía Elena Torres',
    company: 'Granos y Cereales del Norte',
    email: 'sofia.torres@granos.mx',
    phone: '+52 444 888 9900',
    location: 'San Luis Potosí, México',
    type: 'company'
  },
  {
    id: '5',
    name: 'Fernando García López',
    email: 'fernando.garcia@gmail.com',
    phone: '+52 477 234 5678',
    location: 'León, México',
    type: 'individual'
  },
  {
    id: '6',
    name: 'Patricia Moreno Silva',
    company: 'Comercializadora Agrícola del Centro',
    email: 'patricia.moreno@agricola.com',
    phone: '+52 462 777 8888',
    location: 'Celaya, México',
    type: 'company'
  }
];

export function ContactVendorSelectionModal({ onSelect, selectedContactVendor, error }: ContactVendorSelectionModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return FAKE_CONTACT_VENDORS;
    
    const search = searchTerm.toLowerCase();
    return FAKE_CONTACT_VENDORS.filter(
      vendor =>
        vendor.name.toLowerCase().includes(search) ||
        vendor.company?.toLowerCase().includes(search) ||
        vendor.email?.toLowerCase().includes(search) ||
        vendor.location?.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  const handleSelectVendor = (vendor: ContactVendor) => {
    onSelect(vendor);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedVendorData = FAKE_CONTACT_VENDORS.find(v => v.id === selectedContactVendor);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Input
            readOnly
            value={selectedVendorData ? `${selectedVendorData.name}${selectedVendorData.company ? ` - ${selectedVendorData.company}` : ''}` : ''}
            placeholder="Select Contact Vendor"
            className={`h-10 pr-10 cursor-pointer ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Contact Vendor
          </DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search contact vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-gray-300 focus:border-green-500"
          />
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {filteredVendors.length} contact vendors available
        </div>

        {/* Vendors List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No contact vendors found</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => handleSelectVendor(vendor)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {vendor.type === 'company' ? (
                        <Building2 className="h-4 w-4 text-blue-500" />
                      ) : (
                        <User className="h-4 w-4 text-green-500" />
                      )}
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {vendor.name}
                      </h3>
                      <Badge variant={vendor.type === 'company' ? 'default' : 'secondary'}>
                        {vendor.type === 'company' ? 'Empresa' : 'Individual'}
                      </Badge>
                    </div>
                    
                    {vendor.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {vendor.company}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {vendor.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{vendor.email}</span>
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{vendor.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}