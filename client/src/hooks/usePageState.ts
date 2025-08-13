import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../app/store';
import { 
  updateContractsState, 
  updateContractDetailState, 
  updateCreateSubContractState,
  setLastVisited,
  restoreState,
  type ContractsPageState,
  type ContractDetailState, 
  type CreateSubContractState 
} from '../store/slices/pageStateSlice';

// Hook para estado de páginas de contratos (lista)
export const useContractsPageState = (page: 'purchaseContracts' | 'buyers' | 'sellers') => {
  const dispatch = useDispatch();
  const pageState = useSelector((state: RootState) => state.pageState[page]);

  const updateState = (updates: Partial<ContractsPageState>) => {
    dispatch(updateContractsState({ page, updates }));
  };

  return { pageState, updateState };
};

// Hook para estado de detalle de contrato
export const useContractDetailState = (contractId: string) => {
  const dispatch = useDispatch();
  const contractState = useSelector((state: RootState) => 
    state.pageState.contractDetail[contractId]
  );

  const updateState = (updates: Partial<ContractDetailState>) => {
    dispatch(updateContractDetailState({ contractId, updates }));
  };

  return { 
    contractState: contractState || { activeTab: 'general', subContractFilters: {}, expandedSections: [] }, 
    updateState 
  };
};

// Hook para estado de crear sub-contrato
export const useCreateSubContractState = (contractId: string) => {
  const dispatch = useDispatch();
  const formState = useSelector((state: RootState) => 
    state.pageState.createSubContract[contractId]
  );

  const updateState = (updates: Partial<CreateSubContractState>) => {
    dispatch(updateCreateSubContractState({ contractId, updates }));
  };

  return { 
    formState: formState || { 
      formData: {}, 
      selectedCommodity: null, 
      selectedMeasurementUnit: null, 
      pricingType: 'fixed' 
    }, 
    updateState 
  };
};

// Hook para restaurar estado desde localStorage
export const useStateRestoration = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restaurar estado al cargar la aplicación
    const savedState = localStorage.getItem('pageState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch(restoreState(parsedState));
      } catch (error) {
        console.error('Error restaurando estado:', error);
      }
    }
  }, [dispatch]);
};

// Hook para trackear última página visitada
export const usePageTracking = (currentPath: string) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLastVisited(currentPath));
  }, [currentPath, dispatch]);
};