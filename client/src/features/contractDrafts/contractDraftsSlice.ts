import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PurchaseSaleContract } from '@/types/purchaseSaleContract.types';
import { loadDraftsFromStorage } from './contractDraftsUtils';

interface ContractDraftsState {
  purchaseDraft: Partial<PurchaseSaleContract> | null;
  saleDraft: Partial<PurchaseSaleContract> | null;
}

const initialState: ContractDraftsState = loadDraftsFromStorage();

const contractDraftsSlice = createSlice({
  name: 'contractDrafts',
  initialState,
  reducers: {
    updatePurchaseDraft: (state, action: PayloadAction<Partial<PurchaseSaleContract>>) => {
      state.purchaseDraft = action.payload;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    updateSaleDraft: (state, action: PayloadAction<Partial<PurchaseSaleContract>>) => {
      state.saleDraft = action.payload;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    clearPurchaseDraft: (state) => {
      state.purchaseDraft = null;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
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