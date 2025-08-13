import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Definir tipos para el estado de cada página
interface ContractsPageState {
  searchTerm: string;
  filters: Record<string, any>;
  selectedItems: string[];
  sortOrder: string;
  currentPage: number;
  pageSize: number;
}

interface ContractDetailState {
  activeTab: string;
  subContractFilters: Record<string, any>;
  expandedSections: string[];
}

interface CreateSubContractState {
  formData: Record<string, any>;
  selectedCommodity: string | null;
  selectedMeasurementUnit: string | null;
  pricingType: 'fixed' | 'basis';
}

interface PageState {
  purchaseContracts: ContractsPageState;
  contractDetail: Record<string, ContractDetailState>; // Por ID de contrato
  createSubContract: Record<string, CreateSubContractState>; // Por ID de contrato
  buyers: ContractsPageState;
  sellers: ContractsPageState;
  lastVisited: {
    path: string;
    timestamp: number;
  };
}

const initialContractsState: ContractsPageState = {
  searchTerm: '',
  filters: {},
  selectedItems: [],
  sortOrder: '',
  currentPage: 1,
  pageSize: 10,
};

const initialContractDetailState: ContractDetailState = {
  activeTab: 'general',
  subContractFilters: {},
  expandedSections: [],
};

const initialCreateSubContractState: CreateSubContractState = {
  formData: {},
  selectedCommodity: null,
  selectedMeasurementUnit: null,
  pricingType: 'fixed',
};

const initialState: PageState = {
  purchaseContracts: initialContractsState,
  contractDetail: {},
  createSubContract: {},
  buyers: initialContractsState,
  sellers: initialContractsState,
  lastVisited: {
    path: '/',
    timestamp: Date.now(),
  },
};

const pageStateSlice = createSlice({
  name: 'pageState',
  initialState,
  reducers: {
    // Acciones para página de contratos
    updateContractsState: (
      state,
      action: PayloadAction<{ 
        page: 'purchaseContracts' | 'buyers' | 'sellers';
        updates: Partial<ContractsPageState> 
      }>
    ) => {
      state[action.payload.page] = {
        ...state[action.payload.page],
        ...action.payload.updates,
      };
    },

    // Acciones para detalle de contrato
    updateContractDetailState: (
      state,
      action: PayloadAction<{ 
        contractId: string;
        updates: Partial<ContractDetailState> 
      }>
    ) => {
      const { contractId, updates } = action.payload;
      if (!state.contractDetail[contractId]) {
        state.contractDetail[contractId] = { ...initialContractDetailState };
      }
      state.contractDetail[contractId] = {
        ...state.contractDetail[contractId],
        ...updates,
      };
    },

    // Acciones para crear sub-contrato
    updateCreateSubContractState: (
      state,
      action: PayloadAction<{ 
        contractId: string;
        updates: Partial<CreateSubContractState> 
      }>
    ) => {
      const { contractId, updates } = action.payload;
      if (!state.createSubContract[contractId]) {
        state.createSubContract[contractId] = { ...initialCreateSubContractState };
      }
      state.createSubContract[contractId] = {
        ...state.createSubContract[contractId],
        ...updates,
      };
    },

    // Actualizar última página visitada
    setLastVisited: (state, action: PayloadAction<string>) => {
      state.lastVisited = {
        path: action.payload,
        timestamp: Date.now(),
      };
    },

    // Limpiar estado específico (opcional, para cuando ya no necesites datos)
    clearContractDetailState: (state, action: PayloadAction<string>) => {
      delete state.contractDetail[action.payload];
    },

    clearCreateSubContractState: (state, action: PayloadAction<string>) => {
      delete state.createSubContract[action.payload];
    },

    // Restaurar estado completo desde localStorage
    restoreState: (state, action: PayloadAction<Partial<PageState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  updateContractsState,
  updateContractDetailState,
  updateCreateSubContractState,
  setLastVisited,
  clearContractDetailState,
  clearCreateSubContractState,
  restoreState,
} = pageStateSlice.actions;

export default pageStateSlice.reducer;
export type { PageState, ContractsPageState, ContractDetailState, CreateSubContractState };