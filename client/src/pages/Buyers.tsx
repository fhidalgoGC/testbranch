import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { useBuyers } from '@/features/buyers/hooks/useBuyers';
import { Buyer } from '@/features/buyers/types';

export default function Buyers() {
  const { t } = useTranslation();
  const {
    data,
    isLoading,
    currentPage,
    pageSize,
    sortKey,
    sortDirection,
    searchValue,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSearchChange,
  } = useBuyers();

  const columns: Column<Buyer>[] = [
    {
      key: 'id',
      title: 'Id Comprador',
      render: (buyer) => {
        const id = buyer._id.toUpperCase();
        return id.slice(-6);
      },
      sortable: false,
    },
    {
      key: 'full_name',
      title: 'Nombre Completo',
      render: (buyer) => buyer.full_name || '-',
      sortable: true,
      sortKey: 'full_name',
    },
    {
      key: 'email',
      title: 'Correo Electrónico',
      render: (buyer) => {
        const email = buyer.emails && buyer.emails.length > 0 ? buyer.emails[0].value : null;
        return email || '-';
      },
      sortable: true,
      sortKey: 'emails.value',
    },
    {
      key: 'phone',
      title: 'Número de Teléfono',
      render: (buyer) => {
        if (buyer.phones && buyer.phones.length > 0) {
          const phone = buyer.phones[0];
          return `${phone.calling_code} ${phone.phone_number}`;
        }
        return '-';
      },
      sortable: true,
      sortKey: 'phones.calling_code',
    },
  ];

  return (
    <DashboardLayout title={t('buyers')}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('buyers')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('buyersDescription')}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          sortKey={sortKey}
          sortDirection={sortDirection}
          searchValue={searchValue}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
        />
      </div>
    </DashboardLayout>
  );
}