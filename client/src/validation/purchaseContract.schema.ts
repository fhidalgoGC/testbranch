import { z } from 'zod';

// Base validation schema for Purchase Contract
export const purchaseContractSchema = z.object({
  // Contract Info Section
  folio: z.string().min(3, 'Mínimo 3 caracteres').min(1, 'El folio es requerido'),
  type: z.enum(['purchase']).default('purchase'),
  sub_type: z.enum(['imported', 'domestic'], { required_error: 'Subtipo es requerido' }),
  commodity_id: z.string().min(1, 'ID del commodity es requerido'),
  commodity_name: z.string().min(1, 'Nombre del commodity es requerido'),
  characteristics_configuration_id: z.string().min(1, 'ID de configuración es requerido'),
  characteristics_configuration_name: z.string().min(1, 'Nombre de configuración es requerido'),
  grade: z.number().min(1, 'Mínimo grado 1').max(10, 'Máximo grado 10'),
  quantity: z.number().min(1, 'Cantidad mínima 1'),
  reference_number: z.string().min(1, 'Número de referencia es requerido'),
  measurement_unit_id: z.string().min(1, 'ID de unidad de medida es requerido'),
  measurement_unit: z.string().min(1, 'Unidad de medida es requerida'),
  contract_date: z.string().min(1, 'Fecha del contrato es requerida'),

  // Participants validation - minimum 2, must include 1 buyer and 1 seller
  participants: z
    .array(
      z.object({
        people_id: z.string().min(1, 'ID de persona es requerido'),
        name: z.string().min(1, 'Nombre es requerido'),
        role: z.enum(['buyer', 'seller'], { required_error: 'Rol es requerido' }),
      })
    )
    .min(2, 'Mínimo 2 participantes requeridos')
    .refine(
      (participants) => {
        const hasBuyer = participants.some(p => p.role === 'buyer');
        const hasSeller = participants.some(p => p.role === 'seller');
        return hasBuyer && hasSeller;
      },
      'Debe incluir al menos 1 comprador y 1 vendedor'
    ),

  // Price Schedule validation - minimum 1
  price_schedule: z
    .array(
      z.object({
        pricing_type: z.enum(['fixed', 'basis'], { required_error: 'Tipo de precio es requerido' }),
        price: z.number().min(0, 'Precio debe ser positivo'),
        basis: z.number().default(0),
        basis_operation: z.enum(['add', 'subtract']).default('add'),
        future_price: z.number().min(0, 'Precio futuro debe ser positivo'),
        option_month: z.string().min(1, 'Mes de opción es requerido'),
        option_year: z.number().min(new Date().getFullYear(), 'Año debe ser actual o futuro'),
        payment_currency: z.enum(['usd', 'mxn'], { required_error: 'Moneda es requerida' }),
        exchange: z.string().min(1, 'Intercambio es requerido'),
      })
    )
    .min(1, 'Al menos 1 horario de precios es requerido'),

  // Logistic Schedule validation - minimum 1
  logistic_schedule: z
    .array(
      z.object({
        logistic_payment_responsability: z.enum(['buyer', 'seller', 'other'], { required_error: 'Responsabilidad de pago es requerida' }),
        logistic_coordination_responsability: z.enum(['buyer', 'seller', 'other'], { required_error: 'Responsabilidad de coordinación es requerida' }),
        freight_cost: z.object({
          type: z.enum(['none', 'fixed', 'range'], { required_error: 'Tipo de costo es requerido' }),
          min: z.number().min(0, 'Mínimo debe ser positivo').default(0),
          max: z.number().min(0, 'Máximo debe ser positivo').default(0),
          cost: z.number().min(0, 'Costo debe ser positivo').default(0),
        }),
        payment_currency: z.enum(['usd', 'mxn'], { required_error: 'Moneda es requerida' }),
      })
    )
    .min(1, 'Al menos 1 horario logístico es requerido'),

  // Shipment & Delivery Section
  shipping_start_date: z.string().min(1, 'Fecha de inicio de envío es requerida'),
  shipping_end_date: z.string().min(1, 'Fecha de fin de envío es requerida'),
  application_priority: z.number().min(1, 'Prioridad mínima 1').max(10, 'Prioridad máxima 10'),
  delivered: z.string().min(1, 'Lugar de entrega es requerido'),
  transport: z.string().min(1, 'Transporte es requerido'),
  weights: z.string().min(1, 'Pesos es requerido'),
  inspections: z.string().min(1, 'Inspecciones es requerido'),
  proteins: z.string().min(1, 'Proteínas es requerido'),

  // Thresholds
  min_thresholds_percentage: z.number().min(0, 'Debe ser positivo').max(100, 'Máximo 100%'),
  max_thresholds_percentage: z.number().min(0, 'Debe ser positivo').max(100, 'Máximo 100%'),

  // Remarks Section
  remarks: z.array(z.string()).default([]),
}).refine(
  (data) => {
    if (!data.shipping_start_date || !data.shipping_end_date) return true;
    return new Date(data.shipping_end_date) >= new Date(data.shipping_start_date);
  },
  {
    message: 'Fecha de fin debe ser posterior a fecha de inicio',
    path: ['shipping_end_date'],
  }
);

export type PurchaseContractFormData = z.infer<typeof purchaseContractSchema>;