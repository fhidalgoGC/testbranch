import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Plus, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PurchaseContracts() {
  const { t } = useTranslation();

  return (
    <DashboardLayout title={t('purchaseContracts')}>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('purchaseContracts')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('purchaseContractsDescription')}
            </p>
          </div>
          
          <Link href="/purchase-contracts/create">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              {t('createContract')}
            </Button>
          </Link>
        </div>

        {/* Empty State for now */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('noContractsYet')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('createFirstContract')}
              </p>
              <Link href="/purchase-contracts/create">
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createFirstContractButton')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}