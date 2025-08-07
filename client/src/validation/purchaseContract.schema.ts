import { z } from 'zod';

// Simplified validation schema without i18n complications
export const createPurchaseContractSchema = () => {
  return z.object({
    // Contract Info Section
    folio: z.string().optional(),
    type: z.enum(['purchase']).default('purchase'),
    sub_type: z.string().min(1, 'This field is required').refine(
      (val) => ['direct', 'imported', 'importedFreight'].includes(val),
      'This field is required'
    ),
    commodity_id: z.string().min(1, 'This field is required'),
    commodity_name: z.string().optional(),
    characteristics_configuration_id: z.string().min(1, 'This field is required'),
    characteristics_configuration_name: z.string().optional(),
    grade: z.number({ required_error: 'This field is required' }).min(1, 'This field is required').max(10, 'This field is required'),
    quantity: z.number({ required_error: 'This field is required' }).min(1, 'This field is required'),
    reference_number: z.string().min(1, 'This field is required'),
    measurement_unit_id: z.string().optional(),
    measurement_unit: z.string().min(1, 'This field is required'),
    contract_date: z.string().min(1, 'This field is required'),
    min_thresholds_percentage: z.number({ required_error: 'This field is required' }).min(0, 'This field is required').max(100, 'This field is required'),
    max_thresholds_percentage: z.number({ required_error: 'This field is required' }).min(0, 'This field is required').max(100, 'This field is required'),
    seller: z.string().min(1, 'This field is required'),

    // Participants validation - minimum 2, must include 1 buyer and 1 seller
    participants: z
      .array(
        z.object({
          people_id: z.string().min(1, 'This field is required'),
          name: z.string().min(1, 'This field is required'),
          role: z.string().min(1, 'This field is required').refine(
            (val) => ['buyer', 'seller'].includes(val),
            'This field is required'
          ),
        })
      )
      .min(2, 'Minimum 2 participants required')
      .refine(
        (participants) => {
          const hasBuyer = participants.some(p => p.role === 'buyer');
          const hasSeller = participants.some(p => p.role === 'seller');
          return hasBuyer && hasSeller;
        },
        'Must have at least one buyer and one seller'
      ),

    // Price Schedule validation - minimum 1
    price_schedule: z
      .array(
        z.object({
          pricing_type: z.string().min(1, 'This field is required').refine(
            (val) => ['fixed', 'basis'].includes(val),
            'This field is required'
          ),
          price: z.union([z.number(), z.null()]).refine(
            (val) => val !== null && val !== undefined,
            'This field is required'
          ).refine(
            (val) => val === null || val >= 1,
            'Must be at least 1'
          ),
          basis: z.union([z.number(), z.null()]).refine(
            (val) => val !== null && val !== undefined,
            'This field is required'
          ).refine(
            (val) => val === null || val >= 1,
            'Must be at least 1'
          ),
          basis_operation: z.enum(['add', 'subtract']).default('add'),
          future_price: z.union([z.number(), z.null()]).refine(
            (val) => val !== null && val !== undefined,
            'This field is required'
          ).refine(
            (val) => val === null || val >= 1,
            'Must be at least 1'
          ),
          option_month: z.string().min(1, 'This field is required'),
          option_year: z.number({ required_error: 'This field is required' }).min(new Date().getFullYear(), 'This field is required'),
          payment_currency: z.string().min(1, 'This field is required').refine(
            (val) => ['usd', 'mxn'].includes(val),
            'This field is required'
          ),
          exchange: z.string().min(1, 'This field is required'),
        })
      )
      .min(1, 'At least 1 price schedule is required'),

    // Logistic Schedule validation - minimum 1
    logistic_schedule: z
      .array(
        z.object({
          logistic_payment_responsability: z.string().min(1, 'This field is required').refine(
            (val) => ['buyer', 'seller', 'other'].includes(val),
            'This field is required'
          ),
          logistic_coordination_responsability: z.string().min(1, 'This field is required').refine(
            (val) => ['buyer', 'seller', 'other'].includes(val),
            'This field is required'
          ),
          freight_cost: z.object({
            type: z.string().min(1, 'This field is required').refine(
              (val) => ['none', 'fixed', 'variable'].includes(val),
              'This field is required'
            ),
            min: z.number().min(0, 'Must be a positive number').default(0),
            max: z.number().min(0, 'Must be a positive number').default(0),
            cost: z.number().min(0, 'Must be a positive number').default(0),
          }),
          payment_currency: z.string().min(1, 'This field is required').refine(
            (val) => ['usd', 'mxn'].includes(val),
            'This field is required'
          ),
        })
      )
      .min(1, 'At least 1 logistic schedule is required'),

    // Shipment & Delivery Section
    shipping_start_date: z.string().min(1, 'This field is required'),
    shipping_end_date: z.string().min(1, 'This field is required'),
    application_priority: z.number({ required_error: 'This field is required' }).min(1, 'This field is required').max(10, 'This field is required'),
    delivered: z.string().min(1, 'This field is required'),
    transport: z.string().min(1, 'This field is required'),
    weights: z.string().min(1, 'This field is required'),
    inspections: z.string().min(1, 'This field is required'),
    proteins: z.string().min(1, 'This field is required'),

    // Remarks Section
    remarks: z.array(z.string()).default([]),
  }).refine(
    (data) => {
      if (!data.shipping_start_date || !data.shipping_end_date) return true;
      return new Date(data.shipping_end_date) >= new Date(data.shipping_start_date);
    },
    {
      message: 'End date must be after start date',
      path: ['shipping_end_date'],
    }
  );
};

// Base validation schema for Purchase Contract (backwards compatibility)
export const purchaseContractSchema = createPurchaseContractSchema();

export type PurchaseContractFormData = z.infer<ReturnType<typeof createPurchaseContractSchema>>;