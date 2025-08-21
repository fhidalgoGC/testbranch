import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Trader {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  type: 'individual' | 'company';
}

interface TraderSelectionModalProps {
  onSelect: (trader: Trader) => void;
  selectedTrader?: string;
  error?: boolean;
}

// Datos fake de traders
const FAKE_TRADERS: Trader[] = [
  {
    id: '1',
    name: 'Ricardo Salinas Pliego',
    company: 'Trading Internacional SA',
    email: 'ricardo.salinas@trading.com',
    phone: '+52 55 3456 7890',
    location: 'México City, México',
    type: 'company'
  },
  {
    id: '2',
    name: 'Daniela Mendoza Cruz',
    email: 'daniela.mendoza@email.com',
    phone: '+52 33 9876 1234',
    location: 'Guadalajara, México',
    type: 'individual'
  },
  {
    id: '3',
    name: 'Alberto Jiménez Silva',
    company: 'Commodities del Pacífico',
    email: 'a.jimenez@commodities.com',
    phone: '+52 81 7777 2345',
    location: 'Monterrey, México',
    type: 'company'
  },
  {
    id: '4',
    name: 'Valentina Ramírez López',
    company: 'Global Trade Solutions',
    email: 'valentina.ramirez@globaltrade.mx',
    phone: '+52 444 999 1122',
    location: 'San Luis Potosí, México',
    type: 'company'
  },
  {
    id: '5',
    name: 'Sebastián Rivera Morales',
    email: 'sebastian.rivera@outlook.com',
    phone: '+52 477 345 6789',
    location: 'León, México',
    type: 'individual'
  },
  {
    id: '6',
    name: 'Camila Vargas Sánchez',
    company: 'Trading y Logística del Bajío',
    email: 'camila.vargas@tradingbajio.com',
    phone: '+52 462 888 7777',
    location: 'Celaya, México',
    type: 'company'
  }
];

export function TraderSelectionModal({ onSelect, selectedTrader, error }: TraderSelectionModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredTraders = useMemo(() => {
    if (!searchTerm.trim()) return FAKE_TRADERS;
    
    const search = searchTerm.toLowerCase();
    return FAKE_TRADERS.filter(
      trader =>
        trader.name.toLowerCase().includes(search) ||
        trader.company?.toLowerCase().includes(search) ||
        trader.email?.toLowerCase().includes(search) ||
        trader.location?.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  const handleSelectTrader = (trader: Trader) => {
    onSelect(trader);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedTraderData = FAKE_TRADERS.find(t => t.id === selectedTrader);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Input
            readOnly
            value={selectedTraderData ? `${selectedTraderData.name}${selectedTraderData.company ? ` - ${selectedTraderData.company}` : ''}` : ''}
            placeholder="Select Trader"
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
            Select Trader
          </DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search traders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-gray-300 focus:border-green-500"
          />
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {filteredTraders.length} traders available
        </div>

        {/* Traders List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredTraders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No traders found</p>
            </div>
          ) : (
            filteredTraders.map((trader) => (
              <div
                key={trader.id}
                onClick={() => handleSelectTrader(trader)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {trader.type === 'company' ? (
                        <Building2 className="h-4 w-4 text-blue-500" />
                      ) : (
                        <User className="h-4 w-4 text-green-500" />
                      )}
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {trader.name}
                      </h3>
                      <Badge variant={trader.type === 'company' ? 'default' : 'secondary'}>
                        {trader.type === 'company' ? 'Empresa' : 'Individual'}
                      </Badge>
                    </div>
                    
                    {trader.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {trader.company}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {trader.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{trader.email}</span>
                        </div>
                      )}
                      {trader.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{trader.phone}</span>
                        </div>
                      )}
                      {trader.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{trader.location}</span>
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