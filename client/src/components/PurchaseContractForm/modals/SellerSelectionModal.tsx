import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Seller {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  type: 'individual' | 'company';
}

interface SellerSelectionModalProps {
  onSelect: (seller: Seller) => void;
  selectedSeller?: string;
  error?: boolean;
}

// Datos fake de vendedores
const FAKE_SELLERS: Seller[] = [
  {
    id: '1',
    name: 'Juan Carlos Rodríguez',
    company: 'Agricola San Miguel',
    email: 'juan.rodriguez@sanmiguel.com',
    phone: '+52 55 1234 5678',
    location: 'Guadalajara, México',
    type: 'company'
  },
  {
    id: '2',
    name: 'María Elena Vásquez',
    email: 'maria.vasquez@email.com',
    phone: '+52 33 9876 5432',
    location: 'Zapopan, México',
    type: 'individual'
  },
  {
    id: '3',
    name: 'Roberto Fernández',
    company: 'Granos del Norte SA',
    email: 'r.fernandez@granoselnorte.com',
    phone: '+52 81 5555 0123',
    location: 'Monterrey, México',
    type: 'company'
  },
  {
    id: '4',
    name: 'Ana Patricia Morales',
    company: 'Cooperativa El Campo',
    email: 'ana.morales@elcampo.mx',
    phone: '+52 444 777 8899',
    location: 'San Luis Potosí, México',
    type: 'company'
  },
  {
    id: '5',
    name: 'Carlos David Herrera',
    email: 'carlos.herrera@outlook.com',
    phone: '+52 477 123 4567',
    location: 'León, México',
    type: 'individual'
  },
  {
    id: '6',
    name: 'Luisa Fernanda García',
    company: 'Agroexportadora del Bajío',
    email: 'luisa.garcia@agrobajio.com',
    phone: '+52 462 888 9999',
    location: 'Celaya, México',
    type: 'company'
  }
];

export function SellerSelectionModal({ onSelect, selectedSeller, error }: SellerSelectionModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSellers = useMemo(() => {
    if (!searchTerm.trim()) return FAKE_SELLERS;
    
    const search = searchTerm.toLowerCase();
    return FAKE_SELLERS.filter(
      seller =>
        seller.name.toLowerCase().includes(search) ||
        seller.company?.toLowerCase().includes(search) ||
        seller.email?.toLowerCase().includes(search) ||
        seller.location?.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  const handleSelectSeller = (seller: Seller) => {
    onSelect(seller);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedSellerData = FAKE_SELLERS.find(s => s.id === selectedSeller);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Input
            readOnly
            value={selectedSellerData ? `${selectedSellerData.name}${selectedSellerData.company ? ` - ${selectedSellerData.company}` : ''}` : ''}
            placeholder={t('selectSeller')}
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
            {t('selectSeller')}
          </DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('searchSellers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-gray-300 focus:border-green-500"
          />
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {filteredSellers.length} {t('sellersAvailable')}
        </div>

        {/* Sellers List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredSellers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('noSellersFound')}</p>
            </div>
          ) : (
            filteredSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => handleSelectSeller(seller)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {seller.type === 'company' ? (
                        <Building2 className="h-4 w-4 text-blue-500" />
                      ) : (
                        <User className="h-4 w-4 text-green-500" />
                      )}
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {seller.name}
                      </h3>
                      <Badge variant={seller.type === 'company' ? 'default' : 'secondary'}>
                        {seller.type === 'company' ? 'Empresa' : 'Individual'}
                      </Badge>
                    </div>
                    
                    {seller.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {seller.company}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {seller.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{seller.email}</span>
                        </div>
                      )}
                      {seller.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{seller.phone}</span>
                        </div>
                      )}
                      {seller.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{seller.location}</span>
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