import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PurchaseContract } from '@/types/purchaseContract.types';
import { loadDraftsFromStorage } from './contractDraftsUtils';

interface ContractDraftsState {
  purchaseDraft: Partial<PurchaseContract> | null;
  saleDraft: Partial<PurchaseContract> | null;
}

const initialState: ContractDraftsState = loadDraftsFromStorage();

const contractDraftsSlice = createSlice({
  name: 'contractDrafts',
  initialState,
  reducers: {
    updatePurchaseDraft: (state, action: PayloadAction<Partial<PurchaseContract>>) => {
      state.purchaseDraft = action.payload;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    updateSaleDraft: (state, action: PayloadAction<Partial<PurchaseContract>>) => {
      state.saleDraft = action.payload;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    clearPurchaseDraft: (state) => {
      console.log('🧹 REDUX: clearPurchaseDraft ejecutado - state ANTES:', state.purchaseDraft);
      state.purchaseDraft = null;
      console.log('🧹 REDUX: purchaseDraft limpiado - state DESPUÉS:', state.purchaseDraft);
      
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
        console.log('🧹 REDUX: localStorage actualizado');
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    clearSaleDraft: (state) => {
      state.saleDraft = null;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    clearAllDrafts: (state) => {
      state.purchaseDraft = null;
      state.saleDraft = null;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
  },
});

export const {
  updatePurchaseDraft,
  updateSaleDraft,
  clearPurchaseDraft,
  clearSaleDraft,
  clearAllDrafts,
} = contractDraftsSlice.actions;

export default contractDraftsSlice.reducer;