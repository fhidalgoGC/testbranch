import { PurchaseSaleContract } from '@/types/purchaseSaleContract.types';

// Función para cargar los drafts desde localStorage al inicializar la store
export function loadDraftsFromStorage() {
  try {
    const saved = localStorage.getItem('contractDrafts');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading contract drafts from localStorage:', error);
  }
  
  return {
    purchaseDraft: null,
    saleDraft: null,
  };
}

// Función para limpiar un draft específico
export function clearDraftFromStorage(contractType: 'purchase' | 'sale') {
  try {
    const saved = localStorage.getItem('contractDrafts');
    if (saved) {
      const drafts = JSON.parse(saved);
      if (contractType === 'purchase') {
        drafts.purchaseDraft = null;
      } else {
        drafts.saleDraft = null;
      }
      localStorage.setItem('contractDrafts', JSON.stringify(drafts));
    }
  } catch (error) {
    console.error('Error clearing draft from localStorage:', error);
  }
}