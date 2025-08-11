import { MeasurementUnit, MeasurementUnitOption } from '@/types/measurementUnit.types';
import { environment } from '@/environment/environment';
import i18n from '@/common/utils/i18n';

export class MeasurementUnitsService {
  private static buildUrl(): string {
    const baseUrl = environment.CRM_BASE_URL;
    const endpoint = environment.UNIT_CONVERSIONS_ENDPOINT;
    const language = i18n.language === 'es' ? 'es' : 'en';
    const limit = environment.API_LIMIT;
    
    // Filter for weight and volume types
    const filter = encodeURIComponent(JSON.stringify({
      "type": {
        "$in": ["weight", "volume"]
      }
    }));
    
    return `${baseUrl}${endpoint}?limit=${limit}&language=${language}&filter=${filter}`;
  }

  private static buildHeaders(): Record<string, string> {
    const authToken = localStorage.getItem('authToken') || '';
    const partitionKey = localStorage.getItem('partition_key') || '';
    
    return {
      '_partitionkey': partitionKey,
      'accept': '*/*',
      'accept-language': 'es-419,es;q=0.9',
      'authorization': `Bearer ${authToken}`,
      'bt-organization': partitionKey,
      'bt-uid': partitionKey,
      'organization_id': partitionKey,
      'pk-organization': partitionKey,
      'Content-Type': 'application/json'
    };
  }

  public static async fetchMeasurementUnits(): Promise<MeasurementUnit[]> {
    try {
      const url = this.buildUrl();
      const headers = this.buildHeaders();

      console.log('Fetching measurement units from:', url);
      console.log('Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Measurement units response:', data);

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching measurement units:', error);
      return [];
    }
  }

  public static transformToOptions(units: MeasurementUnit[], filterType?: 'weight' | 'volume'): MeasurementUnitOption[] {
    const currentLanguage = i18n.language === 'es' ? 'es' : 'en';
    
    return units
      .filter(unit => !filterType || unit.type === filterType)
      .filter(unit => unit.active)
      .map(unit => {
        // Get the appropriate name based on current language
        const label = unit.names[currentLanguage] || unit.names.default || unit.slug;
        
        return {
          key: unit.slug,
          value: unit.slug,
          label: label,
          type: unit.type
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  public static async getWeightUnits(): Promise<MeasurementUnitOption[]> {
    const units = await this.fetchMeasurementUnits();
    return this.transformToOptions(units, 'weight');
  }

  public static async getVolumeUnits(): Promise<MeasurementUnitOption[]> {
    const units = await this.fetchMeasurementUnits();
    return this.transformToOptions(units, 'volume');
  }
}