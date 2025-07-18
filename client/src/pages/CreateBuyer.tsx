import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Building2, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateBuyer } from '@/features/buyers/hooks/useCreateBuyer';
import type { BuyerFormData, CountryCode } from '@/features/buyers/types/create-buyer';

// Country codes data
const countryCodes: CountryCode[] = [
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
];

// Form validation schema
const createBuyerSchema = z.object({
  person_type: z.enum(['natural_person', 'juridical_person']),
  organization_name: z.string().max(90, 'Máximo 90 caracteres').optional(),
  first_name: z.string().min(1, 'Campo requerido').max(60, 'Máximo 60 caracteres'),
  last_name: z.string().min(1, 'Campo requerido').max(60, 'Máximo 60 caracteres'),
  email: z.string().email('Formato de email inválido').optional().or(z.literal('')),
  calling_code: z.string().optional(),
  phone_number: z.string().optional(),
}).refine((data) => {
  // Organization name is required for juridical persons
  if (data.person_type === 'juridical_person' && !data.organization_name?.trim()) {
    return false;
  }
  
  // If phone number is provided, calling code is required
  if (data.phone_number && !data.calling_code) {
    return false;
  }
  
  // If calling code is provided, phone number is required
  if (data.calling_code && !data.phone_number) {
    return false;
  }
  
  // Validate phone format based on country
  if (data.phone_number && data.calling_code) {
    if (data.calling_code === '+1') {
      // US format: 10 digits
      return /^\d{10}$/.test(data.phone_number);
    } else if (data.calling_code === '+52') {
      // Mexico format: 10 digits
      return /^\d{10}$/.test(data.phone_number);
    }
  }
  
  return true;
}, {
  message: 'Datos del formulario inválidos',
});

export default function CreateBuyer() {
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    idempotentBuyerId,
    isInitializing,
    initializationError,
    createBuyer,
    isCreating,
    error,
    isSuccess,
  } = useCreateBuyer();

  const form = useForm<BuyerFormData>({
    resolver: zodResolver(createBuyerSchema),
    defaultValues: {
      person_type: 'natural_person',
      organization_name: '',
      first_name: '',
      last_name: '',
      email: '',
      calling_code: '',
      phone_number: '',
    },
  });

  const personType = form.watch('person_type');
  const callingCode = form.watch('calling_code');
  const phoneNumber = form.watch('phone_number');

  const onSubmit = (data: BuyerFormData) => {
    createBuyer(data);
  };

  // Show success message when buyer is created
  if (isSuccess && !showSuccess) {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }

  if (isInitializing) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t('loading')}...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isInitializing && (!idempotentBuyerId || initializationError)) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Error al inicializar el formulario.
              {initializationError && (
                <>
                  <br />
                  <strong>Detalle:</strong> {initializationError}
                </>
              )}
              <br />
              Por favor, asegúrate de estar autenticado y vuelve a intentar.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/buyers">Volver a la lista</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="p-2">
              <Link href="/buyers">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {t('addBuyer')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Registra un nuevo comprador en el sistema
              </p>
            </div>
          </div>
          
          {/* Demo Mode Indicator & Test Auth Button */}
          <div className="flex items-center gap-2">
            {localStorage.getItem('jwt') === 'demo-jwt-token-for-testing' && (
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                Modo Demo
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Simulate real authentication for testing
                localStorage.setItem('jwt', 'real-jwt-token-example');
                localStorage.setItem('partition_key', 'real-partition-key');
                localStorage.setItem('user_id', 'test-user-123');
                window.location.reload();
              }}
            >
              Simular Auth Real
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <AlertDescription className="text-green-800 dark:text-green-200">
              ¡Comprador registrado exitosamente!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Error al registrar el comprador. Por favor, intenta nuevamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Información del Comprador
            </CardTitle>
            <CardDescription>
              Completa los datos del comprador que deseas registrar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Person Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Persona *
                </Label>
                <RadioGroup
                  value={form.watch('person_type')}
                  onValueChange={(value) => form.setValue('person_type', value as 'natural_person' | 'juridical_person')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="natural_person" id="natural" />
                    <Label htmlFor="natural" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Persona Natural
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="juridical_person" id="juridical" />
                    <Label htmlFor="juridical" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="w-4 h-4" />
                      Persona Jurídica
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Organization Name (only for juridical persons) */}
              {personType === 'juridical_person' && (
                <div className="space-y-2">
                  <Label htmlFor="organization_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre de la Organización *
                  </Label>
                  <Input
                    id="organization_name"
                    {...form.register('organization_name')}
                    className="bg-white/80 dark:bg-gray-800/80"
                    placeholder="Ingresa el nombre de la organización"
                    maxLength={90}
                  />
                  {form.formState.errors.organization_name && (
                    <p className="text-xs text-red-600">{form.formState.errors.organization_name.message}</p>
                  )}
                </div>
              )}

              {/* Name and Last Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre *
                  </Label>
                  <Input
                    id="first_name"
                    {...form.register('first_name')}
                    className="bg-white/80 dark:bg-gray-800/80"
                    placeholder="Ingresa el nombre"
                    maxLength={60}
                  />
                  {form.formState.errors.first_name && (
                    <p className="text-xs text-red-600">{form.formState.errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Apellido *
                  </Label>
                  <Input
                    id="last_name"
                    {...form.register('last_name')}
                    className="bg-white/80 dark:bg-gray-800/80"
                    placeholder="Ingresa el apellido"
                    maxLength={60}
                  />
                  {form.formState.errors.last_name && (
                    <p className="text-xs text-red-600">{form.formState.errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  className="bg-white/80 dark:bg-gray-800/80"
                  placeholder="ejemplo@correo.com"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </Label>
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <Select
                      value={form.watch('calling_code')}
                      onValueChange={(value) => form.setValue('calling_code', value)}
                    >
                      <SelectTrigger className="bg-white/80 dark:bg-gray-800/80">
                        <SelectValue placeholder="Código" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      {...form.register('phone_number')}
                      className="bg-white/80 dark:bg-gray-800/80"
                      placeholder={callingCode === '+1' ? '1234567890' : '1234567890'}
                      type="tel"
                    />
                  </div>
                </div>
                {(callingCode && phoneNumber && form.formState.errors.root) && (
                  <p className="text-xs text-red-600">Formato de teléfono inválido</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-agricultural hover:bg-agricultural-hover text-white px-6 py-2 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Registrar Comprador
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}