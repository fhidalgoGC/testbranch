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
    if (fullName && fullName.trim().length > 0) {
      return fullName.trim();
    }
    
    const firstName = localStorage.getItem('representative_people_first_name');
    const lastName = localStorage.getItem('representative_people_last_name');
    
    if (firstName && firstName.trim().length > 0 && lastName && lastName.trim().length > 0) {
      return `${firstName.trim()} ${lastName.trim()}`;
    } else if (firstName && firstName.trim().length > 0) {
      return firstName.trim();
    } else if (lastName && lastName.trim().length > 0) {
      return lastName.trim();
    }
    
    return 'Usuario';
  };

  // Get user initials
  const getUserInitials = () => {
    const name = getUserName();
    
    if (name === 'Usuario') {
      return 'US';
    }
    
    const names = name.split(' ').filter(n => n.length > 0);
    
    if (names.length >= 2) {
      // Take first letter of first name and first letter of last name
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    } else if (names.length === 1 && names[0].length >= 2) {
      // If only one name, take first two letters
      return names[0].substring(0, 2).toUpperCase();
    } else if (names.length === 1 && names[0].length === 1) {
      // If only one letter, duplicate it
      return `${names[0][0]}${names[0][0]}`.toUpperCase();
    }
    
    return 'US';
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
    <nav className="h-12 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-700/30 px-6 flex items-center justify-between">
      {/* Left side - Page title */}
      <div className="flex items-center">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>

      {/* Right side - Language selector and User menu */}
      <div className="flex items-center space-x-2">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 rounded-sm p-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-all duration-100 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
            >
              <span className="text-sm">{currentLang?.flag}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 border-gray-200/50 dark:border-gray-700/50 shadow-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className="flex items-center space-x-2 cursor-pointer px-3 py-1.5 text-sm hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-all duration-100"
              >
                <span className="text-sm">{lang.flag}</span>
                <span className="font-normal">{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 h-8 px-2 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-all duration-100 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50 rounded-sm"
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-normal text-gray-700 dark:text-gray-300 max-w-24 truncate">
                {getUserName()}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500 transition-transform duration-100 group-data-[state=open]:rotate-180" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 border-gray-200/50 dark:border-gray-700/50 shadow-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <DropdownMenuItem 
              onClick={logout} 
              className="cursor-pointer px-3 py-1.5 text-sm hover:bg-red-50/60 dark:hover:bg-red-900/20 transition-all duration-100 text-red-600 dark:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}