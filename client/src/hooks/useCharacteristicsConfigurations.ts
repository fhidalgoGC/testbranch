import { useQuery } from '@tanstack/react-query';
import { CommoditiesService, type CharacteristicsConfigurationOption } from '@/services/commodities.service';

interface UseCharacteristicsConfigurationsParams {
  commodityId?: string;
  subcategoryId?: string;
}

export function useCharacteristicsConfigurations({ 
  commodityId, 
  subcategoryId 
}: UseCharacteristicsConfigurationsParams) {
  return useQuery<CharacteristicsConfigurationOption[]>({
    queryKey: ['characteristics-configurations', commodityId, subcategoryId],
    queryFn: async () => {
      if (!commodityId || !subcategoryId) {
        return [];
      }

      return await CommoditiesService.fetchCharacteristicsConfigurations({
        commodityId,
        subcategoryId
      });
    },
    enabled: !!(commodityId && subcategoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
}