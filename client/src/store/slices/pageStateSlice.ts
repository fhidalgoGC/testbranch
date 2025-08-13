import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Jerarquía de navegación - define qué páginas son "padre" de otras
export const NAVIGATION_HIERARCHY: Record<string, string[]> = {
  // Páginas principales (nivel 0)
  'dashboard': [],
  'purchaseContracts': [],
  'buyers': [],
  'sellers': [],
  
  // Detalles de contratos (nivel 1 - hijos de purchaseContracts)
  'contractDetail': ['purchaseContracts'],
  
  // Crear sub-contrato (nivel 2 - hijo de contractDetail)
  'createSubContract': ['purchaseContracts', 'contractDetail'],
};

// Función para obtener el nivel jerárquico de una página
export const getPageLevel = (pageKey: string): number => {
  const hierarchy = NAVIGATION_HIERARCHY[pageKey] || [];
  return hierarchy.length;
};

// Función para verificar si una página es ancestro de otra
export const isAncestorPage = (ancestorPage: string, childPage: string): boolean => {
  const hierarchy = NAVIGATION_HIERARCHY[childPage] || [];
  return hierarchy.includes(ancestorPage);
};

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
  // Navegación jerárquica
  currentPagePath: string[]; // Ruta actual de páginas [nivel0, nivel1, nivel2]
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
  currentPagePath: [],
};

const pageStateSlice = createSlice({
  name: 'pageState',
  initialState,
  reducers: {
    // Acción para manejar navegación jerárquica
    navigateToPage: (state, action: PayloadAction<{ pageKey: string; contractId?: string }>) => {
      const { pageKey, contractId } = action.payload;
      const currentPath = [...state.currentPagePath];
      const newLevel = getPageLevel(pageKey);
      
      console.log(`Navegando a página: ${pageKey}, nivel: ${newLevel}, path actual:`, currentPath);
      
      // Si navegamos a un nivel más profundo (hacia adentro), mantener el estado
      if (newLevel > currentPath.length) {
        // Navegación hacia adentro: mantener estado anterior
        const newPath = [...NAVIGATION_HIERARCHY[pageKey], pageKey];
        state.currentPagePath = newPath;
        console.log('Navegación hacia adentro - manteniendo estado. Nuevo path:', newPath);
      } 
      // Si navegamos al mismo nivel o hacia afuera, limpiar estados del nivel abandonado
      else {
        const hierarchyForPage = NAVIGATION_HIERARCHY[pageKey] || [];
        const newPath = [...hierarchyForPage, pageKey];
        
        // Identificar qué páginas se están abandonando
        const abandonedPages = currentPath.slice(newLevel + 1);
        console.log('Páginas abandonadas:', abandonedPages);
        
        // Limpiar estados de las páginas abandonadas
        abandonedPages.forEach(abandonedPage => {
          console.log(`Limpiando estado de página abandonada: ${abandonedPage}`);
          
          if (abandonedPage === 'purchaseContracts') {
            state.purchaseContracts = { ...initialContractsState };
          } else if (abandonedPage === 'buyers') {
            state.buyers = { ...initialContractsState };
          } else if (abandonedPage === 'sellers') {
            state.sellers = { ...initialContractsState };
          } else if (abandonedPage === 'contractDetail' && contractId) {
            delete state.contractDetail[contractId];
          } else if (abandonedPage === 'createSubContract' && contractId) {
            delete state.createSubContract[contractId];
          }
        });
        
        state.currentPagePath = newPath;
        console.log('Navegación hacia afuera/mismo nivel - estado limpiado. Nuevo path:', newPath);
      }
      
      // Actualizar última página visitada
      state.lastVisited = {
        path: pageKey + (contractId ? `/${contractId}` : ''),
        timestamp: Date.now()
      };
    },
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
  navigateToPage,
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