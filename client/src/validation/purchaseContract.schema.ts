import { z } from 'zod';

// Purchase contract validation schema with i18n support
export const createPurchaseContractSchema = (t: (key: string) => string) => {
  return z.object({
    // Contract Info Section
    folio: z.string().optional(),
    type: z.enum(['purchase']).default('purchase'),
    sub_type: z.string().min(1, t('fieldRequired')).refine(
      (val) => ['direct', 'imported', 'importedFreight'].includes(val),
      t('selectOption')
    ),
    commodity_id: z.string().min(1, t('fieldRequired')),
    commodity_name: z.string().optional(),
    characteristics_configuration_id: z.string().min(1, t('fieldRequired')),
    characteristics_configuration_name: z.string().optional(),
    grade: z.number({ required_error: t('fieldRequired') }).min(1, t('positiveNumber')).max(10, t('positiveNumber')),
    quantity: z.number({ required_error: t('fieldRequired') }).min(1, t('positiveNumber')),
    reference_number: z.string().optional(),
    measurement_unit_id: z.string().optional(),
    measurement_unit: z.string().min(1, t('fieldRequired')),
    contract_date: z.string().min(1, t('validDate')),
    min_thresholds_percentage: z.number({ required_error: t('fieldRequired') }).min(0, t('positiveNumber')).max(100, t('positiveNumber')),
    max_thresholds_percentage: z.number({ required_error: t('fieldRequired') }).min(0, t('positiveNumber')).max(100, t('positiveNumber')),
    seller: z.string().min(1, t('selectOption')),

    // Participants validation - minimum 2, must include 1 buyer and 1 seller
    participants: z
      .array(
        z.object({
          people_id: z.string().min(1, t('fieldRequired')),
          name: z.string().min(1, t('fieldRequired')),
          role: z.string().min(1, t('selectOption')).refine(
            (val) => ['buyer', 'seller'].includes(val),
            t('selectOption')
          ),
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
          pricing_type: z.string().min(1, t('fieldRequired')).refine(
            (val: string) => ['fixed', 'basis'].includes(val),
            t('selectOption')
          ).default('fixed'),
          price: z.union([z.number(), z.null()]).optional(),
          basis: z.union([z.number(), z.null()]).optional(),
          basis_operation: z.enum(['add', 'subtract']).default('add'),
          future_price: z.union([z.number(), z.null()]).optional(),
          option_month: z.string().min(1, t('fieldRequired')),
          option_year: z.number({ required_error: t('fieldRequired') }).min(new Date().getFullYear(), t('validDate')),
          payment_currency: z.string().min(1, t('fieldRequired')).refine(
            (val) => ['usd', 'mxn'].includes(val),
            t('fieldRequired')
          ),
          exchange: z.string().min(1, t('fieldRequired')),
        }).superRefine((data, ctx) => {
          // Conditional validation based on pricing_type
          if (data.pricing_type === 'fixed') {
            // For fixed type: price and future_price are required, basis is optional
            if (data.price === null || data.price === undefined) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['price'],
              });
            } else if (data.price <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('positiveNumber'),
                path: ['price'],
              });
            }
            
            if (data.future_price === null || data.future_price === undefined) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['future_price'],
              });
            }
            // Note: future_price can be negative, so no positive number validation
          } else if (data.pricing_type === 'basis') {
            // For basis type: basis is required, price and future_price are optional
            if (data.basis === null || data.basis === undefined) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('fieldRequired'),
                path: ['basis'],
              });
            }
            // Note: basis can be negative, so no positive number validation
          }
        })
      )
      .min(1, t('minimumPrices')),

    // Logistic Schedule validation - minimum 1
    logistic_schedule: z
      .array(
        z.object({
          logistic_payment_responsability: z.string().min(1, t('fieldRequired')).refine(
            (val) => ['buyer', 'seller', 'other'].includes(val),
            t('fieldRequired')
          ),
          logistic_coordination_responsability: z.string().min(1, t('fieldRequired')).refine(
            (val) => ['buyer', 'seller', 'other'].includes(val),
            t('fieldRequired')
          ),
          freight_cost: z.object({
            type: z.string().min(1, t('fieldRequired')).refine(
              (val: string) => ['none', 'fixed', 'variable'].includes(val),
              t('fieldRequired')
            ).default('none'),
            min: z.number().min(0, t('positiveNumber')).default(0),
            max: z.number().min(0, t('positiveNumber')).default(0),
            cost: z.number().min(0, t('positiveNumber')).default(0),
          }),
          payment_currency: z.string().min(1, t('fieldRequired')).refine(
            (val) => ['usd', 'mxn'].includes(val),
            t('fieldRequired')
          ),
        })
      )
      .min(1, t('minimumLogistics')),

    // Shipment & Delivery Section
    shipping_start_date: z.string().min(1, t('fieldRequired')),
    shipping_end_date: z.string().min(1, t('fieldRequired')),
    application_priority: z.number({ required_error: t('fieldRequired') }).min(1, t('fieldRequired')).max(10, t('fieldRequired')),
    delivered: z.string().min(1, t('fieldRequired')),
    transport: z.string().min(1, t('fieldRequired')),
    weights: z.string().min(1, t('fieldRequired')),
    inspections: z.string().min(1, t('fieldRequired')),
    proteins: z.string().min(1, t('fieldRequired')),

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

export type PurchaseContractFormData = z.infer<ReturnType<typeof createPurchaseContractSchema>>;