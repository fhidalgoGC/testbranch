import { z } from 'zod';
import i18next from 'i18next';

// Function to create validation schema with current translations
export const createPurchaseContractSchema = () => {
  const t = (key: string, params?: any) => i18next.t(key, params);

  return z.object({
    // Contract Info Section
    type: z.enum(['purchase']).default('purchase'),
    sub_type: z.enum(['imported', 'domestic'], { required_error: t('selectOption') }),
    commodity: z.string().min(1, t('selectOption')),
    characteristics_configuration: z.string().min(1, t('selectOption')),
    grade: z.number().min(1, t('positiveNumber')).max(10, t('invalidFormat')),
    quantity: z.number().min(1, t('positiveNumber')),
    reference_number: z.string().min(1, t('fieldRequired')),
    measurement_unit: z.string().min(1, t('selectOption')),
    contract_date: z.string().min(1, t('fieldRequired')),
    min_thresholds_percentage: z.number().min(0, t('positiveNumber')).max(100, t('invalidFormat')),
    max_thresholds_percentage: z.number().min(0, t('positiveNumber')).max(100, t('invalidFormat')),
    seller: z.string().min(1, t('selectOption')),

    // Participants validation - minimum 2, must include 1 buyer and 1 seller
    participants: z
      .array(
        z.object({
          people_id: z.string().min(1, t('fieldRequired')),
          name: z.string().min(1, t('fieldRequired')),
          role: z.enum(['buyer', 'seller'], { required_error: t('selectOption') }),
        })
      )
      .min(2, t('minimumParticipants'))
      .refine(
        (participants) => {
          const hasBuyer = participants.some(p => p.role === 'buyer');
          const hasSeller = participants.some(p => p.role === 'seller');
          return hasBuyer && hasSeller;
        },
        t('buyerSellerRequired')
      ),

    // Price Schedule validation - minimum 1
    price_schedule: z
      .array(
        z.object({
          pricing_type: z.enum(['fixed', 'basis'], { required_error: t('selectOption') }),
          price: z.number().min(0, t('positiveNumber')),
          basis: z.number().default(0),
          basis_operation: z.enum(['add', 'subtract']).default('add'),
          future_price: z.number().min(0, t('positiveNumber')),
          option_month: z.string().min(1, t('fieldRequired')),
          option_year: z.number().min(new Date().getFullYear(), t('validDate')),
          payment_currency: z.enum(['usd', 'mxn'], { required_error: t('selectOption') }),
          exchange: z.string().min(1, t('fieldRequired')),
        })
      )
      .min(1, t('minimumPrices')),

    // Logistic Schedule validation - minimum 1
    logistic_schedule: z
      .array(
        z.object({
          logistic_payment_responsability: z.enum(['buyer', 'seller', 'other'], { required_error: t('selectOption') }),
          logistic_coordination_responsability: z.enum(['buyer', 'seller', 'other'], { required_error: t('selectOption') }),
          freight_cost: z.object({
            type: z.enum(['none', 'fixed', 'range'], { required_error: t('selectOption') }),
            min: z.number().min(0, t('positiveNumber')).default(0),
            max: z.number().min(0, t('positiveNumber')).default(0),
            cost: z.number().min(0, t('positiveNumber')).default(0),
          }),
          payment_currency: z.enum(['usd', 'mxn'], { required_error: t('selectOption') }),
        })
      )
      .min(1, t('minimumLogistics')),

    // Shipment & Delivery Section
    shipping_start_date: z.string().min(1, t('fieldRequired')),
    shipping_end_date: z.string().min(1, t('fieldRequired')),
    application_priority: z.number().min(1, t('positiveNumber')).max(10, t('invalidFormat')),
    delivered: z.string().min(1, t('fieldRequired')),
    transport: z.string().min(1, t('fieldRequired')),
    weights: z.string().optional(),
    inspections: z.string().optional(),
    proteins: z.string().optional(),

    // Remarks Section
    remarks: z.array(z.string()).default([]),
  }).refine(
    (data) => {
      if (!data.shipping_start_date || !data.shipping_end_date) return true;
      return new Date(data.shipping_end_date) >= new Date(data.shipping_start_date);
    },
    {
      message: t('endDateAfterStart'),
      path: ['shipping_end_date'],
    }
  );
};

// Base validation schema for Purchase Contract (backwards compatibility)
export const purchaseContractSchema = createPurchaseContractSchema();

export type PurchaseContractFormData = z.infer<ReturnType<typeof createPurchaseContractSchema>>;