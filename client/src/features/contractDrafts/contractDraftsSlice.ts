import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PurchaseSaleContract } from '@/types/purchaseSaleContract.types';
import { loadDraftsFromStorage } from './contractDraftsUtils';

interface ContractDraftsState {
  purchaseDraft: Partial<PurchaseSaleContract> | null;
  saleDraft: Partial<PurchaseSaleContract> | null;
  hasDraftPurchaseContract: boolean;
  hasDraftSaleContract: boolean;
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
      state.hasDraftPurchaseContract = false;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    setHasDraftPurchaseContract: (state, action: PayloadAction<boolean>) => {
      state.hasDraftPurchaseContract = action.payload;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    clearSaleDraft: (state) => {
      state.saleDraft = null;
      state.hasDraftSaleContract = false;
      // Persistir en localStorage
      try {
        localStorage.setItem('contractDrafts', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving contract drafts to localStorage:', error);
      }
    },
    setHasDraftSaleContract: (state, action: PayloadAction<boolean>) => {
      state.hasDraftSaleContract = action.payload;
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
  setHasDraftPurchaseContract,
  setHasDraftSaleContract,
  clearAllDrafts,
} = contractDraftsSlice.actions;

export default contractDraftsSlice.reducer;