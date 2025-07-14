import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Sprout, FileText, TrendingUp, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { logout, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 logo-container rounded-lg flex items-center justify-center mr-3">
                <Sprout className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                GrainChain Dashboard
              </h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sprout className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('welcomeHome')}
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('homeDescription')}
            </p>
            
            {user && (
              <p className="text-sm text-gray-500 mb-8">
                {t('loggedInAs')}: {user.email}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="text-green-600 mx-auto mb-4" size={24} />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('contracts')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('contractsDesc')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="text-green-600 mx-auto mb-4" size={24} />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('analytics')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('analyticsDesc')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="text-green-600 mx-auto mb-4" size={24} />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('partners')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('partnersDesc')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
