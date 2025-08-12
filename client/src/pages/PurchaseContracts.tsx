import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ContractsTable } from '@/components/contracts/ContractsTable';
import { PurchaseContract } from '@/types/purchaseContract.types';

export default function PurchaseContracts() {
  const { t } = useTranslation();
  
  // Lista de commodities disponibles
  const availableCommodities = [
    'YC - Yellow C...',
    'Soya 2025',
    'Semillas de gi...',
    'HRW - Wheat...',
    'Maíz Blanco',
    'SRW - Wheat ...',
    'Frijol amarillo 1'
  ];

  // Función para generar datos fake
  const generateMockContracts = (): PurchaseContract[] => {
    const commodities = [
      'YC - Yellow C...', 'Soya 2025', 'Semillas de gi...', 'HRW - Wheat...',
      'Maíz Blanco', 'SRW - Wheat ...', 'Frijol amarillo 1'
    ];
    
    const buyers = [
      'Andrés band...', 'Test Seller ...', 'Soja Corp', 'AgriTrade Ltd', 'Seeds Master Co',
      'Wheat Global Inc', 'Maíz Corporation', 'Harvest Innovations', 'Legume Traders',
      'Green Valley Farms', 'Prairie Holdings', 'Midwest Grain Co', 'Golden Harvest Inc',
      'Continental Agri', 'Premium Commodities', 'Global Trade Partners', 'Harvest Moon LLC',
      'Grain Masters Corp', 'Agricultural Solutions', 'Crop Excellence Inc', 'Farm Direct Trading'
    ];

    const measurementUnits = ['bu56', 'bu60', 'bu', 'kg', 'lb', 'mt'];
    const pricingTypes: ('fixed' | 'basis')[] = ['fixed', 'basis'];
    
    const contracts: PurchaseContract[] = [];
    
    for (let i = 0; i < 500; i++) {
      const contractNumber = 5000 - i;
      const commodityName = commodities[Math.floor(Math.random() * commodities.length)];
      const buyerName = buyers[Math.floor(Math.random() * buyers.length)];
      const pricingType = pricingTypes[Math.floor(Math.random() * pricingTypes.length)];
      const measurementUnit = measurementUnits[Math.floor(Math.random() * measurementUnits.length)];
      
      // Generar fechas aleatorias en 2025
      const startDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      const quantity = Math.floor(Math.random() * 5000) + 500;
      const price = pricingType === 'fixed' ? Math.floor(Math.random() * 5000) + 200 : 0;
      const basis = pricingType === 'basis' ? (Math.random() - 0.5) * 10 : 0; // Can be negative
      const basisOperation = basis >= 0 ? 'add' : 'subtract';
      
      contracts.push({
        id: `SPC-${contractNumber}`,
        type: 'purchase',
        sub_type: 'direct',
        folio: `SPC-${contractNumber}`,
        reference_number: `REF-${contractNumber}`,
        commodity: {
          commodity_id: `commodity-${i}`,
          name: commodityName
        },
        characteristics: {
          configuration_id: `config-${i}`,
          configuration_name: `Config ${commodityName}`
        },
        grade: Math.floor(Math.random() * 3) + 1,
        participants: [{
          people_id: `buyer-${i}`,
          name: buyerName,
          role: 'buyer'
        }],
        price_schedule: [{
          pricing_type: pricingType,
          price: price,
          basis: Math.abs(basis),
          basis_operation: basisOperation,
          future_price: Math.floor(Math.random() * 1000),
          option_month: ['Jan', 'Feb', 'Mar', 'Dec', 'Nov', 'Sep'][Math.floor(Math.random() * 6)],
          option_year: 2025,
          payment_currency: 'USD',
          exchange: ['CBOT', 'KCBT', 'MATIF', 'CME'][Math.floor(Math.random() * 4)]
        }],
        logistic_schedule: [{
          logistic_payment_responsability: 'buyer',
          logistic_coordination_responsability: 'seller',
          freight_cost: {
            type: 'fixed',
            min: 0,
            max: 0,
            cost: Math.floor(Math.random() * 200) + 40
          },
          payment_currency: 'USD'
        }],
        quantity: quantity,
        measurement_unit_id: measurementUnit,
        measurement_unit: measurementUnit,
        shipping_start_date: startDate.toISOString().split('T')[0],
        shipping_end_date: endDate.toISOString().split('T')[0],
        contract_date: startDate.toISOString().split('T')[0],
        application_priority: Math.floor(Math.random() * 3) + 1,
        delivered: ['FOB', 'CIF', 'EXW', 'CFR', 'DAP'][Math.floor(Math.random() * 5)],
        transport: ['Truck', 'Rail', 'Ship'][Math.floor(Math.random() * 3)],
        weights: 'Standard',
        inspections: 'Required',
        proteins: 'Standard',
        thresholds: {
          min_thresholds_percentage: Math.floor(Math.random() * 5) + 2,
          min_thresholds_weight: Math.floor(quantity * 0.05),
          max_thresholds_percentage: 95 + Math.floor(Math.random() * 3),
          max_thresholds_weight: Math.floor(quantity * 0.95)
        },
        status: 'active'
      });
    }
    
    return contracts;
  };

  // Generar 500 contratos fake
  const mockContracts = generateMockContracts();

  // Handler para acciones de contrato
  const handleContractAction = (action: 'view' | 'edit' | 'delete', contract: PurchaseContract) => {
    console.log(`Action: ${action}`, contract);
    // Aquí puedes implementar la lógica específica para cada acción
    switch (action) {
      case 'view':
        // Navegar a la vista de detalle del contrato
        break;
      case 'edit':
        // Navegar a la edición del contrato
        break;
      case 'delete':
        // Confirmar y eliminar contrato
        break;
    }
  };

  return (
    <DashboardLayout title={t('purchaseContracts')}>
      <ContractsTable
        contracts={mockContracts}
        title={t('purchaseContracts')}
        description={t('purchaseContractsDescription')}
        createButtonLabel={t('createContract')}
        createButtonHref="/purchase-contracts/create"
        showCreateButton={true}
        showFilters={true}
        availableCommodities={availableCommodities}
        onContractAction={handleContractAction}
      />
    </DashboardLayout>
  );
}