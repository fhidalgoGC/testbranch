import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Languages, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface NavBarProps {
  title: string;
}

export default function NavBar({ title }: NavBarProps) {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('language') || 'es'
  );

  // Get user name from localStorage
  const getUserName = () => {
    const fullName = localStorage.getItem('representative_people_full_name');
    if (fullName) return fullName;
    
    const firstName = localStorage.getItem('representative_people_first_name') || '';
    const lastName = localStorage.getItem('representative_people_last_name') || '';
    return `${firstName} ${lastName}`.trim() || 'Usuario';
  };

  // Get user initials
  const getUserInitials = () => {
    const name = getUserName();
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setCurrentLanguage(lang);
  };

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <nav className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      {/* Left side - Page title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          {title}
        </h1>
      </div>

      {/* Right side - Language selector and User menu */}
      <div className="flex items-center space-x-4">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full p-0">
              <span className="text-lg">{currentLang?.flag}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 h-10 px-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-green-600 text-white text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getUserName()}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}