import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'wouter';

export default function CreateSubContract() {
  const { t } = useTranslation();
  const params = useParams();
  const [location, setLocation] = useLocation();
  
  const contractId = params.contractId;
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    contractNumber: '',
    quantity: '',
    unit: 'bu60',
    price: '',
    basis: '',
    future: '',
    minThreshold: '',
    maxThreshold: '',
    paymentTerms: '',
    deliveryLocation: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Aquí iría la lógica para crear el sub-contrato
      console.log('Creating sub-contract:', formData);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navegar de vuelta al detalle del contrato
      setLocation(`/purchase-contracts/${contractId}`);
      
    } catch (error) {
      console.error('Error creating sub-contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLocation(`/purchase-contracts/${contractId}`);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back')}</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('contractDetail.newSubContract')}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Contrato: {contractId}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primera fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractNumber">Número de Sub-Contrato</Label>
                  <Input
                    id="contractNumber"
                    type="text"
                    value={formData.contractNumber}
                    onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                    placeholder="SPC-2025-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">{t('contractDetail.quantity')}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="1000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad de Medida</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleInputChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bu60">bu60</SelectItem>
                      <SelectItem value="tons">Tons</SelectItem>
                      <SelectItem value="kg">Kilogramos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Segunda fila - Precios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('contractDetail.price')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="1,580.00"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basis">{t('contractDetail.basis')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <Input
                      id="basis"
                      type="number"
                      step="0.01"
                      value={formData.basis}
                      onChange={(e) => handleInputChange('basis', e.target.value)}
                      placeholder="1,630.00"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="future">{t('contractDetail.future')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <Input
                      id="future"
                      type="number"
                      step="0.01"
                      value={formData.future}
                      onChange={(e) => handleInputChange('future', e.target.value)}
                      placeholder="100.94"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tercera fila - Umbrales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minThreshold">Umbral Mínimo (%)</Label>
                  <Input
                    id="minThreshold"
                    type="number"
                    step="0.01"
                    value={formData.minThreshold}
                    onChange={(e) => handleInputChange('minThreshold', e.target.value)}
                    placeholder="85.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxThreshold">Umbral Máximo (%)</Label>
                  <Input
                    id="maxThreshold"
                    type="number"
                    step="0.01"
                    value={formData.maxThreshold}
                    onChange={(e) => handleInputChange('maxThreshold', e.target.value)}
                    placeholder="115.00"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Términos de Pago</Label>
                  <Input
                    id="paymentTerms"
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    placeholder="30 días"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryLocation">Lugar de Entrega</Label>
                  <Input
                    id="deliveryLocation"
                    type="text"
                    value={formData.deliveryLocation}
                    onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                    placeholder="Puerto de Veracruz"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Escriba cualquier información adicional..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Sub-Contrato
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}