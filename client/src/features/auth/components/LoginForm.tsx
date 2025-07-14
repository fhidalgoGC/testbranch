import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Loader2, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../../../common/hooks/useLocalStorage';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface SavedCredential {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [savedCredentials, setSavedCredentials] = useLocalStorage<SavedCredential[]>('savedCredentials', []);
  const { login, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const watchedRememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.email, data.password);
    
    if (success && data.rememberMe) {
      // Save credentials if login was successful and remember me is checked
      const existingCredIndex = savedCredentials.findIndex(cred => cred.email === data.email);
      
      if (existingCredIndex !== -1) {
        // Update existing credential
        const updatedCredentials = [...savedCredentials];
        updatedCredentials[existingCredIndex].password = data.password;
        setSavedCredentials(updatedCredentials);
      } else {
        // Add new credential
        setSavedCredentials([...savedCredentials, { email: data.email, password: data.password }]);
      }
    }
  };

  const handleCredentialSelect = (email: string) => {
    const credential = savedCredentials.find(cred => cred.email === email);
    if (credential) {
      setValue('email', credential.email);
      setValue('password', credential.password);
      setValue('rememberMe', true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 login-container">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 logo-container rounded-xl flex items-center justify-center shadow-lg">
              <Sprout className="text-white text-2xl" size={32} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('welcomeBack')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('getStartedSubtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('emailLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder={t('emailPlaceholder')}
                  className="pl-4 pr-10 py-3 form-input"
                />
                <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t('passwordLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={t('passwordPlaceholder')}
                  className="pl-4 pr-10 py-3 form-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={watchedRememberMe}
                onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
              />
              <Label htmlFor="rememberMe" className="text-sm text-gray-700">
                {t('rememberMe')}
              </Label>
            </div>

            {/* Saved Credentials Dropdown */}
            {savedCredentials.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t('savedCredentials')}
                </Label>
                <Select value={selectedCredential} onValueChange={handleCredentialSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCredential')} />
                  </SelectTrigger>
                  <SelectContent>
                    {savedCredentials.map((credential, index) => (
                      <SelectItem key={index} value={credential.email}>
                        {credential.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-primary py-3 px-4 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('signIn')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
