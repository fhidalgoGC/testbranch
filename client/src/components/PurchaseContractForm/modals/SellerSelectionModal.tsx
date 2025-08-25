import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GenericTable, type TableColumn } from '@/components/general/StandardTable';
import { getSellers, type CrmPerson } from '@/services/crm-people.service';
import { User, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SellerSelectionModalProps {
  onSelect: (seller: { id: string; name: string; [key: string]: any }) => void;
  selectedSeller?: string;
  error?: boolean;
}

export const SellerSelectionModal: React.FC<SellerSelectionModalProps> = ({
  onSelect,
  selectedSeller,
  error = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [sellers, setSellers] = useState<CrmPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Define table columns
  const columns: TableColumn<CrmPerson>[] = [
    {
      key: 'full_name',
      titleKey: 'name',
      sortable: true,
      width: '30%',
      render: (person: CrmPerson) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {person.person_type === 'juridical_person' ? (
              <Building2 className="h-8 w-8 text-blue-500" />
            ) : (
              <User className="h-8 w-8 text-green-500" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim()}
            </div>
            {person.organization_name && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {person.organization_name}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'person_type',
      titleKey: 'type',
      width: '15%',
      render: (person: CrmPerson) => (
        <Badge variant={person.person_type === 'juridical_person' ? 'default' : 'secondary'}>
          {person.person_type === 'juridical_person' ? t('company') : t('individual')}
        </Badge>
      )
    },
    {
      key: 'emails',
      titleKey: 'email',
      width: '25%',
      render: (person: CrmPerson) => {
        const primaryEmail = person.emails?.find(e => e.type === 'principal')?.value;
        return primaryEmail ? (
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{primaryEmail}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{t('noEmail')}</span>
        );
      }
    },
    {
      key: 'phones',
      titleKey: 'phone',
      width: '20%',
      render: (person: CrmPerson) => {
        const primaryPhone = person.phones?.find(p => p.type === 'principal');
        return primaryPhone ? (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{primaryPhone.calling_code} {primaryPhone.phone_number}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{t('noPhone')}</span>
        );
      }
    }
  ];

  // Define action items
  const actionItems = [
    {
      key: 'select',
      labelKey: 'select',
      action: (person: CrmPerson) => {
        onSelect({
          id: person._id,
          name: person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
          ...person
        });
        setIsOpen(false);
      },
      className: 'text-blue-600 hover:text-blue-900'
    }
  ];

  // Fetch sellers function
  const fetchSellers = async (params: {
    page: number;
    pageSize: number;
    search?: string;
  }) => {
    try {
      setLoading(true);
      const response = await getSellers({
        page: params.page,
        limit: params.pageSize
      });
      
      setSellers(response.data);
      setTotalElements(response._meta.totalCount);
      setTotalPages(response._meta.totalPages);
      
      return {
        data: response.data,
        total: response._meta.totalCount,
        totalPages: response._meta.totalPages
      };
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setSellers([]);
      setTotalElements(0);
      setTotalPages(0);
      return {
        data: [],
        total: 0,
        totalPages: 0
      };
    } finally {
      setLoading(false);
    }
  };

  // Load sellers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSellers({ page: 1, pageSize: 10 });
    }
  }, [isOpen]);

  const selectedSellerData = sellers.find(seller => seller._id === selectedSeller);

  return (
    <div className="space-y-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              error ? 'border-red-500 focus:border-red-500' : ''
            } ${
              selectedSellerData
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <div className="flex items-center space-x-2 w-full">
              {selectedSellerData ? (
                <>
                  {selectedSellerData.person_type === 'juridical_person' ? (
                    <Building2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <User className="h-4 w-4 text-green-500" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{selectedSellerData.full_name}</span>
                    {selectedSellerData.organization_name && (
                      <span className="text-xs text-gray-500">
                        {selectedSellerData.organization_name}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>{t('selectSeller')}</span>
                </>
              )}
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t('selectSeller')}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <GenericTable
              columns={columns}
              fetchData={fetchSellers}
              data={sellers}
              loading={loading}
              totalElements={totalElements}
              totalPages={totalPages}
              getItemId={(item) => item._id}
              showCreateButton={false}
              showFilters={false}
              actionMenuItems={actionItems}
              showActionColumn={true}
              showActionIcons={false}
              rowSpacing="normal"
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{t('selectSeller')}</p>
      )}
    </div>
  );
};